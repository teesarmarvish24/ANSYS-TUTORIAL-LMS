import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a1220',
          900: '#0f1b2e',
          800: '#152540',
          700: '#1e3a5f',
          600: '#28527d',
        },
      },
    },
  },
  plugins: [],
};
export default config;
