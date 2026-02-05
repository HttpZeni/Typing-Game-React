## Typing Game

A React + TypeScript typing game built with Vite. Practice your speed and accuracy with randomized text samples, optional timers, and a results dashboard with a WPM over time chart.

## Features
- Randomized texts with three length options: short, medium, long
- Timer modes: 15s, 30s, 60s, or unlimited
- Live per-character feedback (correct/incorrect/current/upcoming)
- Auto-scroll to keep the active character centered
- Results screen with WPM, accuracy, errors, time, and a WPM line chart
- Keyboard-first flow with `Esc` to reset

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Chart.js + react-chartjs-2

## Getting Started
1. Install dependencies:
```bash
npm install
```

2. Start the dev server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview the production build:
```bash
npm run preview
```

## How to Play
- Click the typing area to focus (it auto-focuses on load).
- Start typing to begin the game.
- Use the toolbar to switch text length or timer mode.
- Press `Esc` to reset the current run.
- The results screen appears when time runs out or the text is finished.

## Customizing Texts
Text samples live in `src/data/texts.json`. Each entry has a `title` and `short`, `medium`, `long` variants. Add or edit entries to customize the pool.

## Project Structure
- `src/components`: UI building blocks (typing area, toolbar, results, chart)
- `src/tools`: game logic and data helpers
- `src/data`: text content and initial game data

## Scripts
- `npm run dev`: Start Vite dev server
- `npm run build`: Type-check and build
- `npm run lint`: Run ESLint
- `npm run preview`: Preview the production build
