# 06-DESIGN-SYSTEM.md

## HAVE TECH — PREMIUM DARK GOLD UI SPECIFICATION

### 1. DESIGN TOKENS & VISUAL MATERIALITY

**Color Palette**
*   **Canvas (Background Utama):** Deep Matte Charcoal `#0A0A0B`.
*   **Surface (Elevation 1):** Matte Ash `#141416`.
*   **Surface (Elevation 2 - Input):** Faded Graphite `#1E1E21`.
*   **Primary Accent (Action):** Muted Champagne Gold `#D4AF37`.
*   **Primary Accent Hover:** Deep Gold `#B89020`.
*   **Text Primary:** Platinum White `#F5F5F5`.
*   **Text Secondary:** Silver Gray `#8A8A8E`.
*   **Destructive/Suspended:** Deep Crimson `#C73E3A`.

**Typography**
*   **Family:** Inter atau SF Pro Display.
*   **Hero Metric:** 48px - 64px, Weight 700, Letter spacing -2%.
*   **Page Title:** 24px, Weight 600.
*   **Body Text:** 15px, Weight 400, Line height 150%.
*   **Microcopy/Label:** 12px, Weight 500, Uppercase, Letter spacing +5%, Silver Gray.

**Shape & Spacing**
*   **Radius:** 8px untuk input, container, tombol.
*   **Spacing:** Kelipatan 4px (4, 8, 12, 16, 24, 32). Whitespace 32px di sekitar elemen utama.

### 2. COMPONENT ANATOMY

**A. Primary Button (Gold Solid)**
*   Background `#D4AF37`, Text `#0A0A0B`. Radius 8px.
*   Hover: Background `#B89020`.
*   Loading: Background tetap Gold, teks berubah spinner hitam.

**B. Secondary Button (Ghost)**
*   Background transparent, Text `#F5F5F5`, Border 1px `#333333`.
*   Hover: Background berubah menjadi `#1E1E21`.

**C. Input Field (Form Aktivasi)**
*   Background `#1E1E21`. Tanpa border default. Text `#F5F5F5`.
*   Focus State: Border bawah 2px `#D4AF37` atau outer ring 1px Gold opacity 30%.
*   Error State: Border bawah 2px `#C73E3A`, teks helper merah.

**D. The Digital Twin (Card Visual)**
*   Container rasio 1.585:1. Background `#141416`.
*   QR Code di tengah (120x120px). Token di bawah (mono-spaced).
*   Status Indicator: Dot 8px di pojok kanan atas. Active=`#D4AF37`, Suspended=`#C73E3A`.
*   Interaction: Klik QR = Download PNG. Suspended = Opacity 50% + Grayscale.

### 3. PAGE LAYOUT CONCEPTS

**PAGE: Activation Flow (di `/c/:token`, state: UNASSIGNED) - Mobile**
*   Header: Logo Have Tech kecil di tengah.
*   Body: Title (24px), Subtitle (15px), Input Field (Background `#1E1E21`), Error helper.
*   Footer (Sticky Bottom): Primary Button "Activate Card" (Full width).

**PAGE: Dashboard (`/dashboard`) - Mobile**
*   Header: Nama Bisnis, Avatar.
*   Hero Metric: Label "TOTAL TAPS", Value "1,245" (56px Bold).
*   Secondary Metrics: 3 item berjajar (Today, Week, Month).
*   Card Overview: Title "Your Card", Digital Twin Container, Ghost Button "Manage Card".

**PAGE: Card Detail (`/cards/:id`) - Mobile**
*   Header: Back Arrow, Title "Manage Card".
*   Digital Twin Section: Visualisasi kartu ukuran penuh.
*   Identity Section: "PUBLIC URL", Teks URL mono + Copy Icon.
*   Destination Section: "GOOGLE REVIEW DESTINATION", Teks URL truncate + Edit Icon.
*   Danger Zone: Ghost text button "Suspend Card".

### 4. MOTION & TRANSITION RULES
*   Page Transitions: Slide horizontal (200ms ease-in-out).
*   Modal/Bottom-Sheet: Slide up dari bawah (250ms).
*   State Changes: Opacity transition 150ms.
*   Button Feedback: Scale down ke 98% (100ms).
*   Aturan: Dilarang menggunakan `backdrop-blur` (glassmorphism).

---

