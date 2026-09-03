# 05-FINAL-DESIGN-AUDIT.md

## FINAL DESIGN AUDIT

### A. KEEP
1. **Zero-Friction Customer Flow:** HTTP 302 Redirect tanpa halaman interstitial.
2. **Dark Mode sebagai Canvas:** Background deep charcoal (`#0A0A0B`).
3. **Silent Progress (No Steppers):** Transisi halus tanpa indikator 1-2-3.
4. **Google OAuth as Default:** "Continue with Google" sebagai hero action.
5. **Typography-Driven Analytics:** Angka besar sebagai elemen visual utama.
6. **Clear State Logic on `/c/:token`:** Pemetaan UNASSIGNED, ACTIVE, SUSPENDED, ARCHIVED, INVALID.

### B. CHANGE
1. **Premium Physical vs Generic Dark SaaS (Materiality)**
   *   *Change:* Surface background (`#1E1E21`) harus memberikan ilusi *matte finish* seperti kartu fisik. Accent gold (`#D4AF37`) hanya untuk elemen interaktif aktif dan status.
2. **Digital Twin Functionality (Dekorasi ke Utilitas)**
   *   *Change:* QR Code pada digital twin harus berfungsi sebagai tombol "Download QR". Jika status `SUSPENDED`, digital twin harus secara visual ter-*dim/desaturate*.
3. **Dashboard Hierarchy (Anti SaaS-Grid)**
   *   *Change:* Ubah grid 2x2 menjadi satu "Hero Metric" (Total Taps) dengan tipografi sangat besar, dan 3 metrik pendukung (Today, Week, Month) dengan ukuran lebih kecil di bawahnya.
4. **Mobile Activation Post-Tap Context**
   *   *Change:* Pastikan CTA utama berada di posisi *sticky bottom* pada mobile untuk ergonomi jempol pasca-tap.
5. **Customer Zero-Friction (Server-Side Enforcement)**
   *   *Change:* Pastikan tidak ada client-side JS yang menahan redirect. Server harus merespons HTTP 302 sebelum halaman Have Tech sempat dirender.

### C. REMOVE
1. **Hapus opsi "Test Live Redirect" di layar sukses.**
   *   *Reason:* Menambah kompleksitas. Kepercayaan diri user cukup dibangun dengan transisi sukses yang bersih dan auto-redirect ke dashboard.
2. **Hapus ide fallback Email/Password di MVP.**
   *   *Reason:* Menjaga UX sesingkat mungkin. MVP wajib menggunakan Google OAuth saja.

### D. FINAL DESIGN DECISIONS
1. **Material-First UI:** Gunakan teknik elevasi (warna lebih terang, bukan shadow) untuk memisahkan kartu digital dari background.
2. **Gold is Action, Not Decoration:** Warna emas *hanya* untuk Primary CTA, indikator status aktif, dan logo.
3. **Interactive Digital Twin:** Klik QR = Download. Status Suspend = Visual Redup.
4. **Single Hero Analytics:** Dashboard hanya memiliki satu angka raksasa (Total Taps) sebagai *anchor* visual.
5. **Bottom-Anchored Mobile UX:** Semua aksi utama pada flow aktivasi mobile harus berada di bagian bawah layar (sticky).

---