# Immersive Competence AI

Polished **Next.js** research prototype for **UEF + ThingLink-style** AI-assisted competence analytics in mobile immersive scenarios. The UI demonstrates how learner interactions, reflections, and rubric-aligned evidence can surface as explainable insights for teachers and researchers. Data defaults to built-in mocks; optional **generated JSON** from the **`ml/`** pipeline (OULAD + Education Dialogue Dataset) replaces key dashboard views when present **(no backend, no login, no ThingLink API)**.

## ML pipeline (optional, local)

1. Copy **`anonymisedData.zip`** and **`Education-Dialogue-Dataset-main.zip`** into **`ml/data/raw/`** (see [`ml/README.md`](ml/README.md)).
2. Create a Python venv, install requirements, run the full pipeline:
   ```bash
   cd ml
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   python ml/run_pipeline.py
   ```
3. Generated dashboard JSON is written to **`src/lib/generated/`** (small, ~30â€“100 learners by default). The app loads these files via [`src/lib/dataset.ts`](src/lib/dataset.ts) and **falls back** to mocks if missing.

When generated data is present, the **TopBar** also shows **â€œAI baseline model Â· Public dataset prototypeâ€**, and **Model information / limitations** cards appear on **Dashboard**, **Analytics**, and **Research**.

## Prerequisites

- **Node.js 20+** and npm (install from [nodejs.org](https://nodejs.org/) if `npm` is not available in your terminal).

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The welcome page is `/`; the teacher dashboard is `/dashboard`.

**Push this folder to your GitHub repo (Windows):** install [Git for Windows](https://git-scm.com/download/win), then `cd` to the project root (folder with `package.json`) and run **one** of:

```cmd
scripts\complete-github-repo.cmd
```

```powershell
.\scripts\complete-github-repo.ps1
```

If PowerShell says scripts are disabled or `git` is not found, use **Command Prompt (cmd.exe)** and the `.cmd` file above, or run: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\complete-github-repo.ps1`.

Both scripts target `https://github.com/maya-tsedeke/immersive-competence-ai.git` and merge with an existing â€œfirst commitâ€ on GitHub if needed. For another remote, edit `REMOTE_URL` in `scripts\complete-github-repo.cmd` or `$RemoteUrl` in the `.ps1`.

**If GitHub rejects the push (large files > 100 MB):** blobs stay in history until you remove them. This repoâ€™s `.gitignore` keeps `ml/data/raw/`, `ml/data/processed/`, and `*.zip` out of future commits. Then either (1) in **Git Bash**: `bash scripts/purge-large-files-from-git-history.sh`, then `git push -u origin master --force-with-lease`, or (2) from **CMD** (replaces all history with one clean commit): `scripts\new-github-history.cmd`.

**Production build (Vercel / Node; recommended):**

```bash
npm run build
npm start
```

**Static export (GitHub Pages â€” no Node server):** sets `output: "export"`, `trailingSlash: true`, and `images.unoptimized: true`. PWA service worker is **off** for these builds.

```bash
npx cross-env NEXT_STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/your-repo-name npm run build
```

Artifact directory: **`out/`**. Use the same `NEXT_PUBLIC_BASE_PATH` you will use on `https://USER.github.io/your-repo-name/`.

See [`.env.example`](.env.example) for variable names.

## Hosting & deployment

### Option A â€” GitHub + Vercel (recommended for Next.js)

1. Push this repository to GitHub.
2. [Vercel](https://vercel.com/) â†’ **Add New Project** â†’ import the repo.
3. Framework **Next.js**; build **`npm run build`**; do **not** set `NEXT_STATIC_EXPORT`.
4. Leave **`NEXT_PUBLIC_BASE_PATH` unset** unless you deploy under a URL subpath.
5. Deploy; pushes to the connected branch trigger production builds.

**Why:** Full Next.js features (image optimization, production PWA), no `basePath` for the default `*.vercel.app` URL.

### Option B â€” GitHub Pages (static export)

| Concern | Notes |
|--------|--------|
| **`fs` / server runtime** | [`src/lib/data/loadGenerated.ts`](src/lib/data/loadGenerated.ts) uses `fs` **only at build time** to read `src/lib/generated/*.json`. Static HTML/JS in `out/` does not read the filesystem in the browser. **No API routes** are used. |
| **`/learners/[id]`** | [`generateStaticParams`](src/app/(main)/learners/[id]/page.tsx) pre-renders every id from **`getLearners()`** at build time. Commit generated JSON (or rely on mocks) so the list is complete. |
| **Client-only demo** | Learner + teacher workflow **`localStorage`** keys are unchanged and work on Pages. |
| **Assets** | [`public/.nojekyll`](public/.nojekyll) disables Jekyll. **`NEXT_PUBLIC_BASE_PATH`** drives [`next.config.ts`](next.config.ts) `basePath` / `assetPrefix` and [`manifest.ts`](src/app/manifest.ts). |

**Steps:**

1. **Settings â†’ Pages â†’ Build and deployment â†’ Source:** **GitHub Actions**.
2. Push to **`main`** or **`master`** (or run workflow manually). Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
3. Optional **Variables:** `NEXT_PUBLIC_BASE_PATH` = `/repository-name` (leading slash, no trailing). If omitted, the workflow defaults to **`/${{ github.event.repository.name }}`** for `https://USER.github.io/REPO/`.
4. After the job, open the **Pages** URL from repository **Settings â†’ Pages**.

**Root user site** (`https://USER.github.io` without `/REPO/`): use a `USER.github.io` repository and set `NEXT_PUBLIC_BASE_PATH` to empty in the workflow `run` script (or adjust defaults); subpath defaults do not apply.

**Optional:** Copy or symlink JSON into `public/generated/` only if you need direct HTTP fetch of raw files; the app does not require it today.

## Deployment checklist

- [ ] **`npm run build`** succeeds (Vercel path).
- [ ] **`NEXT_STATIC_EXPORT=1`** build with correct **`NEXT_PUBLIC_BASE_PATH`** succeeds; **`out/`** is produced.
- [ ] Site loads at the public URL; **deep links** work (with **trailing slash** for static export).
- [ ] **`/preview/`** learner flow works; **`localStorage`** evidence + teacher workflow update.
- [ ] **Run AI analysis** / **teacher decision** still work after deploy.
- [ ] With **`src/lib/generated/*.json`** present at build time, dashboard reflects generated data.
- [ ] Remote **images** load (`images.unoptimized` on static export).

## PWA (installable app)

- **Manifest** and **icons** are defined in [`src/app/manifest.ts`](src/app/manifest.ts) and [`public/icons/`](public/icons/).
- **Theme color** and **mobile metadata** (viewport, `appleWebApp`, icons) are set in [`src/app/layout.tsx`](src/app/layout.tsx).
- **Service worker** generation uses [`@ducanh2912/next-pwa`](https://github.com/DuCanhGH/next-pwa) in [`next.config.ts`](next.config.ts). It is **disabled in development** and **disabled when `NEXT_STATIC_EXPORT=1`** (GitHub Pages). For install prompts, use **`npm run build` + `npm start`** or **Vercel**.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing / welcome â€” entry to the prototype |
| `/dashboard` | Teacher dashboard (KPIs, trends, completion, insight, quick actions, phone preview on large screens) |
| `/scenarios` | Scenarios hub for the active immersive experience |
| `/learners` | Searchable learner list with filters |
| `/learners/[id]` | Learner detail (e.g. `B221`) â€” AI summary, misconception, rubric, timeline |
| `/analytics` | Scenario analytics â€” timeline, hotspots, pathway, engagement |
| `/ai-insights` | Class-level AI summary cards with confidence + â€œteacher can editâ€ note |
| `/preview` | Standalone **learner** mobile flow (start â†’ MCQ â†’ reflection â†’ confirmation) |
| `/research` | Research pipeline diagram, OULAD â†’ ThingLink field mapping, future ThingLink fields |
| `/reports` | Report preview + export buttons (prototype alerts only) |
| `/settings` | Placeholder settings copy |
| `/ai-workflow` | AI learning workflow demo (learner â†’ AI â†’ teacher) |
| `/manifest.webmanifest` | PWA manifest |

## Product notes

- A **â€œResearch prototype Â· Mock dataâ€** badge appears in the teacher **TopBar** (with an additional **AI baseline** chip when `src/lib/generated/` is populated).
- The teacher **TopBar** uses working **scenario** and **date range** `<select>` controls (client-side only; they do not yet re-query data).
- The **sidebar product title** links back to the **welcome** page (`/`). Unknown routes show a simple **`not-found`** screen with links to `/` and `/dashboard`.
- **Export Report**, **Generate Feedback Draft**, **PDF**, **CSV**, and **Share** trigger **demo `alert()` placeholders** â€” no files are generated.

Built for research demonstration between UEF and partners such as ThingLink. Adapt copy and data modules freely for academic presentations.
