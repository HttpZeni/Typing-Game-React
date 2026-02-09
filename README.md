# Typing Game

A simple typing game built with React and TypeScript to help you practice your typing speed and accuracy. It generates random text samples, offers different timer modes, and gives you a results screen with a WPM (Words Per Minute) chart.

## Features
- Randomized text samples with three length options: short, medium, and long
- Timer modes: 15s, 30s, 60s, or unlimited
- Live feedback per character (correct/incorrect/current/upcoming)
- Auto-scroll to keep the active character in view
- Results screen showing WPM, accuracy, errors, time, and a WPM line chart
- Keyboard-first flow, with `Esc` to reset anytime
- Theme switcher with multiple visual presets
- Optional profile view with stats and account settings (Supabase)
- Modular chart component with multi-series support

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Chart.js + react-chartjs-2
- Supabase (auth + stats storage)

## Getting Started

### 1. Install dependencies
First, clone this repo and install the required dependencies:
```bash
npm install
```

### 2. Start the dev server
To run the project locally, use the following command:
```bash
npm run dev
```
This will start a development server at http://localhost:3000.

### 3. Build for production
To build the project for production:
```bash
npm run build
```
This will create an optimized production build in the `dist/` folder.

### 4. Preview the production build
To preview your production build locally:
```bash
npm run preview
```
This will start a server that serves your production build.

## Environment Setup
If you want login/profile + stats syncing, configure Supabase in `.env`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
Without these variables, the game still runs, but profile/stat sync features are unavailable.

## How to Play
- Click the typing area to focus (it auto-focuses when the page loads).
- Start typing to begin the game.
- Use the toolbar to switch between text length or timer mode.
- Press `Esc` to reset the current game.
- The results screen will appear when time runs out or when the text is completed.

## Customizing Texts
You can customize the text samples used in the game by editing the `src/data/texts.json` file. Each text entry contains a title and three variants: short, medium, and long. You can add new texts or modify existing ones here.

## State Management
Shared game state (e.g., `game`, `showResults`, `stats`) lives in a lightweight React Context store under `src/state`. Components can access it via `useGameStore()`.

## UI Utilities
- `Tooltip` component in `src/components/ui/Tooltip.tsx` for hover labels.
- `Graph` component takes `data`, `xKey`, and `series` to plot multiple lines from the same dataset.

## Project Structure
- `src/components`: Contains all the UI components like typing area, toolbar, results, and chart.
- `src/state`: Global game store (React Context).
- `src/utils`: Game logic and helper functions to manage text, timer, and results.
- `src/services`: Data access, Supabase helpers, and text selection.
- `src/storage`: LocalStorage helpers.
- `src/data`: Text content and initial game data like timer modes and text lengths.

## Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the project for production.
- `npm run lint`: Runs ESLint for code linting.
- `npm run preview`: Previews the production build locally.
