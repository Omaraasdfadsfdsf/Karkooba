import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        card: 'var(--card)',
        brand: 'var(--yellow)',
        'brand-dark': 'var(--yellow-dark)',
        accent: 'var(--red)',
        go: 'var(--green)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
      boxShadow: {
        hard: '5px 5px 0 var(--ink)',
        'hard-sm': '2px 2px 0 var(--ink)',
        'hard-md': '3px 3px 0 var(--ink)',
        'hard-lg': '8px 8px 0 var(--ink)',
      },
    },
  },
  plugins: [],
};

export default config;
