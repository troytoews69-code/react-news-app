# React News App

News app built with React, Vite, Material UI, and a small Express proxy API.

## Features

- Featured headline hero banner
- Search by title and description
- Category filtering
- Loading and error states
- Server-side proxy to GNews API (avoids browser CORS issues)

## Environment Variables

Create a `.env` file in the project root:

```env
GNEWS_API_KEY=your_gnews_api_key_here
```

## Run Locally

Install dependencies:

```bash
npm install
```

Run frontend + backend together:

```bash
npm run dev:full
```

Or run separately:

```bash
npm run dev:server
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Deploy to Render

Use a Web Service with:

- Build Command: `npm run build`
- Start Command: `npm start`
- Environment Variable: `GNEWS_API_KEY`
