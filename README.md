# DeepL Translator GUI

A minimal DeepL web interface built with **Vite + Vanilla TypeScript** and a small **Express backend**.

## Features
- Auto language detection
- Dynamic language list
- Swap languages
- Character counter
- Usage / limit info
- Light / Dark mode
- LocalStorage persistence
- Frontend-only demo mode

## Demo
The public demo is frontend-only and does not perform real translations.

## Local setup
```bash
npm install
cp server/.env.example server/.env
npm run dev
```

## Architecture

- Browser
- Vite
- Express
- DeepL API

## License

MIT