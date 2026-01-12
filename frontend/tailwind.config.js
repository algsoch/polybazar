/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#0B6DF4',
          50: '#E8F2FE',
          100: '#C5DFFD',
          200: '#9ECBFB',
          300: '#77B6F9',
          400: '#50A1F7',
          500: '#0B6DF4',
          600: '#0959C8',
          700: '#07459C',
          800: '#053170',
          900: '#031D44',
        },
        // Accent color (sustainability/eco)
        accent: {
          DEFAULT: '#00BFA6',
          50: '#E0FBF7',
          100: '#B3F5EB',
          200: '#80EEDE',
          300: '#4DE7D1',
          400: '#26E0C6',
          500: '#00BFA6',
          600: '#009982',
          700: '#00735F',
          800: '#004D3D',
          900: '#00261A',
        },
        // Neutral backgrounds
        neutral: {
          bg: '#F4F6F8',
          card: '#FFFFFF',
          text: '#374151',
          muted: '#6B7280',
          border: '#E5E7EB',
        },
        // Semantic colors
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'tiny': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'badge': '6px',
      },
      boxShadow: {
        'card': '0 8px 24px rgba(2, 6, 23, 0.06)',
        'card-hover': '0 12px 32px rgba(2, 6, 23, 0.1)',
        'dropdown': '0 10px 40px rgba(2, 6, 23, 0.12)',
        'button': '0 4px 14px rgba(11, 109, 244, 0.25)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
