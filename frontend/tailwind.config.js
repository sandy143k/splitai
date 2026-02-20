/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#7b2fff',
        'brand-blue':   '#0a6fff',
        'brand-neon-p': '#c040ff',
        'brand-neon-b': '#00cfff',
        'brand-dark':   '#04030c',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':   'linear-gradient(135deg, #7b2fff 0%, #0a6fff 100%)',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':         'float 6s ease-in-out infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'progress-glow': 'progressGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 20px rgba(123,47,255,0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(10,111,255,0.6)' },
        },
        progressGlow: {
          '0%, 100%': { opacity: 0.7 },
          '50%':      { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
