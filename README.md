# Rastogi Coders – Company Website

Professional website for **Rastogi Coders** built with **React** (Tailwind CSS) and **Node.js** backend.

## Stack

- **Frontend:** React 18, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express, CORS

## Setup

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Environment (optional)

- **Server:** Copy `server/.env.example` to `server/.env` and set `PORT` and `CLIENT_URL` if needed.
- **Client:** For local dev the app uses `http://localhost:5000` as the API URL. For production, set `VITE_API_URL` (see [Deployment](#deployment)).

### 3. Run development

**Terminal 1 – Backend:**

```bash
npm run server
```

Server runs at **http://localhost:5000**.

**Terminal 2 – Frontend:**

```bash
npm run client
```

Client runs at **http://localhost:5173**.

Open **http://localhost:5173** in the browser to view the site.

## Deployment (Vercel + Render)

**Client (Vercel)** and **Server (Render)** are set up for production.

### Deploy backend (Render)

1. Create a **Web Service** on [Render](https://render.com). Connect your repo.
2. **Root directory:** leave default (repo root).  
   **Build command:** `cd server && npm install`  
   **Start command:** `npm start` (uses root script: `cd server && npm start`).
4. Set **Environment Variables** in the Render dashboard:

   | Variable       | Value (example)                    |
   |----------------|------------------------------------|
   | `NODE_ENV`     | `production`                       |
   | `CLIENT_URL`   | `https://rastogicodeworks.vercel.app` (your Vercel URL, no trailing slash; **required** or CORS will block login) |
   | `MONGODB_URI`  | your MongoDB Atlas (or other) URI  |
   | `JWT_SECRET`   | long random string                 |
   | `ADMIN_EMAIL`  | (optional) admin login email      |
   | `ADMIN_PASSWORD` | (optional) admin password      |

5. Deploy. Note your Render URL (e.g. `https://your-api.onrender.com`).

### Deploy frontend (Vercel)

1. Create a project on [Vercel](https://vercel.com). Import your repo.
2. **Root directory:** `client`.
3. **Build command:** `npm run build` (default for Vite).
4. **Output directory:** `dist` (default for Vite).
5. **Required:** Set **Environment Variable** in Vercel (Project → Settings → Environment Variables):

   | Variable        | Value                          |
   |-----------------|--------------------------------|
   | `VITE_API_URL`  | `https://your-api.onrender.com` (your Render backend URL, no trailing slash) |

   If you skip this, login/contact/dashboard will show "Backend not configured" or "Network error" in production.

6. Deploy. Your app will call the Render API; cookies work cross-origin (sameSite: none, secure).

### Local development

- **Server:** Run `npm run server` from the project root first (backend on http://localhost:5000). Login and API calls will fail with "Can't reach the server" if the server is not running.
- **Client:** Run `npm run client` (frontend on http://localhost:5173). The app uses `http://localhost:5000` when `VITE_API_URL` is unset or empty.
- No CORS issues when both run on localhost.

## Production (generic)

1. Build the client: `npm run build` (from repo root or `client/`).
2. Serve `client/dist` with a static host or CDN.
3. Run the API (e.g. on Render) and set `CLIENT_URL` to your frontend origin for CORS.

## Project structure

```
Rastogi-Coders/
├── client/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Layout, Navbar, Footer
│   │   ├── pages/          # Home, About, Services, Contact
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                 # Express API
│   ├── routes/
│   │   └── contact.js      # POST /api/contact
│   ├── index.js
│   └── package.json
├── package.json
└── README.md
```

## API

- `GET /api/health` – Health check
- `POST /api/contact` – Contact form (body: `name`, `email`, `subject?`, `message`)

---

© Rastogi Coders
