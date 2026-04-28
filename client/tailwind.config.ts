import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Noto Serif KR"', 'serif'],
        sans: ['"Inter"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111111',
        paper: '#fafaf7',
        muted: '#6b6b6b',
        line: '#e5e5e0',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
