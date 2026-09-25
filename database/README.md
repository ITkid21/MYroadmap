# StudyFlow database seeds

This folder contains the JSON data bundled into StudyFlow:

- `career-roadmap.json` is the backend, DSA, and AI internship roadmap.
- `subject-roadmaps/roadmapPYTHON.json` is the academic Python and DSA roadmap.
- `subject-roadmaps/template.json` is a copyable template for future uploads.

The Vite app imports these files at build time. Roadmap completion and study sessions are saved in the browser through the storage abstraction in `src/utils/storage.js`, so the app remains fully hostable on Vercel without a writable server filesystem.

For shared multi-device accounts later, replace the storage methods with a hosted database or API. Vercel deployments should not try to write directly to these JSON files because deployed assets are read-only.

## Add a roadmap from the app

1. Copy `subject-roadmaps/template.json` and edit its title, description, phases, topics, and resources.
2. Open Study Buddy and select the **Roadmap** tab.
3. Select **Subject roadmap**, choose **Upload JSON**, and select your file.
4. The uploaded roadmap is saved in this browser and appears as a new roadmap button.

Each phase must have a `name` and a `topics` array. `duration`, `resources`, `weekly_rhythm`, and `tip` are optional.
