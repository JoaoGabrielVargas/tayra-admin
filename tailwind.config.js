/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === MATA ATLÂNTICA DESIGN SYSTEM ===
        // Fundos orgânicos
        linho: {
          DEFAULT: '#F7F5F0',
          50: '#FDFCFA',
          100: '#F7F5F0',
          200: '#EDE9E0',
          300: '#E0DAD0',
        },
        // Verde — A Mata
        mata: {
          950: '#0D1E16',
          900: '#1C3028',
          800: '#243D33',
          700: '#2D5240',
          600: '#3A6B52',
          500: '#4A7C5F',
          400: '#5E9474',
          300: '#7FAF8D',
          200: '#A8C9B5',
          100: '#D1E5DA',
          50: '#EAF3EE',
        },
        // Terroso — A Terra
        barro: {
          900: '#5C2E18',
          800: '#7A3E22',
          700: '#954D2C',
          600: '#B05E38',
          500: '#C87D55',  // principal alerta/ação
          400: '#D99472',
          300: '#E8B396',
          200: '#F2CEBC',
          100: '#FAE9DF',
        },
        // Dourado — O Sol Filtrado
        ambar: {
          900: '#7A4F00',
          800: '#9C6600',
          700: '#BE7E00',
          600: '#D4960A',
          500: '#E8A93A',  // KPIs positivos
          400: '#F0BE5E',
          300: '#F5CF85',
          200: '#FAE0AE',
          100: '#FDF0D6',
        },
        // Cedro — Neutro quente
        cedro: {
          900: '#2C2420',
          800: '#3D3028',
          700: '#524030',
          600: '#6B5240',
          500: '#8A6B56',
          400: '#A88C78',
          300: '#C4AFA0',
          200: '#DDD0C8',
          100: '#F0EAE5',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', fontWeight: '600' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', fontWeight: '600' }],
        'display-md': ['2rem', { lineHeight: '1.2', fontWeight: '500' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],
      },
      boxShadow: {
        'organic-sm': '0 2px 8px rgba(28, 48, 40, 0.06)',
        'organic': '0 4px 16px rgba(28, 48, 40, 0.08)',
        'organic-md': '0 8px 24px rgba(28, 48, 40, 0.10)',
        'organic-lg': '0 16px 48px rgba(28, 48, 40, 0.12)',
        'organic-xl': '0 24px 64px rgba(28, 48, 40, 0.14)',
        'glow-mata': '0 0 24px rgba(74, 124, 95, 0.25)',
        'glow-barro': '0 0 24px rgba(200, 125, 85, 0.25)',
        'glow-ambar': '0 0 24px rgba(232, 169, 58, 0.25)',
      },
      borderRadius: {
        'organic': '12px',
        'organic-lg': '16px',
        'organic-xl': '24px',
        'organic-full': '999px',
      },
      backgroundImage: {
        'gradient-mata': 'linear-gradient(135deg, #1C3028 0%, #2D5240 100%)',
        'gradient-linho': 'linear-gradient(135deg, #F7F5F0 0%, #EDE9E0 100%)',
        'gradient-barro': 'linear-gradient(135deg, #C87D55 0%, #A05C3B 100%)',
        'gradient-ambar': 'linear-gradient(135deg, #E8A93A 0%, #D4960A 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}
