# BusNow · HK Bus

Real-time Hong Kong bus arrivals for **KMB (九巴)**, **LWB (龍運)** and **Citybus (城巴)**.

Built with React + TypeScript + Vite + Tailwind. Live data from the Hong Kong Transport Department open data feeds.

## Features

- **Stop search** — find any bus stop by name or ID
- **Route search** — look up routes by number, browse origin/destination
- **Real-time arrivals** — ETA refreshes every minute, with "arriving" / "minutes" indicators
- **Favourites** — pin routes and stops for one-tap access
- **Recent searches** — quick re-open of the last 8 stops/routes
- **Three languages** — 繁體中文 / 简体中文 / English
- **PWA** — installable, works offline for cached data
- **Mobile-first** — designed for one-handed use, dark theme with LED-style accents

## Data sources

- KMB / LWB: `https://data.etabus.gov.hk`
- Citybus: `https://rt.data.gov.hk/v1/transport/citybus-nwfb/`

All data is fetched directly from the browser — no backend needed.

## Local development

```bash
npm install
npm run dev
```

## Build & deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

Then in GitHub repo settings → Pages → set source to the `gh-pages` branch.

## License

Code: MIT.
Data: provided by the Hong Kong Transport Department under open-data terms; attribution shown in-app.
