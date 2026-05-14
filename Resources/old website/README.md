# WildWise Website

**Tagline:** Helping people help wildlife wisely.  
**Location:** Ottawa County, Michigan  
**Est:** 2025

A static multi-page website for WildWise, a Michigan-based wildlife education nonprofit.
Built with vanilla HTML, CSS, and JavaScript — no build tools required.

---

## File Structure

```
wildwise/
  index.html          ← Homepage
  about.html          ← Our Story
  noodle.html         ← Meet Noodle (ambassador crow)
  education.html      ← Wildlife Education guides
  contact.html        ← Get Involved / Contact
  404.html            ← Custom 404 page

  css/
    reset.css         ← Minimal modern CSS reset
    variables.css     ← Design tokens / CSS custom properties
    base.css          ← Global styles, typography, body, Google Fonts import
    components.css    ← Reusable UI components (.card, .btn-primary, .badge, etc.)
    layout.css        ← Nav, footer, containers, sections
    pages/
      home.css        ← Homepage-specific styles
      about.css       ← Our Story page styles
      noodle.css      ← Meet Noodle page styles
      education.css   ← Education page styles
      contact.css     ← Contact / Get Involved page styles

  js/
    nav.js            ← Sticky nav, hamburger menu, active links, smooth scroll
    animations.js     ← IntersectionObserver fade-in & stagger + counter animation
    contact.js        ← Form tabs, validation, success handling

  data/
    config.json       ← Site-wide config (name, email, colors, social links)
    animals.json      ← Michigan wildlife species data
    programs.json     ← WildWise program / initiative data

  assets/
    images/           ← Place photos here (see assets/images/README.md)
    icons/            ← Favicon and icon files

  README.md           ← This file
```

---

## Getting Started (Local Development)

No build tools required. Open any HTML file directly in a browser — or run a simple local server:

```bash
# Python 3
python3 -m http.server 8000

# Node (npx)
npx serve .

# VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then visit: `http://localhost:8000`

---

## Deploying to GitHub Pages

1. Push your project to a GitHub repository
2. In GitHub → Settings → Pages → Source: `Deploy from a branch`
3. Select `main` branch, `/ (root)` folder
4. Save — GitHub will deploy at `https://yourusername.github.io/repo-name/`

**Custom domain:** Add a `CNAME` file to the project root with your domain:
```
wildwise.org
```
Then configure your DNS to point to GitHub Pages (see GitHub docs for DNS records).

**Note:** GitHub Pages serves 404.html automatically for unknown routes.

---

## Deploying to Netlify

### Option 1 — Netlify Drop (quickest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your project folder into the browser
3. Done — you'll get a live URL instantly

### Option 2 — Connected to GitHub (recommended)
1. Push your project to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import from Git"
3. Select your repo
4. Build command: *(leave empty)*
5. Publish directory: `.` (or the folder name)
6. Deploy

**Custom domain:** In Netlify → Site Settings → Domain Management → Add custom domain.

### Netlify Forms (Contact forms)
The contact forms are pre-configured for Netlify Forms with `data-netlify="true"`.
They will work automatically when deployed to Netlify — no backend needed.

To receive form submissions by email:
1. Deploy to Netlify
2. Go to: Site → Forms → form-name → Notifications → Add email notification

---

## Customization Checklist

Before launch, update these items:

### Content
- [ ] `data/config.json` — Add real social media URLs (instagram, facebook, tiktok)
- [ ] All pages — Update email `hello@wildwise.org` to a real address
- [ ] `about.html` — Replace founder photo placeholder with a real image
- [ ] `noodle.html` — Replace photo gallery placeholders with real Noodle photos
- [ ] All pages — Add real social media links in footer nav

### Images
- [ ] Add founder portrait → `assets/images/founder/`
- [ ] Add Noodle photos (hero + gallery) → `assets/images/noodle/`
- [ ] Create Open Graph share image → `assets/images/og/og-default.jpg` (1200×630px)
- [ ] Add favicon → `assets/icons/favicon.svg` (or .ico, .png variants)
- [ ] Replace `<div class="img-placeholder">` divs with real `<img>` tags

### OG / Meta
- [ ] Add `og:image` meta tags pointing to real OG image on each page
- [ ] Add `og:url` meta tags with real domain on each page

### Forms
- [ ] For Netlify: deploy and verify forms appear in Netlify Forms dashboard
- [ ] For mailto: change form `action` to `mailto:hello@wildwise.org` and add `enctype="text/plain"`
- [ ] Set up form submission notifications (Netlify dashboard or email)

### Misc
- [ ] `404.html` — works automatically on both GitHub Pages and Netlify
- [ ] Test all internal navigation links
- [ ] Test contact form submissions in staging

---

## Design Tokens (Quick Reference)

```css
--color-steel:  #33658a   /* Primary blue — links, interactive */
--color-sky:    #86bbd8   /* Light blue accent */
--color-olive:  #acb666   /* Olive — badges, labels, CTA highlights */
--color-navy:   #2f4858   /* Dark backgrounds, headings */
--color-forest: #455139   /* Buttons, logo "WISE" */
--color-cream:  #f7f9ef   /* Page background */

--font-display: 'Playfair Display'  /* Headings */
--font-body:    'DM Sans'            /* Body, UI */
--font-mono:    'DM Mono'            /* Code, data */
```

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge) — full support
- Uses CSS custom properties, IntersectionObserver, CSS Grid
- `prefers-reduced-motion` respected in animations.js
- Mobile-first responsive

---

## License

Copyright © 2025 WildWise. All rights reserved.
