import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        saffron: {
          50: '#FFF8ED',
          100: '#FDF0D5',
          200: '#FBD89A',
          300: '#F9C05F',
          400: '#F7A835',
          500: '#F7971E',
          600: '#E8850B',
          700: '#C06A08',
          800: '#985310',
          900: '#7A4512',
        },
        cosmic: {
          50: '#FDF7E6',
          100: '#FAE9B8',
          200: '#F5D06B',
          300: '#D4A24A',
          400: '#B37E30',
          500: '#745802',
          600: '#5A4401',
          700: '#413201',
          800: '#2A2100',
          900: '#1A1500',
        },
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        garamond: ['var(--font-eb-garamond)', 'EB Garamond', 'serif'],
      },
      keyframes: {
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'mandala-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(247,151,30,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(247,151,30,0.6)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'burst-heart': {
          '0%': { opacity: '1', transform: 'translate3d(calc(-50% + var(--burst-x)), 0, 0) scale(0.5)' },
          '20%': { transform: 'translate3d(calc(-50% + var(--burst-x) + var(--burst-drift)), -20vh, 0) scale(1) rotate(var(--burst-rot))' },
          '80%': { opacity: '0.8', transform: 'translate3d(calc(-50% + var(--burst-x) - var(--burst-drift)), -60vh, 0) scale(1) rotate(calc(var(--burst-rot) * -1))' },
          '100%': { opacity: '0', transform: 'translate3d(calc(-50% + var(--burst-x) + var(--burst-drift)), -80vh, 0) scale(1) rotate(var(--burst-rot))' },
        },
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'twinkle-slow': 'twinkle 5s ease-in-out infinite',
        'float-y': 'float-y 3s ease-in-out infinite',
        'mandala-spin': 'mandala-spin 30s linear infinite',
        'mandala-spin-reverse': 'mandala-spin 25s linear infinite reverse',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-down': 'slide-down 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'count-up': 'count-up 0.8s ease-out forwards',
        'burst-heart': 'burst-heart forwards cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      screens: {
        'xs': '375px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
} satisfies Config;
