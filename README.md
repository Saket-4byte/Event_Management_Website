# Eventora 🎟️
> **"Discover. Experience. Celebrate."**

A premium, modern, and fully responsive Event Discovery & Registration Web Application built with vanilla web standards (HTML5, CSS3, ES6+ JavaScript, LocalStorage, Lucide Icons, and Google Fonts).

- **GitHub Repository:** [https://github.com/Saket-4byte/Event_Management_Website](https://github.com/Saket-4byte/Event_Management_Website)
- **Live Demo (GitHub Pages):** [https://saket-4byte.github.io/Event_Management_Website/](https://saket-4byte.github.io/Event_Management_Website/)

---

## 🎨 Visual Identity & Design System

- **Background Palette:** Dark Navy (`#0B1020`) with rich dark surface cards (`#131B32`) and elevated elements (`#18223E`).
- **Primary Accent:** Vivid Electric Orange (`#FF6B35`) with subtle glow effects for primary call-to-actions.
- **Secondary Accent:** Royal Deep Purple (`#7C5CFC`) for spotlight badges, highlights, and secondary interactions.
- **Typography:**
  - **Headings & Display:** [Manrope](https://fonts.google.com/specimen/Manrope) (Punchy, modern, geometric display font).
  - **Body & Controls:** [Inter](https://fonts.google.com/specimen/Inter) (Highly legible neo-grotesque font optimized for UI).
- **Theming:** Default Dark Navy mode with a high-contrast Light mode toggle, respecting user and system preferences (`prefers-color-scheme`).
- **Iconography:** Scalable [Lucide Icons](https://lucide.dev/).

---

## 🎪 Event Categories & Catalog

Eventora features 12 realistic sample events spanning the 6 primary categories:
1. **Technology:** Future AI & Autonomous Systems Summit 2026, CloudNative & Microservices Expo.
2. **Music:** Neon Odyssey Electronic Music Festival, Symphonic Twilight & Chamber Ensemble.
3. **Sports:** Urban Sprint & Functional Athletics Challenge, Pacific Coastline Half Marathon & 10K.
4. **Workshops:** Hands-On UI/UX Design System Masterclass, Full-Stack Web Performance & Edge Computing.
5. **Business:** VentureScale Global Startup & Investor Summit, FinTech Innovate & Global Commerce Forum.
6. **Art & Culture:** Modern Digital Art & XR Gallery Night, Heritage Ceramic & Sculpture Expo.

All events feature valid future dates (November 2026 through February 2027) with venue, organizer, capacity, price, and rich descriptions.

---

## ⏱️ Event Details & Live Countdown Timer

Clicking **"View Details"** on any event card opens an event details modal displaying:
- Large cover image with category and featured badges.
- Event title, tagline, and comprehensive full description.
- Date, start time, venue, and city.
- Organizer and host credits.
- Admission price and remaining available seats.
- **Real-Time Countdown Timer:** Ticking countdown showing **Days**, **Hours**, **Minutes**, and **Seconds** until start time (updating every second).
- **Status Notification:** Gracefully displays an informational banner if an event has already started or ended.
- **Prominent "Register Now" Button:** Automatically forwards the selected event ID to the registration form and opens the reservation dialog.
- **Responsive & Accessible Controls:** Close button, backdrop click dismissal, and `Escape` key support with automatic timer cleanup.

---

## 📁 File Structure

```text
eventora/
│
├── index.html              # Semantic HTML structure & accessible dialogs
├── css/
│   └── style.css           # Design tokens, Dark Navy/Light themes, responsive grid & animations
├── js/
│   ├── data.js             # 12 sample events across 6 categories & LocalStorage sync
│   ├── theme.js            # Theme switcher (Dark Navy / Light) with persistence
│   ├── events.js           # Event card renderers, details view markup, and countdown engine
│   ├── registration.js     # Field validation, registration processing, pass generation & cancellation
│   └── app.js              # Application entrypoint, countdown orchestration & modal coordination
├── assets/
│   └── images/             # Static graphics and promotional assets
└── README.md               # Project documentation
```

---

## 📝 Event Registration System

The registration system is a pure frontend, client-side implementation using modern browser APIs and `localStorage`.

### 1. Mandatory Fields & Strict Client-Side Validation
- **Full Name:** Required, minimum 3 characters, letters, spaces, hyphens, and apostrophes only (`/^[a-zA-Z\s'-]+$/`).
- **Email Address:** Required, valid RFC-compliant format (`/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/`).
- **Phone Number:** Required, valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (`/^[6-9]\d{9}$/`). Automatically normalizes country codes (`+91`, `91`, `0`), spaces, and hyphens.
- **Selected Event:** Required, auto-populates when clicking "Register Now" from any card or details modal. Prevents registration for expired events, prevents registration when available seats are 0 (Sold Out), and prevents duplicate registration by the same email for the same event.

### 2. Form Behavior & Validation UX
- **No `alert()` Calls:** Zero native browser alerts are used. Inline error messages appear immediately underneath invalid fields with red borders (`.is-invalid`).
- **Real-Time Error Removal:** Inline error messages and invalid borders clear as soon as the user enters valid data.
- **Seat Inventory Synchronization:** Upon successful registration, `event.availableSeats` is decremented in `localStorage`, and all rendered event cards in both Featured and Upcoming sections update their seat count immediately in real time without requiring a page reload.
- **Unique Registration ID:** Generates an official, unique identifier (e.g., `EVT-REG-MW0SHTM0-ZF2J`).
- **Digital Pass Confirmation:** Displays a high-contrast official event voucher inside the modal with attendee details, registration ID, date, venue, and a security badge.
- **My Registrations Modal:** Attendees can view their active reservations anytime via the header badge or footer link, view individual digital vouchers ("View Pass"), or cancel their registration with a custom confirmation dialog to automatically restore their seat back into inventory.

---

## 🌟 Bonus Features & Enhancements

### 1. Dark and Light Mode System
- **Theme Switcher:** Seamless header toggle with icon animation (Sun for Dark Mode, Moon for Light Mode).
- **Consistent Palettes:** Deep Dark Navy (`#0B1020`) default with high-contrast surfaces (`#10162A`, `#131B32`), alongside a clean, crisp Light Mode (`#F8FAFC`, `#FFFFFF`, `#F1F5F9`).
- **Persistence:** Selected theme persists in `localStorage` under `eventora_theme` and automatically restores across refreshes.
- **Toast Feedback:** Displays an informative toast notification when switching themes.

### 2. Live Event Countdowns
- **Card-Level Countdown Badges:** Every rendered event card displays a live countdown pill (e.g. `Starts in 14d 6h` or `Starts in 3h 12m 45s`).
- **Second-by-Second Updates:** A background interval ticks every 1,000ms across all visible cards.
- **Graceful Expiration:** Past or concluded events display a muted `Concluded` badge, and the event details modal flags them with a clear alert notice.

### 3. Smooth Animations & Accessibility
- **Viewport Scroll Animations:** Sections and cards fade and slide up smoothly as they enter the screen using `IntersectionObserver`.
- **Card & Button Micro-Interactions:** Subtle lift effects (`translateY`), glowing drop shadows, and border-accent transitions on hover.
- **Accessibility (`prefers-reduced-motion`):** Clean CSS overrides eliminate transitions and scroll animations for users who prefer reduced motion.

### 4. Advanced Registration Management
- **My Registrations Hub:** View all booked passes with Registration ID, Participant Name, Event Name, and Booking Date.
- **View Pass Dialog:** Direct access to review the full digital voucher for any previous registration.
- **Safe Cancellation Flow:** Custom confirmation modal (replaces native `window.confirm`) that safely releases the seat (+1) back to the public pool and leaves all other registrations untouched.

### 5. Host an Event (Curation Proposal)
- **Community Event Submission:** Organizers can propose an event to the Eventora curation team via the **"Host an Event"** modal.
- **Review Workflow:** Submissions require editorial curation and are queued for review within 24 hours (proposals are not automatically published to the live public catalog by attendees).
- **Validation & Feedback:** Validates event name, city/venue, and organizer email with inline feedback and toast notifications.

### 6. Polished User Experience (UX)
- **Toast Notification Engine:** Stacking notifications in the bottom-right for theme changes, filter resets, pass generation, and cancellations.
- **Tactile Loading States:** Submit buttons display animated spinners and feedback states during reservation processing.
- **Rich Empty States:** Informative empty state graphics with direct call-to-actions when searches return zero events or when no registrations exist yet.
- **Click-to-Copy:** Click any Registration ID on a pass to copy it straight to your clipboard with a confirmation toast.

---

## 🚀 How to Run the Project

Since Eventora uses standard ES6 JavaScript modules (`type="module"`), run it via a local static web server to avoid browser CORS restrictions on `file://`:

### Option 1: Python 3
```powershell
python -m http.server 8000
```
Then visit: [http://localhost:8000](http://localhost:8000)

### Option 2: Node.js (npx serve or live-server)
```powershell
npx serve .
```
or
```powershell
npx live-server
```

### Option 3: VS Code / IDE Extension
- Right-click `index.html` and select **"Open with Live Server"**.

---

## 🌐 Production Deployment Instructions

Eventora is built purely with web standards (HTML5, CSS3, Vanilla ES6+ JavaScript) and requires zero backend or server build steps. It deploys seamlessly across all standard static hosting platforms:

### 1. GitHub Pages
1. Push the `eventora` project directory to a GitHub repository.
2. In your GitHub repository, open **Settings** $\rightarrow$ **Pages**.
3. Under **Branch**, select `main` (or `master`) and `/ (root)` folder.
4. Click **Save**. Your site will be published at `https://<username>.github.io/<repository-name>/`.

### 2. Netlify
1. Log in to [Netlify](https://app.netlify.com).
2. Drag and drop the `eventora` folder directly into the Netlify dashboard, or connect your Git repository.
3. Keep the build command empty and set publish directory to `.` (root).
4. Click **Deploy Site**.

### 3. Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository, leave Framework Preset as **Other**, and set Root Directory as `./`.
3. Click **Deploy**. All asset paths and ES6 modules work immediately.
