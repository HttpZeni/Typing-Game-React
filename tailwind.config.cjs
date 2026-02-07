/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors - Dunkle, erdige Töne
        'game-bg': 'var(--game-bg)',           // Dunkles Braun-Grau (wie warme Erde)
        'game-bg-dark': 'var(--game-bg-dark)',      // Noch dunkler, fast schwarz
        'game-bg-light': 'var(--game-bg-light)',     // Etwas heller
        
        // Text colors - Warme, gedämpfte Töne
        'text-primary': 'var(--text-primary)',      // Warmes Beige (wie Pergament)
        'text-secondary': 'var(--text-secondary)',    // Gedämpftes Beige-Grau
        'text-correct': 'var(--text-correct)',      // Moosgrün
        'text-incorrect': 'var(--text-incorrect)',    // Warmes Terrakotta
        'text-current': 'var(--text-current)',      // Salbeigrün-Grau
        'text-upcoming': 'var(--text-upcoming)',     // Dunkles Grau-Braun
        
        // Accent colors - Erdige Kontrastfarben
        'accent-primary': 'var(--accent-primary)',    // Warmes Ocker/Gold
        'accent-secondary': 'var(--accent-secondary)',  // Gebranntes Siena
        'accent-success': 'var(--accent-success)',    // Olivgrün
        'accent-error': 'var(--accent-error)',      // Terrakotta
        'accent-warning': 'var(--accent-warning)',    // Sand/Bronze
        
        // UI elements - Dunkle, warme Töne
        'card-bg': 'var(--card-bg)',           // Dunkles Braun-Grau
        'card-border': 'var(--card-border)',       // Warmer dunkler Rahmen
        'input-bg': 'var(--input-bg)',          // Wie Hintergrund
        'input-border': 'var(--input-border)',      // Gedämpfter Rahmen
        'input-focus': 'var(--input-focus)',       // Goldener Akzent bei Fokus
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'typing': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.025em' }],
        'typing-lg': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        'typing-xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0.025em' }],
        'typing-xxl': ['2.5rem', { lineHeight: '3rem', letterSpacing: '0.025em' }],
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'fade-out': 'fadeOut 0.2s ease-in forwards',
        'slide-left': 'slideLeft 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'blur-down': 'blurDown 1s ease-in forwards',
        'pulse-success': 'pulseSuccess 0.6s ease-in-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97)',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(0px)', opacity: '0' },
          '100%': { transform: 'translateX(-40px)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        blurDown: {
          '0%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' },
          '100%': { opacity: '0', transform: 'translateY(500px)', filter: 'blur(8px)' },
        },
        pulseSuccess: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-2px)' },
          '20%, 80%': { transform: 'translateX(4px)' },
          '30%, 50%, 70%': { transform: 'translateX(-6px)' },
          '40%, 60%': { transform: 'translateX(6px)' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 15px rgba(200, 155, 94, 0.25)',   // Warmer Gold-Glow
        'glow-green': '0 0 15px rgba(125, 145, 109, 0.25)',   // Olivgrün-Glow
        'glow-red': '0 0 15px rgba(166, 112, 96, 0.25)',      // Terrakotta-Glow
        'glow-yellow': '0 0 15px rgba(184, 147, 95, 0.25)',   // Bronze-Glow
        'glow-cyan': '0 0 15px rgba(159, 168, 160, 0.25)',    // Salbei-Glow
        'card': '0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-motion")],
}
