# Election Reporting System

A real-time election reporting system designed for Thai elections, featuring a high-performance public-facing website and a comprehensive CMS backend.

## Overview

This project is a monorepo managed by [Turbo](https://turbo.build/), consisting of:

-   **Web (`apps/web`)**: A Next.js 16 application for public visualization of election results. Built with React 19, TailwindCSS v4, and D3.js.
-   **API (`apps/api`)**: A NestJS application providing the backend logic, REST APIs, and WebSocket connections. Uses Prisma with PostgreSQL and Redis.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or higher)
-   [npm](https://www.npmjs.com/) (v10 or higher)
-   [Docker](https://www.docker.com/) & Docker Compose (for database and cache)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

Ensure you have `.env` files set up in `apps/web` and `apps/api` if required.
By default, the `docker-compose.yml` sets up the database with the following credentials:
-   **User**: `election_user`
-   **Password**: `election_pass`
-   **Database**: `election`

### 3. Start Infrastructure

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

### 4. Setup Database

Run the database migrations and seed data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 5. Run Development Server

Start both the frontend and backend in development mode:

```bash
npm run dev
```

-   **Web**: http://localhost:3000
-   **API**: http://localhost:3001 (or configured port)
-   **API Swagger**: http://localhost:3001/api (if configured)
-   **Prisma Studio**: `npm run db:studio` (http://localhost:5555)

## Available Scripts

### Root

-   `npm run dev`: Run all apps in development mode.
-   `npm run build`: Build all apps.
-   `npm run lint`: Lint all apps.
-   `npm run test`: Run tests across the project.
-   `npm run clean`: Clean build artifacts.

### Scoped

-   `npm run dev:web`: Run only the web app.
-   `npm run dev:api`: Run only the api app.
-   `npm run build:web`: Build only the web app.
-   `npm run build:api`: Build only the api app.

### Database (via API app)

-   `npm run db:generate`: Generate Prisma client.
-   `npm run db:migrate`: Run database migrations.
-   `npm run db:seed`: Seed the database.
-   `npm run db:studio`: Open Prisma Studio to view data.

## Tech Stack

### Frontend (Web)
-   **Framework**: Next.js 16 (Turbopack)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS v4
-   **Visualization**: D3.js, Recharts, Framer Motion
-   **State/Socket**: Socket.IO Client

### Backend (API)
-   **Framework**: NestJS
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Caching/Queue**: Redis
-   **Real-time**: Socket.IO (WebSockets)
-   **Documentation**: Swagger (OpenAPI)
