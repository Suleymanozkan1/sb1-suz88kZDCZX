import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6F0',
        sand: '#F5EDD8',
        linen: '#F0E8D8',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8D5A3',
          dark: '#9A7B2F',
          deep: '#6B4F1A',
        },
        ink: {
          DEFAULT: '#1a0f08',
          soft: '#2d1f12',
          mid: '#1a110a',
          deep: '#0d0805',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Jost', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.3em',
        title: '0.6em',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
