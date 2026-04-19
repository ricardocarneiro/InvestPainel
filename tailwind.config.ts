import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002444',
          container: '#1B3A5C',
          fixed: '#2B486B',
        },
        secondary: {
          DEFAULT: '#755B00',
          container: '#C9A84C',
        },
        surface: {
          DEFAULT: '#F8F9FA',
          dim: '#D9DADB',
          'container-lowest': '#FFFFFF',
          'container-low': '#F3F4F5',
          'container': '#EDEEF0',
          'container-high': '#E7E8EA',
          'container-highest': '#E1E2E4',
        },
        on: {
          surface: '#191C1D',
          'surface-variant': '#43474E',
          primary: '#FFFFFF',
        },
        outline: {
          DEFAULT: '#73777F',
          variant: '#C3C7CF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline-lg': ['2rem', { lineHeight: '1.25' }],
        'headline-md': ['1.75rem', { lineHeight: '1.3' }],
        'headline-sm': ['1.5rem', { lineHeight: '1.35' }],
        'title-lg': ['1.375rem', { lineHeight: '1.4' }],
        'title-md': ['1.125rem', { lineHeight: '1.5' }],
        'title-sm': ['0.938rem', { lineHeight: '1.5' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        'body-sm': ['0.75rem', { lineHeight: '1.6' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        ambient: '0 8px 40px rgba(25, 28, 29, 0.05)',
        'ambient-lg': '0 16px 64px rgba(25, 28, 29, 0.06)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}

export default config
