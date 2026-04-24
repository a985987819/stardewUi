import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5a8c4a',
          dark: '#4a7a3a',
          light: '#6a9c5a',
          bg: 'rgba(90, 140, 74, 0.15)',
        },
        secondary: {
          DEFAULT: '#8b6914',
          dark: '#7a5a10',
          light: '#9c7a1a',
        },
        accent: '#c45c3e',
        success: '#5a8c4a',
        warning: '#d4a520',
        danger: '#c45c3e',
        info: '#5a8cb4',
        stardew: {
          bg: 'var(--color-bg)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-card': 'var(--color-bg-card)',
          border: 'var(--color-border)',
          'border-dark': 'var(--color-border-dark)',
          'border-light': 'var(--color-border-light)',
          text: 'var(--color-text)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-light': 'var(--color-text-light)',
        },
      },
      fontFamily: {
        pixel: ['Stardew', 'monospace'],
        sans: ['Stardew', 'sans-serif'],
        mono: ['Stardew', 'monospace'],
      },
      boxShadow: {
        'pixel': '4px 4px 0px rgba(0, 0, 0, 0.15)',
        'pixel-sm': '2px 2px 0px rgba(0, 0, 0, 0.1)',
        'pixel-lg': '6px 6px 0px rgba(0, 0, 0, 0.2)',
        'pixel-inset': 'inset 2px 2px 0px rgba(255, 255, 255, 0.3), inset -2px -2px 0px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'pixel': '4px',
        'pixel-lg': '8px',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
    },
  },
} satisfies Config
