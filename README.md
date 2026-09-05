# 💳 HAVE TECH — Smart NFC & QR Review Card Platform

> **Platform Infrastruktur Fisik-Digital Premium** untuk Menghubungkan Kartu Pintar NFC & QR Code dengan Destination URL (Google Review) secara Dinamis, Instan, dan Aman.

---

## 📌 Daftar Isi
- [Ringkasan Proyek](#-ringkasan-proyek)
- [Arsitektur & Alur Kerja Sistem](#-arsitektur--alur-kerja-sistem)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Database & Schema](#-struktur-database--schema)
- [Fitur Utama & Implementasi API](#-fitur-utama--implementasi-api)
- [Keamanan & Pencegahan Kerentanan](#-keamanan--pencegahan-kerentanan)
- [Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [Panduan Instalasi & Pengoperasian](#-panduan-instalasi--pengoperasian)
- [Audit & Rekomendasi Pengembangan (Roadmap)](#-audit--rekomendasi-pengembangan-roadmap)

---

## 🔎 Ringkasan Proyek

**Have Tech** adalah platform manajemen kartu pintar fisik yang menjembatani interaksi offline ke online. Setiap kartu fisik Have Tech memiliki **satu URL permanen dinamis** (`https://domain.com/c/:token`) yang diprogram ke chip NFC dan dicetak sebagai QR Code. 

Server Have Tech mengatur perilaku navigasi secara real-time berdasarkan *state* kartu:
1. **UNASSIGNED**: Mengarahkan ke *3-Step Activation Wizard* untuk pemilik bisnis (*Owner*).
2. **ACTIVE**: Secara instan meredireksi pelanggan (*HTTP 302 Redirect*) langsung ke halaman Google Review bisnis tanpa hambatan/perantara (< 100ms).
3. **SUSPENDED / ARCHIVED**: Menampilkan halaman *Branded Unavailable* yang memberitahukan bahwa kartu sedang tidak aktif.

---

## 🏗 Arsitektur & Alur Kerja Sistem

```mermaid
flowchart TD
    Customer([Pelanggan Tap NFC / Scan QR]) --> Gateway["GET /c/:token"]
    Gateway --> CheckStatus{Status Kartu?}
    
    CheckStatus -- ACTIVE --> LogTap[Async Insert tap_logs]
    LogTap --> Redirect[HTTP 302 Redirect to Google Review URL]
    
    CheckStatus -- UNASSIGNED --> ActivationWizard[Halaman Aktivasi 3-Step]
    ActivationWizard --> AuthCheck{Logged in?}
    AuthCheck -- No --> GoogleOAuth[Google OAuth Sign-In]
    AuthCheck -- Yes --> AtomicClaim[Submit Form: Business Name & Google Review URL]
    AtomicClaim --> DBTx["DB Transaction (SELECT FOR UPDATE)"]
    DBTx --> ActiveState[Card Status -> ACTIVE & Log Audit]
    
    CheckStatus -- SUSPENDED / ARCHIVED --> UnavailablePage[Branded Unavailable Page]
```

### Siklus Hidup Kartu (*Card Lifecycle*)
- `UNASSIGNED` → Status awal saat batch kartu dibuat oleh Admin.
- `UNASSIGNED` → `ACTIVE` → Terjadi saat Owner berhasil melakukan klaim/aktivasi.
- `ACTIVE` ↔ `SUSPENDED` → Ditangguhkan sementara oleh Owner atau Admin.
- `ACTIVE` / `SUSPENDED` → `ARCHIVED` → Kartu diarsipkan secara permanen (kartu rusak/hilang).

---

## 💻 Teknologi yang Digunakan

| Kategori | Teknologi / Library | Keterangan |
| :--- | :--- | :--- |
| **Framework UI** | **Next.js 16.3.1 (App Router)** | Server Components, Server Actions, Dynamic Routes |
| **UI Engine** | **React 19.2.8 & TypeScript 5** | Strict Type Safety & Client Components |
| **Styling** | **Tailwind CSS v4** | Custom Luxury Dark Theme (Gold `#D4AF37`, Canvas, Surface) |
| **Database** | **PostgreSQL (Supabase Pooler)** | Database Relasional dengan Connection Pooling |
| **ORM** | **Drizzle ORM 0.45.2 & Drizzle Kit** | Type-safe SQL Query Builder & Migration Engine |
| **Authentication** | **NextAuth.js v5 (Auth.js Beta 32)** | Dual Auth: Google OAuth (Owner) + Credentials Bcrypt (Admin) |
| **Utilities** | **QRCode, BcryptJS, Clsx** | Generator QR PNG HD, Hash Password Admin, Utility CSS |

---

## 🗄 Struktur Database & Schema

Didesain menggunakan **Drizzle ORM** (`db/schema.ts`):

```sql
-- Enum Status Kartu
CREATE TYPE card_status AS ENUM ('UNASSIGNED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- Tabel Users (Dual Role: Owner & Admin)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE, -- Digunakan oleh Owner (Google OAuth)
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner', -- 'owner' | 'admin'
  password_hash TEXT, -- Digunakan oleh Admin (Bcrypt)
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel Businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel Cards (Public Token 8-Karakter)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token TEXT UNIQUE NOT NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  review_url TEXT,
  status card_status NOT NULL DEFAULT 'UNASSIGNED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel Tap Logs (Analytics Performance)
CREATE TABLE tap_logs (
  id BIGSERIAL PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabel Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'GENERATED', 'ACTIVATED', 'SUSPENDED', 'URL_UPDATED'
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## ✨ Fitur Utama & Implementasi API

### 1. Redirect Engine Super Cepat (`/c/:token`)
- **Latensi Rendah**: Server-side execution menggunakan Next.js Server Components.
- **Asynchronous Tap Logging**: Log tap dimasukkan ke tabel `tap_logs` secara non-blocking sebelum HTTP 302 disajikan.

### 2. Atomic Card Claiming (Anti Race-Condition)
- Menggunakan skema transaksi PostgreSQL `SELECT ... FOR UPDATE`.
- Jika dua user mencoba mengaktifkan kartu yang sama pada milidetik yang sama, transaksi kedua akan ditolak dengan galat `409 Conflict`.

### 3. Validasi Domain Google Review (Anti Open-Redirect)
- Semua input URL diverifikasi melalui helper `validateReviewUrl()`.
- Wajib protokol `https://` dan domain terbatas pada whitelist Google (`g.page`, `search.google.com`, `google.com`, `maps.google.com`, `maps.app.goo.gl`, `goo.gl`).

### 4. Admin Management Portal (`/admin`)
- **Batch Generator (`/admin/generate`)**: Memuat token acak aman secara kriptografis (`crypto.randomBytes`).
- **Tabel Monitoring (`/admin/cards`)**: Dilengkapi pencarian token/bisnis, filter tab status, dan *Quick Action Modals*.
- **Export Data CSV (`/api/admin/cards/export`)**: Mengekspor daftar kartu dan URL untuk keperluan pemrograman NFC & pencetakan fisik.
- **QR Artwork Generator HD (`lib/qr/`)**: Otomatis mendeteksi slot transparan pada master template PNG (`alpha < 30`), mengomposisikan QR Code dinamis dengan gateway URL publik, dan menyajikan preview serta ekspor artwork PNG HD beresolusi tinggi.


### 5. Owner Portal (`/dashboard`, `/cards`)
- **Metrik Analitik**: Total Tap, Tap Hari Ini, Minggu Ini, dan Bulan Ini (Perhitungan berbasis Zona Waktu WIB / UTC+7).
- **Digital Twin Visual**: Pratinjau visual fisik kartu pintar.
- **Manajemen Kartu & Link**: Memungkinkan perubahan Google Review URL dan toggle penangguhan kartu (IDOR Protected).

---

## 🔒 Keamanan & Pencegahan Kerentanan

1. **Anti-Enumeration Tokens**: Token publik dibuat sebanyak 8 karakter alfanumerik acak menggunakan `crypto.randomBytes(10)` (~47 bit entropi).
2. **Pencegahan IDOR (Insecure Direct Object Reference)**: Verifikasi *ownership* server-side pada seluruh operasi mutasi kartu (`card.business.owner_id === session.user_id`).
3. **Pencegahan Open Redirect**: Whitelisting domain Google Review secara ketat pada level input/update URL.
4. **Data Minimization (Privasi Pelanggan)**: Log tap hanya mencatat `card_id` dan `created_at` tanpa menyimpan IP Address atau User-Agent pelanggan.
5. **Keamanan Autentikasi Admin**: Hash password menggunakan `bcryptjs` dengan *salt rounds* standar industri.

---

## 📁 Struktur Direktori Proyek

```
Have-Tech/
├── app/                        # Next.js App Router Pages & API Routes
│   ├── admin/                  # Portal Admin (Overview, Batch Generator, Cards, Settings)
│   ├── api/                    # API Endpoints (Admin Export, Batch Generator, NextAuth)
│   ├── c/[token]/              # Redirect Engine & Activation Gateway
│   ├── cards/                  # List & Detail Kartu milik Owner
│   ├── dashboard/              # Owner Dashboard Analytics
│   ├── login/                  # Page Sign-In (Google OAuth & Admin Credentials)
│   ├── globals.css             # Tailwind CSS v4 Global Styling & Tokens
│   └── layout.tsx              # Root Layout
├── auth.ts                     # Konfigurasi NextAuth.js (Auth.js v5)
├── components/                 # Reusable UI Components
│   ├── admin/                  # Admin Components (Table, Sidebar, Modal QR, Form Batch)
│   ├── ActivationForm.tsx      # Step Wizard Aktivasi Kartu
│   ├── AdminLoginForm.tsx      # Form Credentials Admin
│   └── DigitalTwin.tsx         # Visualisasi Kartu Fisik
├── config/                     # Konfigurasi aplikasi
├── db/                         # Konfigurasi Database & Schema
│   ├── index.ts                # Client Drizzle & Postgres Connection
│   ├── schema.ts               # Skema Relasi Table Drizzle ORM
│   └── migrations/             # Migration SQL files
├── lib/                        # Helper & Utilities
│   ├── analytics.ts            # Agregasi Metrik Tap Log (WIB Timezone)
│   ├── card-utils.ts           # Token Generator & URL Whitelist Validator
│   └── utils.ts                # Helper Class Name Merger (clsx + tailwind-merge)
├── types/                      # Type definitions TypeScript
├── .env.example                # Template Variabel Lingkungan
├── drizzle.config.ts           # Konfigurasi Drizzle Kit
└── package.json                # Dependencies & Script NPM
```

---

## 🚀 Panduan Instalasi & Pengoperasian

### 1. Prasyarat
- **Node.js**: `v18.x` atau lebih baru
- **PostgreSQL**: PostgreSQL Instance (atau Supabase Database)

### 2. Kloning & Instalasi Dependensi
```bash
git clone https://github.com/iky-aja/google-review.git Have-Tech
cd Have-Tech
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Salin berkas `.env.example` ke `.env.local` lalu lengkapi nilainya:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
AUTH_SECRET="buat-secret-acak-minimal-32-karakter"
AUTH_GOOGLE_ID="google-client-id-anda.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="google-client-secret-anda"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Jalankan Migrasi Database
```bash
npx drizzle-kit push
```

### 5. Memulai Server Pengembang
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 📊 Audit & Rekomendasi Pengembangan (Roadmap)

### Hasil Audit Kode & Sistem

| Komponen | Status | Hasil Evaluasi |
| :--- | :---: | :--- |
| **Redirect Latency** | ✅ PASSED | Sangat cepat (< 100ms) menggunakan Server Component. |
| **Concurrency Lock** | ✅ PASSED | Aman dari klaim ganda berkat PostgreSQL `SELECT FOR UPDATE`. |
| **Validasi Security** | ✅ PASSED | Bebas dari IDOR, Open Redirect, dan Token Enumeration. |
| **Handling Timezone** | ✅ PASSED | Metrik analitik disesuaikan dengan zona waktu WIB (UTC+7). |
| **UX & Responsivitas** | ✅ PASSED | Tampilan konsisten dengan tema Dark Luxe (Gold & Canvas). |

### Rekomendasi Fitur Post-MVP
1. **Fitur Reset & Transfer Ownership Kartu**: Memungkinkan Admin mengatur ulang status kartu dari `ARCHIVED` atau `SUSPENDED` kembali ke `UNASSIGNED`.
2. **Custom Landing Page Intermediate**: Opsi bagi Owner untuk menampilkan halaman promosi/menu singkat sebelum melakukan redirect ke Google Review.
3. **Advanced Analytics & Export PDF**: Grafik tren kunjungan bulanan dan laporan performa bisnis yang dapat diunduh.
