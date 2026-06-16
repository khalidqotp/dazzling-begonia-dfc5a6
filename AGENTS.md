# Developer & Agent Architecture Guide (AGENTS.md)

This document provides a highly detailed map of the Japanese Conjugation Explorer codebase. It explains the design decisions, linguistic rules, database schema, and styling configurations for developers and future AI agents working on this project.

---

## 🏗️ Core Architecture & File Layout

The application is structured as a client-side Single Page Application (SPA) driven by **TanStack Start**, leveraging local SQLite loading via WebAssembly (`sql.js`).

```
├── public
│   ├── dictionary.sqlite      # Pre-baked SQLite dictionary database
│   └── sql-wasm.wasm          # Compiled WebAssembly binary for sql.js (loaded locally)
├── scripts
│   └── init_db.sql            # Seeding SQL script for the dictionary entries
├── src
│   ├── lib
│   │   ├── conjugation.ts     # Japanese conjugation rules & reverse stemmer (Pure NLP)
│   │   └── db.ts              # SQLite database fetch, WASM bootloader & queries (sql.js)
│   ├── store
│   │   └── useDbStore.ts      # Global React state hook, debouncer & active selections
│   ├── routes
│   │   ├── __root.tsx         # TanStack root shell document
│   │   └── index.tsx          # Main Dashboard View (Obsidian glass UI & matrix render)
│   ├── router.tsx             # TanStack Router instantiation
│   └── styles.css             # Tailwind v4 globals, custom fonts & background glows
├── README.md                  # User-facing manual
└── AGENTS.md                  # Architectural & technical design documentation (this file)
```

---

## 🗄️ 1. Database Schema (`entries` table)

The SQLite database file `/dictionary.sqlite` is fetched as an `ArrayBuffer` on mount and loaded directly into memory. 

- **Table:** `entries`
- **Columns:**
  - `sequence` (INTEGER PRIMARY KEY): Unique identifier.
  - `term` (TEXT): The Kanji/Kana word (e.g., `"行く"`, `"忘れる"`, `"寒い"`).
  - `reading` (TEXT): Pronunciation reading in Hiragana (e.g., `"いく"`, `"わすれる"`, `"さむい"`).
  - `pos` (TEXT): Space-separated Part-Of-Speech flags (e.g., `"v5k vi"`, `"v1 vt"`, `"adj-i"`).
  - `score` (INTEGER): Frequency score of the entry (e.g., `100` is highly common).
  - `tags` (TEXT): Dictionary tags / JLPT or frequency ratings (e.g., `"⭐ ichi1"`).
  - `definitions` (TEXT): JSON-stringified array of strings (e.g., `'["to go", "to move"]'`).
  - `notes` (TEXT) & `forms` (TEXT): JSON-stringified arrays for extra footnotes.

---

## 🗣️ 2. Japanese NLP & Conjugation Engine (`src/lib/conjugation.ts`)

This module manages all programmatic Japanese linguistic operations without relying on any external APIs or parser packages.

### Part-Of-Speech Checks
We split the `pos` column on spaces and test against JMDict conventions:
- **Ichidan Verbs (`v1`)**: Drop 'る' to obtain the core verb stem.
- **Godan Verbs (`v5*`)**: Conjugate using 5-row hiragana charts. Each subclass matches its ending:
  - `v5k` (く), `v5g` (ぐ), `v5s` (す), `v5t` (つ), `v5n` (ぬ), `v5m` (む), `v5r` (る), `v5w` (う), `v5b` (ぶ)
- **Irregulars (`vk`, `vs`)**:
  - `vk` -> `来る` (くる) and its compounds.
  - `vs` -> `する` and compound nouns + `する` (e.g., `勉強する`). The engine isolates the base noun and conjugates the `する` suffix cleanly.
- **I-Adjectives (`adj-i`)**: Drops final 'い' to obtain the adjective stem.

### Reverse Stemming (Search-by-Conjugation)
To prevent "lemma hallucination" (e.g. mapping "行けば" to "行う" instead of "行く"), `reverseStem()` employs a highly deterministic ending-mapping strategy:
1. Splits endings like `ば` (conditional), `ない` (negative), `た`/`だ` (past), `て`/`で` (te-form), and `ます` family (polite).
2. Maps phonetic e-rows or a-rows back directly to their respective u-row originals (e.g. `けば` $\rightarrow$ `く` for Godan `v5k`; `れば` $\rightarrow$ `る` for Ichidan or `v5r`).
3. Reassembles candidate dictionary forms and queries the database for those exact candidates.

---

## 🎨 3. UX Design & Interactions (`src/routes/index.tsx`)

- **Dark Obsidian Theme:** Constructed around `#050508` (obsidian black) and `#0f0e0c` (shadowy navy) with crisp off-white `#f3f4f6` content elements.
- **Calligraphy Typography:** Heads and Japanese characters utilize the `Noto Serif JP` Google font for an authentic calligraphy brush style.
- **Automatic Matching Cell Highlights:** When a user searches for a word, the search term is cross-referenced against the generated matrix cells. Any cell matching the query is instantly styled with:
  - Glowing purple or indigo border rings.
  - Transparent overlay backdrops.
  - A beautiful top-right "Search Match" badge.
- **Debounced Custom Search:** Includes a 300ms custom React hook `useDebounce` to trigger dictionary searches instantly on-type, providing responsive autocomplete feedback.
- **Centering Loading States:** Centered animation saying `"Loading Japanese Dictionary Core..."` with an indigo spinning ornament during WebAssembly/DB bootloader phase.
