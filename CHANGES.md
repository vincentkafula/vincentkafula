# Website update: Build One Zambia advocacy content

All advocacy content comes from `public/documents/BuildOneZambia_Website_Content.docx`. It lives in one data file, `src/api/advocacy.js`, so wording can be edited in one place.

## Sitemap
- `/`: Home (hero, four promises, key priorities, advocacy overview, why it matters, advocacy position, biography, supporter quotes, events, news, get involved)
- `/about`: Vincent Kafula biography; Build One Zambia membership, aim, objective and policy (`#build-one-zambia`); symbol and flag colours (`#symbol`)
- `/advocacy`: overview of all eight issues
- `/advocacy/:slug`: transport-infrastructure, agricultural-mechanisation, housing-revolution, community-infrastructure, mining-strategy, decentralised-governance, provincial-industry, responsible-borrowing
- `/infrastructure/:slug`: roads, rail, cargo-airports, passenger-airports
- `/proposals`: every commitment grouped by issue
- `/resources`: source document download (PDF and Word)
- `/news`, `/news/:slug`: news (existing backend, unchanged)
- `/campaign`, `/campaign-single/:slug`: events, automatically marked upcoming or past
- `/volunteer`, `/donate` (Support), `/contact`, `/faq`, `/search`, `/privacy`, `/terms`
- Unchanged: shop, cart, checkout, login, register, dashboards
- Redirects: `/service` → `/advocacy`; `/service-single/*` → `/advocacy`; `/home2–4`, `/gallery` → `/`; `/team`, `/team-single/*`, `/testimonial` → `/about`; `/campaign-2`, `/campaign-3` → `/campaign`; `/blog*` lists → `/news`; unknown URLs → 404

## Removed template filler
Lorem ipsum, fictional team members and testimonials, fake comments and donor counts, fake partner logos, placeholder Instagram images, the cleaning-company privacy and terms text, US phone numbers and a New York map, the non-working language selector, and the donation form that collected card numbers without processing them.

## New and changed files
- Content and config: `src/api/advocacy.js`, `src/data/navigation.js` (menu, contact details, social links), `src/main-component/FaqPage/faqData.js`
- Components: `Advocacy/sections.jsx`, `NavList`, `SocialLinks`, `Seo`, `LegalPage`
- Pages: `AdvocacyPage`, `AdvocacySinglePage`, `ProposalsPage`, `ResourcesPage`, `SearchPage`
- Rewritten: Home, About, hero, footer, headers, mobile menu, topbar, contact, volunteer, support (donate), FAQ, privacy, terms, campaign pages
- Styles: `src/css/advocacy.css`
- Font Awesome 6 is now bundled through npm (`@fortawesome/fontawesome-free`) instead of a CDN link.
- Backend: `server/src/routes/contact.js` (new public `POST /api/contact`), registered in `server/src/index.js`. `server/src/utils/resend.js` now accepts `replyTo`.

## Forms
Contact, volunteer, support and newsletter forms post to `/api/contact`. Each submission is emailed through Resend to `CONTACT_TO_EMAIL` (default `vincent.kafula@gmail.com`), with reply-to set to the sender. The route includes input validation, HTML escaping, a spam honeypot and a limit of 5 submissions per IP per 10 minutes.
Requires `RESEND_API_KEY` on the backend. If it is missing, the forms show a message asking visitors to email directly.

## Content needing approval
- Election dates: the document says 13 August 2026 (now past) and "Vote: 14 August 2031". Specific vote dates are left off the site.
- Title: "Founder of Build One Zambia" (as on the existing site) versus "member" (as in the brief).
- Consent from Mwansa K. and Chanda M. for their supporter quotes.
- Figures (USD 28.9 bn debt, copper >70% of exports, 890,346 t in 2025, emerald and manganese claims) are labelled "as stated in the document" until verified.
- Social profile URLs: add them in `src/data/navigation.js`. The icons stay hidden until then.
- The BOZ emblem image is needed. The flag is drawn from the document's description.
- Privacy and terms text is a plain-language draft and should be reviewed before launch.
