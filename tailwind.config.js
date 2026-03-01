/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
      },
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--league-primary) / <alpha-value>)',
          light: 'rgb(var(--league-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--league-primary-dark) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--league-accent) / <alpha-value>)',
          soft: 'rgb(var(--league-accent-soft) / <alpha-value>)',
          muted: '#C9A23A',
          cyan: '#67E8F9',
          emerald: '#6EE7B7',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFBFC',
          muted: '#F5F7F9',
        },
        dark: {
          bg: '#090f1a',
          surface: '#0a162a',
          'surface-alt': '#081428',
          'surface-soft': '#111827',
          overlay: '#050a13',
          border: '#1e293b',
          'border-soft': '#334155',
        },
      },
    },
  },
  plugins: [],
};
