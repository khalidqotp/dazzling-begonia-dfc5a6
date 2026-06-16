# 日本語活用探検家 (Japanese Conjugation Explorer)

A highly sophisticated, local-first Japanese Conjugation Explorer application designed for language learners and NLP enthusiasts. It operates completely in-browser utilizing React, TypeScript, Vite, Tailwind CSS 4, and WebAssembly SQLite (`sql.js`).

## ✨ Features

- **WebAssembly SQLite Core:** Loads and queries a pre-baked dictionary SQLite database directly in-browser. Zero backend required, zero external API dependencies, and completely offline-ready.
- **Robust Conjugation Engine:** Handcrafted, linguistically accurate rules for:
  - **Ichidan Verbs (`v1`)**
  - **Godan Verbs** across all classic 5-row subdivisions (`v5k`, `v5s`, `v5t`, `v5n`, `v5m`, `v5r`, `v5w`/`v5u`, `v5g`, `v5b`)
  - **Irregular Verbs** (`vk` - 来る, `vs` - する / compound nouns with する)
  - **I-Adjectives (`adj-i`)**
- **Linguistic Reverse Stemming:** Advanced reverse-engineering algorithm that parses conjugated words (like "行けば", "忘れた", "寒くない") back to their proper dictionary lemmas, preventing lemma hallucinations (e.g. correctly mapping "行けば" to "行く" rather than "行う").
- **Interactive Match Highlighting:** Searches trigger instant lookups. If the searched word is a conjugated form, the app automatically highlights the exact matching casual or polite cell inside the matrix with a glowing indigo-purple border and a "Search Match" badge.
- **Premium Obsidian Dark UI:** Dark, elegant theme with brush calligraphy heading typography (`Noto Serif JP`), subtle glowing border highlights, and radiant radial gradients.

## 🛠️ Technology Stack

- **Framework:** React 19 (via TanStack Start)
- **Database:** `sql.js` (WebAssembly build of SQLite 3)
- **Styling:** Tailwind CSS 4 (using native modern CSS imports and OKLCH color variables)
- **Routing:** TanStack Router
- **Icons:** Lucide React

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate SQLite Database (Optional)
A pre-baked SQLite file named `dictionary.sqlite` is already placed in the `public/` directory. If you ever need to recreate or seed it, run:
```bash
sqlite3 public/dictionary.sqlite < scripts/init_db.sql
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to the port indicated in the terminal (usually `http://localhost:3000`).
