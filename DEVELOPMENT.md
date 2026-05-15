# React News App - Development Journey

## Project Overview
Built a React news app with live articles from GNews API, featuring a hero banner, search/filter, and category selection. Deployed to Render as a full-stack application.

---

## Problems Encountered & Solutions

### Problem 1: NewsAPI Free Plan Blocked on Production
**Issue:** Initial integration used NewsAPI, which works perfectly on `localhost` but blocks all requests from production domains (Render).

**Error Message:** "Unable to load news articles right now"

**Root Cause:** NewsAPI free tier only allows requests from localhost for security/licensing reasons.

**Solution:** 
- Switched to GNews API, which allows production requests on the free tier
- Updated environment variable from `VITE_NEWS_API_KEY` to `GNEWS_API_KEY`
- Updated category list to match GNews valid topics: `breaking-news`, `world`, `nation`, `business`, `entertainment`, `health`, `science`, `sports`, `technology`
- Changed default category from `general` (invalid) to `breaking-news`

**Files Changed:**
- `src/App.jsx` - Updated API endpoint, category list, and error handling
- `.env` and `.env.example` - New API key variable names

---

### Problem 2: Network Error - Browser CORS/Network Block
**Issue:** After deploying to Render, the frontend made direct HTTP requests to `https://gnews.io/api/v4/...` from the browser, which triggered a network error.

**Error Message:** `(Network Error)`

**Root Cause:** Modern browsers block cross-origin requests from the frontend to external APIs that don't have proper CORS headers configured. GNews doesn't allow browser-direct requests.

**Solution:**
- Built an Express.js backend server that runs alongside the React app
- Frontend now calls same-origin route: `/api/news?category=...`
- Backend server fetches from GNews on the server side (no CORS restriction)
- Added Vite dev proxy so local development routes `/api/*` to the backend server

**Files Changed/Created:**
- `server.js` - New Express backend with `/api/news` route
- `src/App.jsx` - Changed from direct API call to `/api/news` endpoint
- `vite.config.js` - Added dev proxy configuration
- `package.json` - Added `express`, `dotenv` dependencies and `start`, `dev:server`, `dev:full` scripts

---

### Problem 3: Render 404 Error
**Issue:** App deployed but showed `(Request failed with status code 404)` error.

**Error Message:** Unable to load news articles (404)

**Root Cause:** Render was treating the service as a Static Site, which only serves pre-built files and doesn't run the Express backend. The `/api/news` route didn't exist.

**Solution:**
- Created a new **Web Service** on Render (not Static Site)
- Set correct build and start commands:
  - Build: `npm run build`
  - Start: `npm start`
- Added `render.yaml` blueprint to ensure future deployments use Web Service type
- Added environment variable `GNEWS_API_KEY` to Render dashboard

**Files Created:**
- `render.yaml` - Render service configuration

---

### Problem 4: Render Build Failed (Exit Code 127)
**Issue:** Render build failed with "Exited with status 127 while building your code"

**Root Cause:** Render build environment was missing or not installing `vite` during the build step. Exit code 127 indicates "command not found" - the `vite` command wasn't available.

**Solution:**
- Moved `vite` and `@vitejs/plugin-react` from `devDependencies` to regular `dependencies`
  - This ensures they install in all environments, including Render's build container
- Made build command explicit: `npm install && npm run build` (instead of just `npm run build`)
- Pinned Node version to `20.19.0` in `render.yaml` and added engine requirement in `package.json`

**Files Changed:**
- `package.json` - Moved Vite to dependencies, added `engines` field, updated build command
- `render.yaml` - Added explicit Node version and updated build command

---

### Problem 5: Render Server Startup Failed (Exit Code 1)
**Issue:** Build succeeded but server failed to start with exit code 1.

**Error Found (locally):**
```
PathError [TypeError]: Missing parameter name at index 1: *
```

**Root Cause:** Express route pattern `app.get('*', ...)` with a string literal `'*'` is not valid syntax in Express v5.x. The `path-to-regexp` library that Express uses for route matching doesn't accept `'*'` as a literal string.

**Solution:**
- Changed route from `app.get('*', ...)` to `app.get(/.*/, ...)` using regex pattern
- Added error handlers for file serving failures
- Added server error listeners and process rejection handlers for better diagnostics

**Files Changed:**
- `server.js` - Fixed catch-all route syntax and added error handling

---

## Final Implementation

### Architecture
```
Frontend (React)
    ↓
    ├─ Local Dev: Vite proxy routes /api/* to localhost:10000
    └─ Production: Express serves both frontend (dist/) and backend API
              ↓
        Express Backend (server.js)
              ↓
        GNews API (https://gnews.io/api/v4/)
```

### Tech Stack
- **Frontend:** React 19, Vite 8, Material-UI 9, Axios
- **Backend:** Express.js
- **Deployment:** Render (Web Service)
- **External API:** GNews (free tier)

### Key Files
- `src/App.jsx` - React component with state management, filtering, search
- `server.js` - Express backend with GNews proxy and static file serving
- `vite.config.js` - Vite config with dev proxy
- `render.yaml` - Render deployment blueprint
- `package.json` - Dependencies and scripts

---

## Lessons Learned

1. **API Restrictions:** Always check if a free-tier API has production restrictions. NewsAPI blocks non-localhost; GNews doesn't.

2. **CORS & Proxying:** When frontend APIs fail with network errors in production, proxy through your own backend.

3. **Render Deployment:** 
   - Use **Web Service** for Node.js apps, not Static Site
   - Move dev dependencies that are needed for build (like Vite) to regular dependencies
   - Pin Node version explicitly
   - Make build/start commands explicit

4. **Route Patterns:** Express doesn't accept `'*'` as a route string; use regex `/.*/` instead.

5. **Error Messages:** Render errors like exit code 127 or 1 are cryptic without logs. Local testing before deploying saves debugging time.

---

## Deployment Checklist
- [x] Frontend build succeeds locally
- [x] Backend server starts locally
- [x] Backend API endpoint works (`npm start` then test `/api/news`)
- [x] All code lints cleanly
- [x] Pushed to GitHub main branch
- [x] Render Web Service created (not Static Site)
- [x] Build command: `npm install && npm run build`
- [x] Start command: `npm start`
- [x] Environment variable set: `GNEWS_API_KEY`
- [x] Deployment successful and app loads

---

## How to Run Locally

```bash
# Install dependencies
npm install

# Option 1: Run frontend only (requires backend already running)
npm run dev

# Option 2: Run backend only
npm run dev:server

# Option 3: Run both together (recommended)
npm run dev:full

# Option 4: Production build and start
npm run build
npm start
```

---

## How to Deploy Updates

1. Make code changes locally
2. Test: `npm run lint && npm run build && npm start`
3. Push to GitHub: `git push origin main`
4. Render auto-deploys from GitHub webhook (or manually redeploy in dashboard)

---

**Project Status:** ✅ Complete and deployed to production
