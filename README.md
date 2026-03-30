# Cross Creek Chore Connect

A lightweight neighborhood app prototype for matching local families with people willing to help with chores.

## Current features

- Login gate before entering the app.
- Goal selection after login:
  - **I want to get work done** (post chores + browse all chores)
  - **I want to do work** (browse chores + mark interest)
- Chore listing with search and max-budget filters.
- Local browser storage for demo data.

## Run locally

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

## Important limitation

This demo currently uses `localStorage`, so data is not shared between different users/devices yet.
