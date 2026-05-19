# Snap Kampala

Pre-loved furniture marketplace for Kampala, Uganda.

## Stack

- React 18 + TypeScript
- Vite 5
- No backend — all data is static (ready to swap for an API)

## Local Development

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deploy to Vercel via GitHub

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Set **Root Directory** to `client`
5. Vercel auto-detects Vite — click **Deploy**

That's it. The `vercel.json` inside `client/` handles build config and SPA routing automatically.

## Project Structure

```
client/
├── src/
│   ├── App.tsx        # Main UI
│   ├── imgs.ts        # Embedded product images (base64)
│   ├── main.tsx       # Entry point
│   └── index.css      # Global reset
├── vercel.json        # Vercel config
├── vite.config.ts
├── tsconfig.json
└── package.json
```
