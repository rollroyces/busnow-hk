/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blind: '#1c1412',
        card: '#241a17',
        line: '#3a2b25',
        paper: '#f3eadb',
        cream: '#fff6e1',
        muted: '#a8968a',
        led: '#ff7a1a',
        'led-ink': '#1c1412',
        ok: '#5ec27a',
        warn: '#ffb547',
        bad: '#ff5d5d'
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'PingFang HK', 'Microsoft JhengHei', 'sans-serif']
      }
    }
  }
};
