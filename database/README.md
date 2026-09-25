# StudyFlow database seeds

This folder contains the JSON data bundled into StudyFlow:

- `career-roadmap.json` is the backend, DSA, and AI internship roadmap.
- `subject-roadmaps/roadmapPYTHON.json` is the academic Python and DSA roadmap.
- `subject-roadmaps/template.json` is a copyable template for future uploads.

The Vite app imports these files at build time. Roadmap completion and study sessions are saved in the browser through the storage abstraction in `src/utils/storage.js`, so the app remains fully hostable on Vercel without a writable server filesystem.

The app can sync the durable local data to Supabase when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. Run `supabase-schema.sql` in the Supabase SQL editor first. Anonymous sign-in must also be enabled under Authentication > Providers > Anonymous.

Vercel deployments should not try to write directly to these JSON files because deployed assets are read-only.

## Supabase and Vercel setup

1. Run `supabase-schema.sql` in the Supabase SQL editor.
2. Enable anonymous sign-ins in Supabase Authentication settings.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Project Settings > Environment Variables for Preview and Production.
4. Redeploy Vercel. The Settings screen reports the sync status and includes a manual `Sync Now` action.

The app still works offline when these variables are absent. Existing browser data is uploaded on the first configured session; later sessions load the cloud copy.

## Add a roadmap from the app

1. Copy `subject-roadmaps/template.json` and edit its title, description, phases, topics, and resources.
2. Open Study Buddy and select the **Roadmap** tab.
3. Select **Subject roadmap**, choose **Upload JSON**, and select your file.
4. The uploaded roadmap is saved in this browser and appears as a new roadmap button.

Each phase must have a `name` and a `topics` array. `duration`, `resources`, `weekly_rhythm`, and `tip` are optional.
