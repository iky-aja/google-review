# 01-PRD.md

## PRODUCT REQUIREMENTS DOCUMENT (PRD) — HAVE TECH MVP

### 1. Product Overview
Have Tech adalah physical smart card premium yang menjembatani interaksi fisik dan digital. Satu kartu fisik memiliki NFC dan QR Code yang mengarah ke **satu permanent URL** dinamis. Server Have Tech akan mengubah destination URL (Google Review) berdasarkan status kartu. Pelanggan hanya tap/scan dan langsung diarahkan ke Google Review bisnis tersebut tanpa halaman perantara.

### 2. Problem Statement
Mengumpulkan Google Review sangat sulit karena friksi tinggi bagi pelanggan (harus mencari nama bisnis, lokasi, dll). Kartu QR statis tradisional tidak dapat diubah jika URL review berubah atau jika kartu dipindahkan ke cabang bisnis lain.

### 3. Product Vision
Menjadi standar infrastruktur fisik-digital yang paling premium dan andal untuk *customer feedback* di industri F&B dan layanan.

### 4. Goals
- Mengirimkan 15 kartu MVP yang berfungsi sempurna di lapangan.
- Menghilangkan friksi aktivasi (tanpa PIN/Activation Code).
- Memastikan keandalan *redirect engine* dengan latensi sangat rendah.
- Mencegah race condition dan enumerasi token.

### 5. Target Users
Business Owners (Restoran, Klinik, Salon) dan Admin Platform (Anda/Pengembang).

### 6. User Personas
- **Owner Budi:** Pemilik restoran, membeli kartu Have Tech, tap untuk pertama kalinya, login dengan Google, masukkan URL Google Review, dan kartu aktif.
- **Customer Andi:** Pelanggan di restoran Budi, tap kartu dengan HP, langsung diarahkan ke halaman Google Review.
- **Admin:** Operator platform yang membuat batch kartu, melakukan QC, dan mengelola status kartu.

### 7. User Stories
- Sebagai Owner, saya ingin tap kartu baru dan langsung login dengan akun Google saya, agar saya tidak perlu mengingat password baru.
- Sebagai Owner, saya ingin tap kartu yang sudah aktif dan langsung diarahkan ke Google Review, agar saya tahu pelanggan saya akan mengalami UX yang mulus.
- Sebagai Admin, saya ingin generate 15 token unik sekaligus agar bisa langsung dicetak QR dan diprogram NFC-nya.

### 8. User Journey
1. Admin generate 15 kartu (Status: UNASSIGNED).
2. Admin cetak QR dan tulis NFC dengan URL yang sama persis.
3. Owner menerima kartu fisik, tap dengan HP.
4. Halaman aktivasi Have Tech muncul.
5. Owner login dengan Google OAuth.
6. Owner mengisi nama bisnis dan URL Google Review.
7. Kartu berubah menjadi ACTIVE.
8. Pelanggan tap kartu, langsung redirect (HTTP 302) ke Google Review.

### 9. Functional Requirements
- **Redirect Engine:** Endpoint publik ringan `/c/:token` untuk menangani logic status dan HTTP 302.
- **Authentication:** Google OAuth only via NextAuth.js (Auth.js v5). Tidak ada Email/Password di MVP.
- **Atomic Claim:** Mekanisme pencegahan race condition saat dua user mengaktifkan kartu yang sama.
- **Admin Batch Generation:** Membuat N kartu sekaligus dengan public token random.

### 10. Non-Functional Requirements
- **Latency:** Redirect engine harus merespons < 100ms.
- **Security:** Public token tidak enumerable (min 8-10 char alfanumerik random).
- **Concurrency:** Aman dari race condition (database-level locking).

### 11. Business Rules
- 1 Kartu fisik = 1 URL fisik permanen.
- 1 Kartu (MVP) = 1 Bisnis / 1 URL Review.
- Kepemilikan kartu ditentukan oleh siapa yang berhasil melakukan aktivasi pertama (*possession-based*).

### 12. Authentication Requirements
- **Final Decision (MVP):** Google OAuth only via **NextAuth.js (Auth.js v5)**. Session-based authentication menggunakan Cookies (HttpOnly, Secure, SameSite=Lax).
- **Reason:** Zero-friction onboarding — satu tombol "Continue with Google", tidak ada form, tidak ada password yang perlu diingat.
- **Tidak ada di MVP:** Email/Password login, password_hash, forgot password, password reset, form register manual. Akun baru dibuat otomatis oleh NextAuth.js saat Google OAuth pertama kali.
- **Post-MVP:** Email/Password dapat ditambahkan sebagai metode autentikasi alternatif jika diperlukan.

### 13. Card Lifecycle
Valid state transitions:
- `UNASSIGNED` → `ACTIVE` (Melalui aktivasi)
- `ACTIVE` → `SUSPENDED` (Owner/Admin berhenti sementara)
- `SUSPENDED` → `ACTIVE` (Owner/Admin menyalakan kembali)
- `ACTIVE` / `SUSPENDED` → `ARCHIVED` (Kartu hilang/rusak permanen)
- `ARCHIVED` bersifat final. Tidak ada RESET di MVP.

### 14. Activation Flow
Scan/Tap → Server cek token → Jika `UNASSIGNED` → Render Halaman Aktivasi → Pilih Login Google → Isi Business Name & Review URL → Submit. 
Backend melakukan validasi URL, lalu *atomic update* status kartu menjadi `ACTIVE` dan binding ke `user_id` & `business_id`.

### 25. MVP Scope
Sesuai arahan: 15 kartu, Google OAuth, aktivasi tanpa PIN, redirect engine, basic dashboard, analytics hitungan dasar, tanpa reset/transfer.

### 26. Post-MVP Roadmap
- Card Reset & Transfer Ownership.
- Custom branded landing page sebelum redirect.
- Multi-business dalam 1 akun.
- Advanced analytics (grafik tren).

### 27. Acceptance Criteria
*   **Card Generation:** GIVEN Admin requests 15 cards WHEN system processes request THEN 15 unique, non-sequential public_tokens are generated and saved with status UNASSIGNED.
*   **QR/NFC Same URL:** GIVEN A card is generated WHEN physical provisioning occurs THEN the QR code and NFC chip must contain the exact identical URL (`havetech.id/c/:token`).
*   **Unassigned Activation:** GIVEN card status = UNASSIGNED WHEN user accesses `GET /c/:token` THEN system renders Activation Page without redirecting to Google.
*   **Authentication:** GIVEN User clicks "Login with Google" WHEN Google OAuth succeeds THEN system creates user session (HttpOnly Cookie) and redirects to activation/dashboard.
*   **Successful Activation:** GIVEN valid card token and valid Google URL WHEN user submits activation form THEN card status updates to ACTIVE, bound to user/business, and `activated_at` is set.
*   **Duplicate Concurrent Activation (Race Condition):** GIVEN card status = UNASSIGNED WHEN User A and User B submit activation concurrently THEN only ONE succeeds (200 OK), the other receives 409 Conflict.
*   **Active Redirect:** GIVEN card status = ACTIVE WHEN customer accesses `GET /c/:token` THEN system returns HTTP 302 with `Location` header set to `review_url`.
*   **Suspended Card:** GIVEN card status = SUSPENDED WHEN customer accesses `GET /c/:token` THEN system renders Branded Unavailable Page (HTTP 200 OK).
*   **Unauthorized Card Modification:** GIVEN User A owns Card X WHEN User A attempts to `PATCH /api/cards/:id` for Card Y (owned by User B) THEN system returns 403 Forbidden.
*   **Invalid Token:** GIVEN URL contains non-existent token WHEN user accesses `GET /c/:invalid_token` THEN system renders Branded 404 Not Found.
*   **Google URL Validation:** GIVEN user inputs `https://evil-phishing.com` as review URL WHEN activation form is submitted THEN system rejects with 400 Bad Request (Domain not in whitelist).
*   **Basic Analytics:** GIVEN card is ACTIVE WHEN customer accesses `GET /c/:token` (Redirect success) THEN a new record is inserted into `tap_logs` with `card_id`.

### GOOGLE REVIEW URL VALIDATION (FINAL RECOMMENDATION)
Tujuan: Cegah Open Redirect, pastikan domain Google, jangan tolak URL valid.
- **HTTPS Requirement:** WAJIB `https://`. Tolak `http://`.
- **Allowed Domains (Whitelist):** `g.page`, `search.google.com`, `google.com` (dan subdomain `www.google.com`, `maps.google.com`), `maps.app.goo.gl`, `goo.gl`.
- **Subdomain Handling:** Izinkan subdomain dari whitelist di atas (misal: `maps.google.com`). Tolak domain yang mirip tapi palsu (misal: `google.com.evil.com`).
- **URL Normalization:** Lakukan `trim()` pada input, pastikan ada prefix `https://`. Jika tidak ada, tambahkan otomatis sebelum validasi domain.
- **Redirect Validation:** Validasi dilakukan HANYA saat input/update oleh owner. Saat redirect engine berjalan, server langsung mengembalikan 302 ke URL yang tersimpan di DB (yang sudah dipastikan aman saat input).

### REMOVED FROM PREVIOUS DESIGN
1.  **Activation Code / PIN:** Dihapus total. Untuk MVP 15 kartu, friksi memasukkan PIN dianggap lebih merugikan UX daripada risiko pembajakan kartu yang dipajang. Pemilik fisik dianggap pemilik sah.
2.  **NFC vs QR Source Query Parameter (`?s=qr`):** Dihapus. Menggunakan URL yang benar-benar identik adalah prinsip utama. Menambahkan query param hanya untuk analytics dianggap merusak kebersihan arsitektur "1 URL permanen" dan tidak reliable karena kamera HP sering memotong query string.
3.  **Reset / Transfer Lifecycle:** Dihapus. Kartu yang rusak cukup di-ARCHIVE. Logika reset dan pemindahan kepemilikan menambah kompleksitas state di database dan UI yang tidak diperlukan untuk MVP.
4.  **Unnecessary Provisioning States (DB):** Dihapus. QC dan cetak fisik adalah proses di dunia nyata. Software cukup tahu kartu itu ada (UNASSIGNED) atau sudah aktif (ACTIVE). Tidak perlu state `QR_GENERATED` di DB.

### FINAL VERDICT
**READY FOR DEVELOPMENT**









