// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'norvine-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.95)' },
        },
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'draw-check': {
          '0%': { strokeDasharray: '0, 100', opacity: '0' },
          '100%': { strokeDasharray: '100, 0', opacity: '1' },
        }
      },
      animation: {
        'norvine-pulse': 'norvine-pulse 2s ease-in-out infinite',
        'loading-bar': 'loading-bar 1.5s infinite linear',
        'slide-up': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'draw-check': 'draw-check 1s ease-out forwards',
      },
    },
  },
}