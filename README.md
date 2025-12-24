# SVG Assessment (Full Stack)

A full-stack project with a **Node.js/Express + PostgreSQL** backend and a **React + Vite + TypeScript** frontend.

## Project Structure

```
backend/   # Express API, Sequelize + PostgreSQL
frontend/  # React + Vite + TypeScript UI
```

## Prerequisites

- Node.js (recommended LTS)
- npm
- PostgreSQL

## Backend Setup (API)

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables (recommended via `.env`):

   ```env
   # Optional (defaults shown)
   DATABASE=postgres
   DATABASE_USER=postgres
   DATABASE_PASS=
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   PORT=3000
   ```

3. Start the API server:

   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000` by default.

### Backend Routes

The API registers these route groups:

- `POST /auth/*`
- `/users/*`
- `/permissions/*`
- `/clients/*`
- `/products/*`
- `/orders/*`
- `/comments/*`

## Frontend Setup (Web)

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

   Vite will output the local URL (typically `http://localhost:5173`).

## Common Tasks

### Build frontend for production

```bash
cd frontend
npm run build
```

## Notes

- The backend uses Sequelize and syncs models at startup.
- CORS is enabled for all origins in development.
