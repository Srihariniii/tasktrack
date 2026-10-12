# TaskTrack — MERN CRUD starter

A small task manager built with React + Vite, Express + Node.js, MongoDB Atlas, and Mongoose.

## Features
- List tasks from MongoDB
- Add a task
- Mark a task complete/incomplete
- Delete a task
- Loading and error states
- Environment variables for local and deployed configuration

## 1. Requirements
Install Node.js (LTS) and Git. Create a free MongoDB Atlas database at https://www.mongodb.com/atlas/database.

## 2. Configure MongoDB
In Atlas:
1. Create a cluster.
2. Create a database user and password.
3. In Network Access, allow your current IP for local development. For a beginner demo, you may temporarily allow `0.0.0.0/0`, but use a strong password and restrict access again when possible.
4. Select Connect > Drivers and copy the connection string.

Replace `<password>` with the database user's password and set the database name to `tasktrack`, for example:
`mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/tasktrack?retryWrites=true&w=majority`

If your password contains special characters, URL-encode them.

## 3. Run locally (Windows PowerShell)
Open PowerShell in this folder.

Terminal 1 — backend:
```powershell
cd server
Copy-Item .env.example .env
# Edit server/.env and paste your MongoDB connection string into MONGODB_URI
npm install
npm run dev
```
The API runs at http://localhost:5000. Visit http://localhost:5000/api/health to check it.

Terminal 2 — frontend:
```powershell
cd client
Copy-Item .env.example .env
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually http://localhost:5173.

## 4. How the request travels
1. React renders the task UI.
2. When the page opens, `useEffect` calls `loadTasks()`.
3. `fetch()` sends `GET /api/tasks` to Express.
4. Express route calls Mongoose.
5. Mongoose reads MongoDB and returns JSON.
6. React stores the result in state and re-renders.
7. Add/update/delete follow the same path using POST/PATCH/DELETE.

## 5. Deploy
### Backend — Render
1. Push the project to GitHub.
2. On Render choose New > Web Service and connect the repository.
3. Set **Root Directory** to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI` = your Atlas connection string
   - `CLIENT_URL` = your Netlify website URL, e.g. `https://your-site-name.netlify.app`
   - `NODE_ENV` = `production`
7. Deploy and copy the service URL, e.g. `https://tasktrack-api.onrender.com`.
8. Test `https://YOUR-BACKEND-URL/api/health`.

### Frontend — Netlify
1. In Netlify, Add new site > Import an existing project and select your GitHub repository.
2. Set **Base directory** to `client`.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = your backend URL plus `/api`, e.g. `https://tasktrack-api.onrender.com/api`
6. Trigger a new deploy.

If you change environment variables, rebuild/redeploy the frontend. The `VITE_` prefix means the value is included in browser code; only use it for public configuration, never secrets.

## Important deployment note
Netlify hosts the React frontend. This starter runs the traditional Express backend as a separate Render web service and stores data in MongoDB Atlas. Render's free services may sleep when idle, so the first request after inactivity can be slow.

## API routes
- `GET /api/health` — server health
- `GET /api/tasks` — list tasks
- `POST /api/tasks` — create a task (`{ "title": "...", "description": "..." }`)
- `PATCH /api/tasks/:id` — update completion (`{ "completed": true }`)
- `DELETE /api/tasks/:id` — delete a task

## Security notes
- Never commit `.env` files.
- Never put MongoDB credentials in React/Vite environment variables.
- This demo has no login or user ownership; do not store private user data in it as-is.
