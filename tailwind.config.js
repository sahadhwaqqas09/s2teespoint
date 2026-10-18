/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFD700',
          600: '#FFB800',
          700: '#d97706',
          800: '#92400e',
          900: '#78350f',
        },
        dark: {
          50:  '#f8f8f8',
          100: '#e0e0e0',
          200: '#c0c0c0',
          300: '#888888',
          400: '#555555',
          500: '#333333',
          600: '#222222',
          700: '#1A1A1A',
          800: '#111111',
          900: '#0a0a0a',
        },
      },
      fontFamily: {
        arabic: ['"Amiri"', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
