# 03-PAGE-FLOW-UX.md

## HAVE TECH — PAGE FLOW & UX SPECIFICATION

### 1. INFORMATION ARCHITECTURE

**Public Routes**
*   `/` — Landing page produk.
*   `/c/:token` — Card Gateway (Core Redirect + Activation Experience untuk state UNASSIGNED).
*   `/login` — Autentikasi pemilik bisnis via Google OAuth. Menangani login **dan** registrasi baru — tidak ada route `/register` terpisah.
*   *Note: Tidak ada `/activate/:token` sebagai route terpisah. Seluruh activation experience terjadi di `/c/:token`.*

**Owner Routes**
*   `/dashboard` — Ringkasan statistik bisnis dan kartu.
*   `/cards` — Daftar kartu milik owner.
*   `/cards/:id` — Detail dan manajemen kartu.
*   `/settings` — Pengaturan akun dan bisnis.

**Admin Routes**
*   `/admin` — Ringkasan inventaris platform.
*   `/admin/cards` — Daftar seluruh kartu di sistem.
*   `/admin/cards/:id` — Inspeksi dan manajemen kartu oleh admin.
*   `/admin/cards/generate` — Batch generasi kartu baru.

**Catatan Arsitektur:**
*   **Edit Review URL**: Tidak menggunakan dedicated page. Menggunakan **Modal/Drawer** di `/cards/:id` agar user tidak kehilangan konteks halaman detail.
*   **Generate Cards (Admin)**: Menggunakan dedicated route `/admin/cards/generate` karena memerlukan input khusus dan output tabel/CSV yang berbeda dari list biasa.

### 2. GLOBAL USER FLOW

**A. First-time card activation**
```text
Physical Card (Tap/Scan) 
→ /c/:token 
→ Server check (Status: UNASSIGNED) 
→ Render Activation Experience langsung di /c/:token 
→ [If not logged in] → Google OAuth flow → kembali ke /c/:token (token dipertahankan via session) 
→ Input Business Name + Google Review URL 
→ Submit (Atomic Transaction) 
→ Inline Success State di /c/:token 
→ /dashboard
```

**B. Existing owner login**
```text
/ (or direct visit) 
→ /login 
→ Google OAuth 
→ /dashboard
```

**C. Active card customer flow**
```text
Physical Card (Tap/Scan) 
→ /c/:token 
→ Server check (Status: ACTIVE) 
→ HTTP 302 Redirect 
→ Google Review URL (External)
```

**D. Suspended card flow**
```text
Physical Card (Tap/Scan) 
→ /c/:token 
→ Server check (Status: SUSPENDED) 
→ Render Branded Unavailable Page (No redirect)
```

**E. Invalid card flow**
```text
Physical Card (Tap/Scan or manual URL) 
→ /c/:invalid_token 
→ Server check (Not Found) 
→ Render Branded 404 Page
```

**F. Owner card management**
```text
/dashboard 
→ /cards 
→ /cards/:id 
→ Edit URL (Modal) OR Suspend/Reactivate (Inline Action) 
→ Update State
```

**G. Admin card provisioning**
```text
/admin 
→ /admin/cards/generate 
→ Input Quantity (e.g., 15) 
→ Submit 
→ Display Generated Tokens + URLs 
→ Download CSV 
→ Physical Printing & NFC Writing 
→ /admin/cards (Status: UNASSIGNED)
```

**H. Logout flow**
```text
Any Owner/Admin Page 
→ Account Menu 
→ Logout 
→ Clear Session 
→ /
```

**I. Error recovery flow**
```text
API Failure / 500 Error 
→ Render Global Error State 
→ CTA: "Try Again" (Reload) / "Back to Dashboard"
```

### 3. PAGE-BY-PAGE SPECIFICATION

**4. PUBLIC LANDING PAGE `/`**
*   **Purpose:** Memberi tahu calon user apa itu Have Tech dan mengarahkan ke login.
*   **Hero:** Headline: "Satu Tap. Satu Review." Primary CTA: "Aktifkan Kartu" → `/login`.
*   **Sections:** Hanya 1-2 section. Cara Kerja (Visual Tap → Google Review) dan Keunggulan (Dynamic URL).
*   **Footer:** Logo, copyright, link privacy policy.
*   **Responsive:** Desktop centered hero. Mobile stack vertical, prioritize CTA di atas fold.

**5. CARD GATEWAY `/c/:token`**
*   **ACTIVE:** Server behavior: HTTP 302 Redirect ke `review_url`. UI: Tidak ada UI.
*   **UNASSIGNED:** Server behavior: Render halaman Activation Entry. UI: Premium black/gold branding. Pesan: "Kartu Anda belum aktif." CTA: "Aktifkan Kartu" (memicu Google Login dengan callbackUrl kembali ke `/c/:token`).
*   **SUSPENDED / ARCHIVED:** Server behavior: Render Branded Unavailable Page. UI: Pesan: "Layanan kartu ini sedang tidak tersedia."
*   **INVALID TOKEN:** Server behavior: HTTP 404. UI: Branded 404 Not Found.

**6. LOGIN `/login`**
*   **Method:** Google OAuth only. Tombol "Continue with Google" (full width, primary action). Tidak ada email/password form.
*   **New User:** Akun baru dibuat otomatis oleh NextAuth.js saat Google OAuth pertama kali — tidak ada route `/register` terpisah.
*   **Context Preservation:** Menerima query param `?callbackUrl=/c/:token` untuk mengembalikan user ke halaman aktivasi setelah login.
*   **Post-login redirect:** Jika ada `callbackUrl`, arahkan ke sana. Jika tidak, arahkan ke `/dashboard`.

**7. ACTIVATION EXPERIENCE (terjadi di `/c/:token`, state: UNASSIGNED)**
*   **Pre-requisite:** Jika user belum login, Google OAuth flow dimulai. Token asal dipertahankan via `callbackUrl` agar user kembali ke `/c/:token` yang sama setelah autentikasi.
*   **Step 1: Business Information** Fields: Business Name.
*   **Step 2: Google Review Destination** Fields: Google Review URL (Prefilled dengan `https://`). Validation: Cek domain whitelist.
*   **Loading State:** Tombol berubah menjadi spinner "Activating...".
*   **Error State:** Jika race condition (409), tampilkan: "Kartu ini baru saja diaktifkan."
*   **Architecture Note:** Tidak ada route `/activate/:token`. Seluruh activation experience terjadi di `/c/:token`.

**8. ACTIVATION SUCCESS (inline di `/c/:token`)**
*   **Decision:** Inline success state di halaman `/c/:token`.
*   **Behavior:** Form menghilang, diganti ikon centang premium dan pesan "Card is Live!". Setelah 2 detik, auto-redirect ke `/dashboard`.
*   **Note:** Tidak ada tombol "Test Live Redirect".

**10. DASHBOARD `/dashboard`**
*   **Header:** Logo Have Tech, Nama Bisnis, Avatar/Account Menu.
*   **Main Hierarchy:** Block 1: Statistik utama (Total Taps, Today, Week, Month). Block 2: Kartu Aktif (Card preview mini, status, link ke `/cards/:id`).
*   **Empty State:** "Anda belum memiliki kartu aktif."

**11. CARDS `/cards`**
*   **Layout:** List view, bukan table.
*   **Content per item:** Status Badge, Business Name, Public URL, Tap Count, CTA: "Manage".

**12. CARD DETAIL `/cards/:id`**
*   **Card Identity:** Token, Public URL (dengan tombol Copy).
*   **Destination:** Current Google Review URL (dengan tombol "Edit URL").
*   **Analytics:** Tampilkan 4 metrik dasar.
*   **Card Actions:** Download QR (PNG), Suspend/Reactivate (Toggle).
*   **Danger Zone:** Tombol "Archive" ter-disabled untuk owner.

**13. EDIT REVIEW URL**
*   **Decision:** Modal/Drawer.
*   **Content:** Input URL, tombol Save, tombol Cancel.

**14. SETTINGS `/settings`**
*   **Account:** Name, Email, Avatar (Read-only MVP).
*   **Business:** Edit Business Name.
*   **Security:** Connected Google Account info, Logout.

**15. ADMIN `/admin`**
*   **Inventory Stats:** Total Cards, Unassigned, Active, Suspended, Archived.

**16. ADMIN CARDS `/admin/cards`**
*   **Layout:** Table (desktop), List (mobile).
*   **Columns:** Token, Status, Business, Created At, Activated At.

**17. ADMIN CARD DETAIL `/admin/cards/:id`**
*   **Data:** Semua metadata kartu.
*   **Actions:** Suspend, Archive.
*   **Rule:** Admin **TIDAK** boleh mengubah Google Review URL.

**18. ADMIN GENERATE CARDS `/admin/cards/generate`**
*   **Input:** Numeric input untuk Quantity.
*   **Output:** Tabel list token baru + URL. Tombol "Download CSV".

### 4. PERMISSION MATRIX

| Feature | Public | Owner | Admin |
| ------- | ------ | ----- | ----- |
| View card public gateway (`/c/:token`) | ✅ | ✅ | ✅ |
| Activate card (Claim) | ✅ (Any logged in user) | ✅ | ✅ |
| View Owner Dashboard | ❌ | ✅ | ❌ |
| View own cards list | ❌ | ✅ | ❌ |
| Edit own Google Review URL | ❌ | ✅ | ❌ |
| Suspend/Reactivate own card | ❌ | ✅ | ❌ |
| Archive card | ❌ | ❌ | ✅ |
| Generate cards batch | ❌ | ❌ | ✅ |
| View all system cards | ❌ | ❌ | ✅ |
| Suspend any card (override) | ❌ | ❌ | ✅ |

### 5. STATE SYSTEM
*   **Loading:** Skeleton screen untuk dashboard. Spinner inline di tombol submit.
*   **Empty:** Ilustrasi minimal/teks. "Anda belum memiliki kartu."
*   **Error:** Merah soft. Teks jelas. CTA "Try Again".
*   **Success:** Hijau soft / Ikon centang. Auto-dismiss untuk minor actions.
*   **Disabled:** Opacity 50%, cursor not-allowed.
*   **Unauthorized (401):** Redirect ke `/login`.
*   **Forbidden (403):** "You do not have access to this card."
*   **Not Found (404):** Branded 404 page.
*   **Conflict (409):** "Kartu sudah diaktifkan oleh pengguna lain."

### 6. RESPONSIVE BEHAVIOR
*   **Navigation:** Desktop = Left Sidebar. Mobile = Bottom Tab Bar atau Hamburger Menu.
*   **Tables:** Admin table di desktop menjadi stacked list di mobile.
*   **Modals:** Desktop = Centered modal. Mobile = Bottom sheet (slide up).
*   **Forms:** Full width di mobile, max-width di desktop (centered container).

### 7. NAVIGATION
**Owner Navigation (Sidebar/Bottom Bar):** Dashboard, Cards, Settings.
**Admin Navigation (Sidebar):** Overview (`/admin`), Cards (`/admin/cards`), Generate (`/admin/cards/generate`).

### 8. FEATURE PRIORITY

| Route / Feature | Priority |
| --------------- | -------- |
| Card Gateway (`/c/:token`) | P0 |
| Login/Register (Google OAuth) | P0 |
| Activation Flow (di `/c/:token`) | P0 |
| Owner Dashboard (Basic Stats) | P0 |
| Cards List & Detail | P0 |
| Edit Review URL (Modal) | P0 |
| Suspend/Reactivate (Owner) | P0 |
| Admin Dashboard (Stats) | P0 |
| Admin Cards List & Detail | P0 |
| Admin Generate Cards | P0 |
| Admin Suspend/Archive | P0 |
| Public Landing Page (`/`) | P1 |
| Forgot Password Flow | **N/A** — Email/Password tidak ada di MVP. Hanya relevan jika Email/Password ditambahkan post-MVP. |
| Edit Business Profile (Settings) | P1 |
| Admin Edit Review URL | **Never** (Business Rule) |

### 11. FINAL PAGE SPECIFICATION TABLE

| Route | Role | Purpose | Core Features | Primary CTA | Secondary Actions | States | Priority |
| ----- | ---- | ------- | ------------- | ----------- | ----------------- | ------ | -------- |
| `/` | Public | Product introduction | Hero, How it works | Login | - | Active, Error | P1 |
| `/c/:token` | Public / Any | Redirect, Activation Experience, atau Status Page | Logic check, 302 Redirect (ACTIVE), Activation form (UNASSIGNED), Status page (SUSPENDED/ARCHIVED), 404 (INVALID) | Activate Card (UNASSIGNED) / auto-redirect (ACTIVE) | - | Active→302, Unassigned→Activation, Suspended, Archived, 404 | P0 |
| `/login` | Public | Autentikasi via Google OAuth | Google OAuth only | Continue with Google | - | Default, Loading, Error | P0 |
| `/dashboard` | Owner | Overview | Stats, Card Preview | Manage Card | - | Loaded, Empty, Error | P0 |
| `/cards` | Owner | List cards | List view, Status badge | Manage | - | Loaded, Empty | P0 |
| `/cards/:id` | Owner | Manage single card | Analytics, Edit URL, Suspend | Edit URL | Copy URL, Download QR, Suspend | Active, Suspended, Loading | P0 |
| `/settings` | Owner | Account config | Read profile, Edit biz name | Save | Logout | Default, Loading | P1 |
| `/admin` | Admin | Inventory overview | 5 Statistic numbers | Go to Cards | - | Loaded | P0 |
| `/admin/cards` | Admin | System inventory list | Table of all cards | Inspect Detail | Filter by Status | Loaded, Empty | P0 |
| `/admin/cards/:id` | Admin | Inspect & override | View metadata, Suspend, Archive | Suspend/Archive | - | Active, Suspended, Archived | P0 |
| `/admin/cards/generate` | Admin | Create physical inventory | Quantity input, CSV export | Generate | Download CSV | Default, Loading, Success | P0 |

### 12. FINAL UX PRINCIPLE
Customer: Tap/Scan → Langsung Google Review.
Owner: Tap/Scan → Aktivasi 2 menit → Selesai.
Management: Dashboard → Manage Cards → Done.

---