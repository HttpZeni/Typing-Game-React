# Typing Game

A simple typing game built with React and TypeScript to help you practice your typing speed and accuracy. It generates random text samples, offers different timer modes, and gives you a results screen with a WPM (Words Per Minute) chart.

## Features
- Randomized text samples with three length options: short, medium, and long
- Timer modes: 15s, 30s, 60s, or unlimited
- Live feedback per character (correct/incorrect/current/upcoming)
- Auto-scroll to keep the active character in view
- Results screen showing WPM, accuracy, errors, time, and a WPM line chart
- Keyboard-first flow, with `Esc` to reset anytime

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Chart.js + react-chartjs-2

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

## How to Play
- Click the typing area to focus (it auto-focuses when the page loads).
- Start typing to begin the game.
- Use the toolbar to switch between text length or timer mode.
- Press `Esc` to reset the current game.
- The results screen will appear when time runs out or when the text is completed.

## Customizing Texts
You can customize the text samples used in the game by editing the `src/data/texts.json` file. Each text entry contains a title and three variants: short, medium, and long. You can add new texts or modify existing ones here.

## Project Structure
- `src/components`: Contains all the UI components like typing area, toolbar, results, and chart.
- `src/tools`: Contains game logic and helper functions to manage text, timer, and results.
- `src/data`: Holds text content and the initial game data like timer modes and text lengths.

## Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the project for production.
- `npm run lint`: Runs ESLint for code linting.
- `npm run preview`: Previews the production build locally.