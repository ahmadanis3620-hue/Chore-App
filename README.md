# Cross Creek Chore Connect

A lightweight neighborhood app prototype for matching local families with people willing to help with chores.

## Current features

- Login gate before entering the app.
- Goal selection after login:
  - **I want to get work done** (post chores + browse all chores)
  - **I want to do work** (browse chores + mark interest)
- Chore listing with search and max-budget filters.
- Local browser storage for demo data.

## Important before you deploy

This version stores chores in each person's browser (`localStorage`), so posts are **not shared** across users yet. If you deploy this exact build, everyone can use the app link, but each person will only see their own local posts.

If you want a true neighborhood board, add a hosted database/API (example options below).

## Run locally

Open `index.html` directly in your browser, or run:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## How to download this app

### Download as a ZIP

1. Open your GitHub repository page.
2. Click **Code**.
3. Click **Download ZIP**.
4. Unzip the folder.

### Download with Git

```bash
git clone https://github.com/<your-username>/Chore-App.git
cd Chore-App
```

---

## Fastest way to deploy and share (today)

### Option A: GitHub Pages (free)

1. Push this repo to GitHub.
2. In GitHub, go to **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or your default branch) and `/ (root)`
4. Save.
5. After deployment, GitHub gives a public URL like:
   `https://your-username.github.io/Chore-App/`
6. Share that URL in your neighborhood Facebook group.

### Option B: Netlify Drop (free, easiest no-code)

1. Go to <https://app.netlify.com/drop>
2. Drag and drop the project folder.
3. Netlify gives you a live URL instantly.
4. Share that URL.

---

## Make it truly shared for all neighbors

To let everyone see the same chores, connect to a backend.

### Recommended simple stack

- **Frontend hosting:** GitHub Pages / Netlify / Vercel
- **Database + API:** Supabase (Postgres + REST)
- **Auth (optional):** magic link or Google sign-in

### Minimal data model

`chores` table:

- `id` (uuid, primary key)
- `role` (text)
- `name` (text)
- `title` (text)
- `details` (text)
- `budget` (numeric)
- `needed_by` (date)
- `created_at` (timestamp)
- `neighborhood` (text, e.g. `cross-creek`)

### High-level migration steps

1. Create a Supabase project and `chores` table.
2. Add Row Level Security policies (read/write rules).
3. Replace `localStorage` reads/writes in `app.js` with Supabase calls:
   - `select` for listing chores
   - `insert` for posting chores
4. Add simple moderation fields (`status`, `flag_count`) for safety.
5. Redeploy frontend and test from two different devices.

---

## Safety suggestions before public launch

- Require parent approval flow for minors.
- Avoid posting exact street addresses publicly.
- Add reporting and admin moderation.
- Add rate limiting / anti-spam protection.
- Include clear community rules and emergency disclaimer.
