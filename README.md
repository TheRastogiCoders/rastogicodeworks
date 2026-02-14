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
- **Client:** Vite proxies `/api` to `http://localhost:5000` by default.

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

## Production

1. Build the client:

   ```bash
   npm run build
   ```

2. Serve the built files from `client/dist` (e.g. with Express static middleware or Nginx) and run the API on the same or another host.
3. Set `CLIENT_URL` in the server to your frontend origin for CORS.

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
