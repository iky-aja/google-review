# 07-HIGH-FIDELITY-UI.md

## HAVE TECH — HIGH-FIDELITY UI CONCEPT

### SCREEN 1: ACTIVATION ENTRY & FLOW (di `/c/:token`, state: UNASSIGNED)

**Mobile Layout (Primary Reference)**
*   **Background:** Solid Canvas `#0A0A0B`.
*   **Header (Sticky Top):** Height 56px, transparent. Logo Have Tech kecil (Gold `#D4AF37`) di tengah.
*   **Body (Padding 24px):**
    *   Top Spacing: 64px.
    *   Headline: "Activate Your Card" (32px, Weight 700, Color `#F5F5F5`).
    *   Subtext: "Tap your card to Google Reviews." (15px, Color `#8A8A8E`).
    *   Auth State: Tombol "Continue with Google" (Full width, 52px, BG `#F5F5F5`, Text `#0A0A0B`).
    *   Destination State (Fade-in): Headline "Set Review Destination". Input Field (BG `#1E1E21`, Height 56px). Ikon Google di kiri. Placeholder `https://g.page/...`. Focus: Outer ring 1px Gold opacity 30%. Error: Bottom-border 2px `#C73E3A`.
*   **Footer (Sticky Bottom):** Primary CTA "Activate Card" (Full width, 52px, BG `#D4AF37`, Text `#0A0A0B`).

**Desktop Layout**
Max-width 420px centered column.

### SCREEN 2: ACTIVATION SUCCESS

**Mobile Layout**
*   **Background:** Solid Canvas `#0A0A0B`.
*   **Body (Centered):**
    *   Ikon checkmark (lingkaran 48x48px, 2px solid `#D4AF37`).
    *   Headline: "Card is Live" (32px, Weight 700, Center).
    *   Subtext: "Your card is now connected to your Google Review destination." (15px, `#8A8A8E`, Max-width 280px).
*   **Footer (Sticky Bottom):** Primary CTA "Go to Dashboard" (Full width, 52px, BG `#D4AF37`).

### SCREEN 3: CARD DETAIL / DIGITAL TWIN (`/cards/:id`)

**Mobile Layout**
*   **Header:** Back Arrow (Left), "Manage Card" Title (Center).
*   **Body:**
    *   Digital Twin: Rasio 1.585:1, Width ~85% screen, BG `#141416`. QR Code (120x120px), Token di bawahnya. Status Dot 8px top-right (Active=`#D4AF37`).
    *   Identity Section: Label "PUBLIC URL", Row `havetech.id/c/X7kP29Lm` (Mono) + Ghost Icon "Copy".
    *   Destination Section: Label "GOOGLE REVIEW DESTINATION", Row URL truncate + Ghost Icon "Edit".
    *   Analytics Section: Label "TOTAL TAPS", Value "1,245" (48px Bold). Secondary row 3 kolom (Today, Week, Month).
*   **Footer (Sticky Bottom):** Text Button "Suspend Card" (Color `#8A8A8E`).

**Desktop Layout**
Centered Max-Width 720px atau Split Grid 40/60. Digital Twin max width 320px.

**State Variation: SUSPENDED CARD**
*   Digital Twin: `opacity: 40%` dan `grayscale(100%)`.
*   Status Dot: `#C73E3A`.
*   Footer Action: "Reactivate Card" (Color `#F5F5F5`).

---

# VISUAL DNA EXTRACTED

1.  **Tonal Elevation over Borders:** Pemisahan elemen tanpa border 1px, hanya menggunakan perbedaan warna background (Canvas `#0A0A0B` vs Surface `#141416`/`#1E1E21`).
2.  **Gold is a Verb, Not a Noun:** Warna Gold (`#D4AF37`) hanya untuk Primary CTA, Active Status, dan Logo. Dilarang untuk teks body atau border decorative.
3.  **Typography as the Primary Interface:** Hierarki tegas (12px Uppercase Label vs 48px Bold Hero Metric).
4.  **Bottom-Anchored Actions (Mobile):** Semua aksi utama di *Sticky Bottom Footer* untuk ergonomi jempol.
5.  **The Digital Twin is Functional:** Representasi fisik kartu bukan dekorasi. Status mengubah visual material kartu. QR interaktif.
6.  **Calm Success States:** Sukses diekspresikan dengan whitespace luas, ikon minimal, teks deklaratif.
7.  **Input Materiality:** Form input tertanam (inset), background lebih terang dari Canvas, tanpa border, fokus hanya dengan Gold ring tipis.
8.  **Restricted Whitespace:** Margin 32px (mobile) / 48px (desktop) antar major section.
9.  **Monospace for Identity:** Token, URL, dan log mesin menggunakan font Monospace.
10. **Zero Interstitials:** Tidak ada halaman perantara. Redirect 302 langsung.

---

# DOCUMENT MANIFEST

| No | Filename | Status | Purpose |
|---|---|---|---|
| 1 | `01-PRD.md` | Complete | Product Requirements, Business Rules, User Stories, Acceptance Criteria. |
| 2 | `02-ARCHITECTURE.md` | Complete | Database Schema, API Specs, Security, Privacy, Edge Cases. |
| 3 | `03-PAGE-FLOW-UX.md` | Complete | Information Architecture, User Flows, Page Specs, Permission Matrix. |
| 4 | `04-UX-IDENTITY.md` | Complete | UX Personality, Signature Experience, Anti AI-Slop Rules, Design Direction. |
| 5 | `05-FINAL-DESIGN-AUDIT.md` | Complete | Design Audit (Keep/Change/Remove), Final Design Decisions. |
| 6 | `06-DESIGN-SYSTEM.md` | Complete | Design Tokens, Component Anatomy, Page Layout Concepts, Motion Rules. |
| 7 | `07-HIGH-FIDELITY-UI.md` | Complete | Visual Exploration for Activation, Success, Card Detail, and Visual DNA. |