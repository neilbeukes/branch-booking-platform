# Capitec Branch Booking System

A simple appointment booking system: customers choose a branch, date and time, enter their details, and receive a simulated confirmation and can add it to calendar. Booking will be stored in the DB.

## Some assumptions:

- User is always anonymous (No authentication layer for now). Booking management is protected by reference number and email. Common flow for booking platfroms.
- `/bookings` page shows all bookings make . (This is just for veryfying booking for this demonstration)
- No SMS/Email is sent. But reference number is generated and saved, can add to calendar.
- Various libraries are added to make develoment faster and more reliable. Some include Framermotion, datefns, prisma, tanstack, react-icons etc.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, TanStack Query
- **Backend:** Node.js, Express, Prisma
- **Database:** PostgreSQL

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for running with Docker)
- PostgreSQL 14+ (for local run without Docker)

## Run with Docker

```bash
docker compose up --build
```

- App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3000/api/health](http://localhost:3000/api/health)

`Note: On first run the database will be seeded with test data found in` backend\prisma\seed.ts`.`

## Run locally

### 1. Database

Start PostgreSQL and create a database, or use Docker for the DB only:

```bash
docker compose up -d db
```

Set `DATABASE_URL` in `.env` (copy from `.env.example`).

### 2. Backend

```bash
cd backend
cp ../.env.example .env
# Edit .env with your DATABASE_URL
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

Backend runs at [http://localhost:3001](http://localhost:3001).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at [http://localhost:5173](http://localhost:5173) and proxies `/api` to the backend.

## Running tests

Backend unit tests (Vitest):

```bash
cd backend
npm test
```

Watch mode (re-run on file changes):

```bash
cd backend
npm run test:watch
```

## Build for production

```bash
cd frontend && npm run build
cd ../backend && npm start
```

Or use the Docker build: the image builds the frontend and serves it from Express.

## Project structure

```
├── backend/          Express API, Prisma, routes
├── frontend/         React app, Tailwind, TanStack Query
├── docker-compose.yml
├── Dockerfile        Builds frontend + runs backend
└── README.md
```

