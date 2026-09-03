# 04-UX-IDENTITY.md

## HAVE TECH — UX IDENTITY & UI CONCEPT SPECIFICATION

### 1. COMPETITOR FLOW ANALYSIS
**A. Functional patterns worth keeping:**
*   OS-Level Handover (Dialog native OS "Open Link").
*   Session Retention (Langsung lanjut step URL jika sudah login).
**B. UX problems / friction:**
*   Raw URL Exposure (URL jelek di dialog OS).
*   Captcha in Onboarding.
*   Redundant Fields ("Comment").
*   Clunky Manual Test.
**C. Visual patterns we should avoid:**
*   Generic SaaS White (background putih polos).
*   3-Step Text Indicator (stepper horizontal berisi teks panjang).
*   Cluttered Footer.
**D. Opportunities for Have Tech to differentiate:**
*   Clean URL (`havetech.id/c/X7kP29Lm`).
*   Zero-Friction Onboarding (Google OAuth -> URL -> Done).
*   Premium Visual Identity (Dark mode, accent emas, whitespace luas).

### 2. HAVE TECH UX PERSONALITY
1.  **Premium:** Dark theme, accent emas, tipografi tajam, whitespace luas. Hindari: warna ceria, gradient biru-ungu.
2.  **Effortless:** Form minimalis, tombol CTA besar. Hindari: multi-step form panjang.
3.  **Physical-Digital Bridge:** Representasi visual kartu fisik di dashboard. Hindari: abstraksi data.
4.  **Confident:** Copywriting singkat deklaratif. Hindari: mikrocopy apologizing.

### 3. SIGNATURE EXPERIENCE
1.  **The Digital Twin:** Visual 2D kartu fisik di dashboard. Mengubah URL = mengubah tujuan kartu fisik.
2.  **One-Tap Google Auth:** "Continue with Google" adalah hero.
3.  **Silent Progress:** Transisi halus antar form, tanpa stepper 1-2-3.
4.  **Typography-Driven Analytics:** Angka tap ditampilkan bold besar, bukan chart.
5.  **Calm Success States:** Completion state bersih — ikon centang, pesan "Card is Live", CTA ke Dashboard. Tidak ada tombol "Test Live Redirect".

### 4. ACTIVATION EXPERIENCE
Target: < 1 menit.
Physical Card -> Tap -> Server UNASSIGNED -> Auth Google -> Business Name -> URL -> Success.

### 5. CARD-FIRST EXPERIENCE
UI merefleksikan fisik: Card Preview, QR code di tengah, token di bawah, destination link di bawahnya.

### 6. CUSTOMER EXPERIENCE
0 Friksi. Active card = HTTP 302 direct. Tidak ada interstitial page.

### 7. ACTIVATION UI CONCEPT
*   **A. Activation Entry:** Logo kecil, "Activate Card", Google button.
*   **B. Authentication:** Sama dengan A.
*   **C. Business Setup:** "What's your business name?", input full-width.
*   **D. Review Destination:** "Where should we send reviews?", input URL.
*   **E. Validation:** Spinner inline, hijau jika valid.
*   **F. Success:** Checkmark emas, "Card is Live", pesan konfirmasi singkat. Auto-redirect ke `/dashboard` dalam 2 detik. Tidak ada tombol "Test Live Redirect".

### 8. DASHBOARD UI CONCEPT
Header: Nama Bisnis, Avatar. Hero Metric tunggal: label "TOTAL TAPS" + nilai angka raksasa (56px Bold). Secondary Metrics: 3 angka lebih kecil berjajar (Today, This Week, This Month). Card Overview: Digital Twin mini + Ghost Button "Manage Card".
*Note: Bukan grid 2x2. Satu hero metric sebagai anchor visual, 3 metrik pendukung di bawahnya.*

### 9. CARD DETAIL UI CONCEPT
Top: Digital Twin card. Middle: Public URL + Copy. Bottom: Destination URL + Edit. Analytics 4 stat bersih.

### 10. DESIGN LANGUAGE
*   **Typography:** Inter / SF Pro. Kontras tinggi.
*   **Color:** Deep charcoal (`#0A0A0B`), Surface (`#141416`), Accent Gold (`#D4AF37`).
*   **Layout:** Generous whitespace, low density.
*   **Shape:** Radius 8px. Hindari border 1px.
*   **Buttons:** Solid Gold primary, Ghost secondary.
*   **Motion:** Slide horizontal antar step, slide up modal. Hindari bouncy/parallax.

### 11. ANTI AI-SLOP DESIGN RULES
1. No `bg-gradient` blue to purple.
2. No glassmorphism.
3. No 3-column feature grid with cute icons.
4. Analytics are numbers and text, not chart libraries.
5. No `<Card>` inside `<Card>`.
6. No "Empower your business" copy.
7. No oversized hero text (`text-9xl`) on mobile.
8. No custom complex illustrations.

### 12. MOBILE-FIRST EXPERIENCE
Layout single column, CTA sticky bottom, bottom sheet modal, max-width centered di desktop.

### 13. DESIGN REFERENCES & DIRECTION
**RECOMMENDED DIRECTION: "Premium Physical"**
Dark charcoal, gold accents, high contrast. Matches physical card material (black/gold).

### 14. PAGE-BY-PAGE UI CONCEPT (P0)
*   `/c/:token` (UNASSIGNED): Black bg, Gold logo, Google login button, and activation inputs (slide transitions, borderless inputs).
*   `/login`: Google OAuth button only (no manual register page).
*   `/dashboard`: Digital Twin mini card, 1 hero metric + 3 secondary metrics, "Manage" button.
*   `/cards` & `/cards/:id`: Digital twin card, URL editable via modal.
*   `/admin` & `/admin/cards`: Dense data, table view, status badges.
*   `/admin/cards/generate`: Single input, generate button, results table.

### 15. FINAL DESIGN PRINCIPLES
1. Black is the Canvas.
2. Gold is the Action.
3. Typography Hierarchy over Borders.
4. Physical Twin.
5. Zero Interstitials.
6. Numbers are Features.
7. Google is a Partner.
8. Thumb-First.
9. Restraint.
10. Tactile Feedback.

---