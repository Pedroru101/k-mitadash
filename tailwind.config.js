/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./*.js",
    "./shopify-analytics-dashboard.html",
    "./shopify-analytics-script.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'k-mita': {
          50: '#FC4569', // Rosa acento principal
          100: '#FFFFFF', // Blanco puro
          200: '#8A6A56', // Beige claro
          300: '#756558', // Marrón claro
          400: '#635549', // Marrón medio
          500: '#49362B', // Marrón base
          600: '#362418', // Marrón oscuro
          700: '#110E0B', // Marrón muy oscuro (fondo dark)
        },
        // Variables CSS para temas (integradas como colores)
        primary: {
          bg: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-tertiary': 'var(--text-tertiary)',
          border: 'var(--border-color)',
          shadow: 'var(--shadow-color)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'apple-lg': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        'apple-xl': '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-kmita': 'linear-gradient(135deg, var(--k-mita-100) 0%, var(--k-mita-200) 100%)',
        'gradient-dark': 'linear-gradient(135deg, var(--k-mita-700) 0%, var(--k-mita-600) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--k-mita-50) 0%, var(--k-mita-200) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px var(--k-mita-50)' },
          '50%': { boxShadow: '0 0 20px var(--k-mita-50), 0 0 40px var(--k-mita-50)' },
        },
      },
      transitionProperty: {
        'transform-shadow': 'transform, box-shadow 0.3s ease',
      },
    },
  },
  plugins: [],
}