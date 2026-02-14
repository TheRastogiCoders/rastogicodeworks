# Rastogi Codeworks – Backend API

Node.js backend for login, dashboard, and invoices using MongoDB. The developer provides client credentials; there is no public sign-up.

---

## MongoDB setup

### Option A: Local MongoDB

1. **Install MongoDB**  
   - Windows: [MongoDB Community Server](https://www.mongodb.com/try/download/community)  
   - Mac: `brew install mongodb-community`  
   - Or use [MongoDB Docker](https://hub.docker.com/_/mongo):  
     `docker run -d -p 27017:27017 --name mongo mongo`

2. **Start MongoDB** (if not running as a service)  
   - Windows: run `mongod` or start the MongoDB service  
   - Mac: `brew services start mongodb-community`

3. **Connection string**  
   Use in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/rastogi-coders
   ```
   The database `rastogi-coders` is created automatically when the app first connects.

### Option B: MongoDB Atlas (cloud)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a cluster (e.g. M0 free tier).
3. In **Database Access**, add a database user (username + password). Note the password.
4. In **Network Access**, add your IP (or `0.0.0.0/0` for “allow from anywhere” – only for dev).
5. In **Database** → **Connect** → **Connect your application**, copy the connection string. It looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/DATABASE?retryWrites=true&w=majority
   ```
6. Replace `USERNAME`, `PASSWORD`, and optionally `DATABASE` (e.g. `rastogi-coders`). Put it in `.env`:
   ```env
   MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/rastogi-coders?retryWrites=true&w=majority
   ```

---

## Backend setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment**  
   Copy `.env.example` to `.env` and set:
   - `MONGODB_URI` – See above (local or Atlas).
   - `JWT_SECRET` – Any long random string (e.g. `openssl rand -hex 32`).
   - `ADMIN_EMAIL` – Your admin login email.
   - `ADMIN_PASSWORD` – Your admin login password.
   - `CLIENT_URL` – Frontend URL for CORS, e.g. `http://localhost:5173` in dev.

3. **Run**
   ```bash
   npm run dev   # development
   npm start     # production
   ```
   On first start, an **admin user** is created in MongoDB from `ADMIN_EMAIL` and `ADMIN_PASSWORD` if it does not exist.

---

## Adding client users

Clients do not sign up themselves. You create their accounts and share credentials with them.

**From the server folder**, run:

```bash
node scripts/createClient.js <email> <password> [name]
```

Examples:

```bash
node scripts/createClient.js client@company.com SecurePass123 "Company Name"
node scripts/createClient.js john@example.com AnotherPass456
```

- The client logs in at `/login` with that **email** and **password**.
- Use the same **email** as `clientEmail` when creating invoices in the admin panel so the client sees those invoices on their dashboard.

---

## API (summary)

- **Auth:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Dashboard:** `GET /api/dashboard/client` (client), `GET /api/dashboard/admin` (admin)
- **Invoices (admin):** `GET/POST/PATCH/DELETE /api/invoices` – use `clientEmail` when creating to link to a client

---

## Frontend (no proxy)

The client calls the backend by full URL. Default in code is `http://localhost:5000`.

- **Same machine:** Backend on port 5000, frontend on 5173 → set `CLIENT_URL=http://localhost:5173` in server `.env` so CORS allows the frontend.
- **Production:** Set `VITE_API_URL` or `VITE_SERVER_URL` in the frontend to your API base (e.g. `https://api.yoursite.com`).
