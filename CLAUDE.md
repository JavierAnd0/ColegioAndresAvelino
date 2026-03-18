# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack educational institution website with a public-facing site and a CMS admin dashboard. The admin allows managing activities, blog posts, events, teachers, grades, and honor roll entries.

## Repository Structure

```
proyectoColegio/
├── colegio-frontend/   # Next.js 16 + React 19 (App Router)
└── colegio-backend/    # Express.js + MongoDB REST API
```

## Commands

### Frontend (`colegio-frontend/`)
```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # Biome check
npm run format    # Biome format --write
```

### Backend (`colegio-backend/`)
```bash
npm run dev           # nodemon watch mode (port 5000)
npm start             # Production start
npm run seed          # Seed the database
npm test              # Jest tests (uses in-memory MongoDB)
npm run test:verbose  # Tests with verbose output
```

### Running a single test
```bash
# From colegio-backend/
NODE_OPTIONS='--experimental-vm-modules' jest tests/path/to/file.test.js --forceExit
```

## Architecture

### Frontend

- **Next.js App Router** with the `@/*` alias pointing to `src/`
- **React Compiler** is enabled (`reactCompiler: true` in `next.config.mjs`)
- **Atomic design** component structure: `atoms → molecules → organisms → templates`
- **Auth** is managed via `AuthContext` (JWT stored client-side, decoded with `jwt-decode`)
- **API calls** go through `src/services/api.js` (Axios instance) — each resource has its own service file (`activityService.js`, `blogService.js`, etc.)
- **Admin routes** live under `src/app/admin/` and are protected by auth context
- **SEO** is centralized in `src/lib/seo.js`
- **EmailJS** handles the contact form (no backend needed for email)
- **Tailwind CSS v4** with custom theme in `tailwind.config.js`; uses `@iconify/tailwind` for icons

### Backend

- **Express** app defined in `src/app.js`, entry point `src/server.js` (port 5000)
- **Layered architecture**: `routes → controllers → models` (Mongoose/MongoDB)
- **JWT auth middleware** at `src/middleware/auth.js` — protect routes with this middleware
- **Images** are uploaded via Multer → Cloudinary (`src/config/cloudinary.js`)
- **Cron jobs** in `src/cron/` handle scheduled activity state changes
- **Tests** use `mongodb-memory-server` for an in-memory database; test files live in `src/tests/`
- **ES Modules** (`"type": "module"`) — use `import/export` syntax throughout

### Environment Variables

Frontend (`.env.local`):
- `NEXT_PUBLIC_API_URL` — backend base URL (default: `http://localhost:5000/api`)
- `NEXT_PUBLIC_EMAILJS_*` — EmailJS credentials for the contact form

Backend (`.env`):
- `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `NODE_ENV`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PEXELS_API_KEY` — auto-fetch images for blog posts
- `CORS_ORIGINS` — comma-separated allowed origins

## Code Style

- **Linter/Formatter**: Biome (`biome.json`) — 2-space indent, spaces (not tabs)
- Run `npm run format` before committing frontend changes
- Backend uses plain Node.js conventions; no formatter is configured
