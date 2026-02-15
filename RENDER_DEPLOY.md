# Deploy backend to Render (simple)

## 1. Push `render.yaml` to GitHub

Make sure your repo has the `render.yaml` file in the **root** of the repo (same folder as `package.json`). Push to your default branch (e.g. `main`).

---

## 2. Create the service on Render

1. Go to **[render.com](https://render.com)** and sign in (or create an account).
2. Click **New +** → **Blueprint**.
3. Connect your **GitHub** account if needed, then select the repo: **TheRastogiCoders/rastogicodeworks** (or your repo name).
4. Render will detect `render.yaml` and show the **rastogi-api** service. Click **Apply**.

---

## 3. Add environment variables

Render will prompt you for the variables marked **sync: false** (secrets). Fill these in:

| Variable | What to put |
|----------|-------------|
| **CLIENT_URL** | Your frontend URL, e.g. `https://your-app.vercel.app` (no trailing slash). For testing you can use `http://localhost:5173`. |
| **MONGODB_URI** | Your MongoDB connection string (e.g. from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)). |
| **JWT_SECRET** | A long random string (e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). |
| **ADMIN_EMAIL** | (Optional) Admin login email. |
| **ADMIN_PASSWORD** | (Optional) Admin password. |

Then click **Create resources** or **Apply**.

---

## 4. Deploy

Render will:

1. Clone your repo  
2. Run `npm install` inside the `server` folder  
3. Run `npm start` to start the API  

When the deploy finishes, your API will be at:

**`https://rastogi-api.onrender.com`**  
(or the URL Render shows in the dashboard)

---

## 5. Connect your frontend (Vercel)

In your **Vercel** project, add this environment variable:

- **Key:** `VITE_API_URL`  
- **Value:** `https://rastogi-api.onrender.com` (your Render URL, no trailing slash)

Redeploy the frontend so it uses the new API URL.

---

## Troubleshooting

- **Build fails** – Check the build logs. Ensure `rootDir: server` is set and that `server/package.json` exists.
- **App crashes / DB error** – Check that `MONGODB_URI` is set correctly and the database is reachable from the internet (e.g. Atlas IP allowlist: `0.0.0.0/0` for testing).
- **CORS errors** – Set `CLIENT_URL` to the exact frontend origin (e.g. `https://your-app.vercel.app` with no trailing slash).
- **Logs** – In Render, open your service → **Logs** to see `Server running at http://0.0.0.0:XXXX [production]`.
