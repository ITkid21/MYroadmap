# ✦ StudyFlow — Study Partner & Roadmap

Welcome to **StudyFlow**, a responsive study partner built with **React**, **Vite**, and **Tailwind CSS**. It records study sessions and provides the backend, DSA, AI, and subject roadmaps in one main interface.

---

## 🚀 How to Run the Website Right Now (Instant 1-Click Launch)

You don't need to know programming or install complex software to use StudyFlow right away!

### Method 1: The One-Click Launcher (Easiest for Beginners)
1. Open this folder: `study tracker` on your computer.
2. Double-click the file named **`start-studyflow.bat`** (or double-click **`StudyFlow.html`**).
3. StudyFlow will instantly open in your default web browser (Chrome, Edge, Firefox, or Brave). Everything works immediately offline and online!

---

## 💻 Method 2: Running with Node.js & Vite (Full Developer Setup)

If you have [Node.js](https://nodejs.org/) installed:

1. Open **Command Prompt** or **PowerShell** in this folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Your terminal will display a local address, typically:
   ```
   http://localhost:3000
   ```
5. Click or open that link in your browser to see your app running live with hot-reloading!

---

## 📂 Project Structure Explained in Simple Terms

Here is what each file and folder does:

```
study tracker/
├── StudyFlow.html           # Standalone zero-setup version (double-click to run anywhere)
├── start-studyflow.bat      # Windows 1-click launcher script
├── index.html               # Main HTML entry point for the Vite web application
├── package.json             # List of libraries (React, Tailwind, Lucide, Canvas Confetti)
├── vite.config.js           # Vite server and build configuration
├── tailwind.config.js       # Styling configuration with custom color themes & dark mode
├── postcss.config.js        # CSS processing engine for Tailwind
├── src/
│   ├── main.jsx             # React entry point that mounts the application to the browser
│   ├── App.jsx              # Main application shell with navigation and theme switcher
│   ├── index.css            # Global CSS styles, animations, and font settings
│   ├── components/
│   │   ├── Roadmap.jsx       # Career and academic roadmap views linked to study timers
│   │   ├── Sidebar.jsx      # Navigation sidebar (Dashboard, Subjects, Timer, etc.)
│   │   ├── Dashboard.jsx    # Overview metrics, streak counter, and daily goal progress
│   │   ├── SubjectManager.jsx # Add, edit, reorder, and safely delete study subjects
│   │   ├── StudyTimer.jsx   # Precision stopwatch with pause exclusion & midnight split
│   │   ├── PomodoroTimer.jsx# 25m focus / 5m break timer (breaks never count in stats)
│   │   ├── StudyAnalytics.jsx # 7-day velocity chart, subject distribution & filters
│   │   ├── StudyHistory.jsx # Searchable & editable study log table with CSV export
│   │   ├── DailyGoals.jsx   # Set daily targets and view milestone progress
│   │   ├── SettingsModal.jsx# Backups (JSON import/export), durations, and clear data
│   │   ├── ConfirmationModal.jsx # Reusable popup modal to prevent accidental deletions
│   │   └── Toast.jsx        # Subtle feedback alerts (Saved, Deleted, Updated)
│   └── utils/
│       ├── storage.js       # Saves everything safely into your browser's localStorage
│       ├── timeUtils.js     # Timestamp calculations, streak math, and midnight splitter
│       ├── audioUtils.js    # Built-in synthesizer for pleasant bell & chime audio
│       └── exportImport.js  # JSON backup validator and CSV export generator
├── database/
│   ├── career-roadmap.json   # Backend, DSA, and AI internship roadmap seed
│   ├── subject-roadmaps/     # Academic roadmap JSON seeds
│   └── README.md             # Vercel storage and database notes
```

---

## 🌟 Key Features

0. **Integrated Roadmaps**:
   - Study Buddy is the main interface for both tracking and planning.
   - Backend + DSA and subject-wise roadmaps are available from the Roadmap tab.
   - Roadmap milestones can launch a matching subject timer.
   - Completion state is saved with the rest of the local StudyFlow data.

1. **Subject Management**:
   - Add unlimited subjects (comes preloaded with *Mathematics*, *DBMS*, *DSA*, and *Python*).
   - Custom color coding for each subject.
   - Configure individual daily and weekly study goals.
   - Reorder subjects up and down.
   - Confirmation dialog before deleting a subject (warns you if study records exist).

2. **Study Timer (Stopwatch Mode)**:
   - Large, clear `HH:MM:SS` stopwatch display.
   - Choose your subject and start focusing.
   - Start, Pause, Resume, and Finish buttons.
   - **Paused time never counts** toward study time.
   - **Crash & Refresh Resilient:** Uses real timestamps, so reloading your browser or closing the tab won't lose your running session.
   - **Midnight Crossing Support:** If you study past midnight (e.g., 11:30 PM to 1:15 AM), the time is accurately divided between the two calendar dates so your daily stats stay 100% correct!

3. **Dashboard**:
   - Total study time Today, Past 7 Days, Past 30 Days, and Lifetime.
   - Current study streak counter in consecutive days.
   - Visual progress bar toward your daily target.
   - Subject breakdown with quick "▶ Study" launch buttons.

4. **Study Analytics**:
   - Interactive 7-day daily study velocity chart with hover tooltips.
   - Subject distribution breakdown with percentage shares.
   - Date range filters: *Last 7 Days*, *Last 30 Days*, *All Time*, and *Custom Date Range*.

5. **Study History**:
   - Complete tabular log with date, subject, start time, end time, duration, and optional notes.
   - Filter by subject and date. Search notes by keywords.
   - Edit or delete any session with immediate dashboard recalculation.
   - Export your entire history to **CSV** (for Excel or Google Sheets).

6. **Pomodoro Timer**:
   - 25-minute focus intervals, 5-minute short breaks, 15-minute long breaks.
   - Completed cycle counter.
   - Browser notification and audio chime when intervals end.
   - **Breaks never count** as study time.

7. **Daily Goals**:
   - Set overall study target (e.g. 4 hours).
   - Milestone badges and motivational progress messages.
   - Celebratory **confetti burst** when you hit 100% of your daily goal!

8. **Data Storage & Privacy**:
   - Stored 100% privately in your browser's `localStorage`—no database setup or subscription needed.
   - Export complete backups in **JSON** format to restore anytime.
   - Strict validation protects imported files from corruption.

---

## 🌐 How to Deploy to Vercel or Netlify (Free Hosting)

Deploy `MY-study-Buddy-main` as the Vercel project root. The included `vercel.json` configures the Vite build and SPA fallback. The old `bigROADmap` Python server is no longer required for the merged interface.

When you want to access your StudyFlow app from any computer or phone via the internet:

### Option A: Deploying on Vercel (Recommended)
1. Create a free account at [vercel.com](https://vercel.com/).
2. Push your project folder to GitHub, or install the Vercel CLI (`npm install -g vercel`).
3. In the `MY-study-Buddy-main` folder, run:
   ```bash
   vercel
   ```
4. Follow the short prompts. Vercel will automatically detect Vite, build your application, and give you a free live URL (e.g., `https://studyflow.vercel.app`)!

### Option B: Deploying on Netlify
1. Create a free account at [netlify.com](https://netlify.com/).
2. Run `npm run build` in your folder. This creates a `dist/` folder containing the compiled website.
3. In Netlify's dashboard, drag and drop the `dist/` folder into the Netlify Drop area.
4. Your website is instantly live online for free!
