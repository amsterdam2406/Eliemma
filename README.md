# EliEmma Health — Frontend (Production-Ready Static Website)

Client: EliEmma Health (Home Health · Training & Education · Clinical Research)
Deliverable: static HTML/CSS/JS frontend, ready for deployment on Render.
Future backend: Django + Django REST Framework + PostgreSQL (not included — see section 7).

---

## 1. Project structure

frontend/
├── index.html                  # Home
├── pages/
│   ├── about.html              # Story, mission/vision, values, team, careers
│   ├── services.html           # 3 service pillars + home health list
│   ├── clinical-research.html  # Research detail page + capabilities
│   ├── news.html               # Articles starter cards
│   ├── contact.html            # Info cards + validated enquiry form
│   ├── privacy.html            # Privacy policy (template — client review)
│   └── terms.html              # Terms & conditions (template — client review)
├── css/style.css               # Full design system (tokens at the top)
├── js/main.js                  # Nav, reveal, counters, carousel, accordion, form validation
└── assets/
    ├── images/                 # Logo, favicon and fallback media assets (SEE SECTION 4)
    ├── videos/                 # Drop client videos here (see section 5)
    ├── icons/                  # Reserved
    └── fonts/                  # Reserved

render.yaml (repo root) — Render static site config (publish dir: ./frontend).

## 2. Brand design system (from client brief)

| Token              | Value                          |
|--------------------|--------------------------------|
| Primary blue       | #004aad                        |
| Gradient (180°)    | #2173ff → #004aad              |
| Dark blue          | #05469d                        |
| Accent green       | #67bc45                        |
| Background         | #dfdfde                        |
| Gray               | #d9d9d9                        |
| Black              | #000000                        |
| Headings font      | Sora (Google Fonts)            |
| Body font          | Nunito Sans (Google Fonts)     |

All tokens live at the top of css/style.css (:root). Do not hard-code colours elsewhere.

## 3. Before launch — client content still needed

- [ ] Nurse's full name, bio, and headshot (pages/about.html + assets/images/team-nurse.jpg)
- [ ] 5+ real testimonials (index.html testimonials section)
- [ ] Instagram, Facebook, Twitter/X profile links (footer, all pages)
- [ ] Replace sample hero/gallery/team media and sample video with client-approved content
- [ ] Legal review of privacy.html and terms.html
- [ ] Customer Portal link (header button — currently points to contact page)
- [x] Map embed for the Contact page (pages/contact.html)

## 4. Replacing sample images

The page currently uses curated remote sample images so the layout is presentation-ready.
Replace the image URLs in the HTML with approved client media before launch:

- logo.png / favicon.png / og-image.jpg — real logo files (ask client for originals)
- hero-home-care.jpg — warm caregiver + elderly client photo (landscape)
- why-choose-us.jpg — care team supporting a client (landscape)
- gallery-1.jpg … gallery-5.jpg — facility, home care, training, research lab, team
- team-ganiat.jpg, team-nurse.jpg — professional headshots (portrait, ~600×700)
- news-1.jpg … news-3.jpg — article covers (landscape)
- video-thumbnail.jpg — video cover image (1280×720)

Recommended: compressed JPEG/WebP under ~200 KB each. Add width/height attributes
if aspect ratios change.

## 5. Replacing the sample video

1. Export client video as MP4 (H.264), 1080p, under ~30 MB.
2. Save as assets/videos/company-intro.mp4.
3. In index.html, replace the sample `<source>` URL with:

   <video class="video-shell" controls preload="metadata" poster="assets/images/video-thumbnail.jpg">
     <source src="assets/videos/company-intro.mp4" type="video/mp4">
     Your browser does not support the video tag.
   </video>

Never autoplay with sound.

## 6. Contact form delivery (important)

The form is configured to deliver submissions to the Formspree endpoint for
eehealth@eliemma.com:

1. Confirm the form at https://formspree.io is active and the recipient email
   is verified.
2. Test a submission from pages/contact.html. The JS submits the form with
   fetch() and displays a success or error message.

The form's field names are ready for a future backend (name, email, phone,
country_code, inquiry_type, preferred_contact, message, consent).

## 7. Future backend integration (Django/DRF/PostgreSQL)

This frontend was built static-first but API-ready:

- js/main.js is organised in small modules — future fetch() calls can replace
  static content without touching layout logic.
- Content areas designed to become API-driven later: services, testimonials,
  gallery, news, FAQs, team.
- Recommended future stack: Django + Django REST Framework + PostgreSQL +
  Django Admin, serving the above as JSON endpoints.
- Keep secrets/server keys OUT of this frontend — the static site must remain
  safe to host publicly.

## 8. Deployment on Render

Option A (dashboard): New → Static Site → connect repo → Publish directory: frontend.
Option B (render.yaml, included): detects the static site automatically.

No build command is required. All asset paths are relative and work from any static host.

## 9. Quality checklist already covered

- Semantic HTML5, skip-link, ARIA labels, keyboard-navigable carousel & accordion
- prefers-reduced-motion respected (animations disable for users who request it)
- Visible focus states, labelled form fields, inline validation errors
- Responsive breakpoints: 1020px / 860px / 520px (intentional mobile layouts)
- SEO: unique titles, meta descriptions, Open Graph tags, favicon
- Lazy-friendly media; no console errors; no fake form submissions

Built with care by Ololade Amsat.
