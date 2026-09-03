# 02-ARCHITECTURE.md

## ARCHITECTURE SPECIFICATION — HAVE TECH MVP

### 15. Database Model
*Tabel: `audit_logs` digabung untuk mencakup semua perubahan state, menggantikan `activation_logs`.*

```sql
users
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- google_id (VARCHAR, UNIQUE, INDEXED) -- wajib: hanya Google OAuth di MVP
- name (VARCHAR)
- role (VARCHAR, DEFAULT 'owner') -- nilai: 'owner' | 'admin'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
-- NOTE: password_hash tidak ada di MVP (Google OAuth only). Tambahkan post-MVP jika Email/Password didukung.

businesses
- id (UUID, PK)
- owner_id (UUID, FK -> users.id)
- name (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

cards
- id (UUID, PK)
- public_token (VARCHAR, UNIQUE, INDEXED) -- e.g., X7kP29Lm
- business_id (UUID, FK -> businesses.id, NULLABLE)
- review_url (TEXT, NULLABLE)
- status (ENUM: 'UNASSIGNED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED')
- created_at (TIMESTAMP)
- activated_at (TIMESTAMP, NULLABLE)
- updated_at (TIMESTAMP)

tap_logs
- id (BIGSERIAL, PK)
- card_id (UUID, FK -> cards.id, INDEXED)
- created_at (TIMESTAMP)

audit_logs
- id (UUID, PK)
- card_id (UUID, FK -> cards.id)
- user_id (UUID, FK -> users.id, NULLABLE)
- action (VARCHAR) -- e.g., 'GENERATED', 'ACTIVATED', 'SUSPENDED', 'URL_UPDATED'
- created_at (TIMESTAMP)
```

### 16. API Specification
**Public:**
- `GET /c/:token` → 302 Redirect / HTML Page.

**Auth:**
- `GET /api/auth/google` → Redirect to Google (via NextAuth.js).
- `GET /api/auth/callback/google` → Handle OAuth callback, create/update user, set HttpOnly Cookie (via NextAuth.js).
- `POST /api/auth/signout` → Clear session Cookie (via NextAuth.js).
- *Tidak ada endpoint register/login manual — akun dibuat otomatis saat Google OAuth pertama kali.*

**Activation & Management:**
- `POST /api/cards/claim` → Body: `{ public_token, business_name, review_url }`. (Authorized by User Session).
- `GET /api/dashboard/cards` → List user's cards & analytics.
- `PATCH /api/cards/:id` → Update `review_url` or `status`.

**Admin:**
- `POST /api/admin/cards/batch` → Body: `{ count: 15 }`.
- `GET /api/admin/cards` → List all cards.
- `PATCH /api/admin/cards/:id` → Update status.

### 17. Admin Requirements
- Generate batch kartu (input jumlah).
- Lihat daftar semua kartu dengan filter status.
- Suspend/Archive kartu mana pun.
- Export data dasar (token & status) ke CSV untuk keperluan cetak.

### 18. Dashboard Requirements
- Menampilkan nama bisnis dan daftar kartu milik user.
- Menampilkan `public_token` dan tombol "Copy URL".
- Menampilkan status kartu dengan badge (Active/Suspended).
- Tombol "Edit Google Review URL".
- Tombol "Suspend/Reactivate".
- Tombol "Download QR" (generate ulang QR dari token untuk backup).

### 19. Analytics Requirements
Hanya 4 metrik dasar per kartu:
- Total Taps
- Taps Today
- Taps This Week
- Taps This Month
Data didapat dari query agregasi tabel `tap_logs` berdasarkan `created_at`.

### 20. Security Requirements
- **IDOR Prevention:** Cek server-side pada endpoint `PATCH /api/cards/:id` untuk memastikan `card.business.owner_id` sama dengan `session.user_id`.
- **Atomic Claim:** Gunakan database transaction. Jika dua request hit bersamaan, `SELECT FOR UPDATE` pada row kartu. Request kedua akan menemukan status sudah berubah dan mendapat 409 Conflict.
- **Anti-Enumeration:** `public_token` harus di-generate menggunakan algoritma random yang aman secara kriptografis (min 8 karakter, campuran huruf besar/kecil & angka).

### 21. Privacy Requirements
- **Data Minimization:** Saat pelanggan tap (`GET /c/:token`), jangan simpan IP Address atau User-Agent. Cukup insert `card_id` dan `created_at` ke `tap_logs`.

### 22. Error Handling
- **404 Not Found:** Token tidak ada di DB.
- **400 Bad Request:** URL Google tidak valid saat aktivasi.
- **403 Forbidden:** User mencoba edit kartu milik orang lain.
- **409 Conflict:** Kartu sudah ACTIVE saat dicoba di-claim.

### 23. Edge Cases
- User scan QR via kamera HP, tapi HP punya multiple browser. Redirect 302 standar akan tetap berfungsi.
- Google mengubah format URL singkat. Mitigasi: Whitelist domain, bukan regex ketat.

### 24. Physical Provisioning Flow
1. Admin generate 15 kartu via Dashboard. DB menyimpan 15 `public_token` (Status: UNASSIGNED).
2. Admin export CSV berisi 15 URL `havetech.id/c/:token`.
3. Vendor/Cetak: Mencetak QR untuk token 1, menulis NDEF URI ke NFC chip untuk token 1 (URL SAMA PERSIS).
4. QC: Admin scan QR dan tap NFC. Jika keduanya mengarah ke halaman aktivasi yang sama, kartu lolos QC.
5. Distribusi ke Customer.

### FINAL ARCHITECTURE DECISIONS

| Area | Final Decision | Reason | MVP Priority |
| :--- | :--- | :--- | :--- |
| **URL Structure** | `/c/:token` (Single URL for QR & NFC) | Kesederhanaan, menjaga prinsip 1 kartu = 1 URL. | P0 |
| **Ownership Proof** | Possession-based (No PIN/Code) | Mengurangi friksi onboarding untuk 15 kartu uji coba. | P0 |
| **Concurrency Control** | Database Transaction (SELECT FOR UPDATE) | Satu-satunya cara aman mencegah double-claim tanpa menambah kompleksitas app. | P0 |
| **Authentication** | Session-based (HttpOnly Cookie) | Aman dari XSS, cocok untuk SPA dashboard, mendukung Google OAuth. | P0 |
| **Token Generation** | Cryptographically Secure Random (8-10 char) | Anti-enumerasi, mencegah tebakan URL (`/c/0001` vs `/c/X7kP29Lm`). | P0 |
| **Analytics** | Basic count from `tap_logs` (No source tracking) | Tidak bisa membedakan NFC/QR jika URL sama. Hindari data palsu. | P0 |
| **URL Validation** | Domain Whitelist (Google domains only) | Mencegah platform menjadi open redirector untuk phishing. | P0 |
| **Lifecycle** | UNASSIGNED -> ACTIVE -> SUSPENDED -> ARCHIVED | Cukup untuk MVP. Tidak ada Reset. | P0 |

---