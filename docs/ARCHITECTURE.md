# Atlant Global India Architecture Overview

## System flow

USER
  ↓
WEBSITE / FRONTEND
  ↓
BACKEND API
  ↓
AUTHENTICATION / VALIDATION
  ↓
DATABASE
  ↓
BACKUP / LOGGING / MONITORING

## Frontend

- Vite + React + TypeScript
- Wouter for client-side routing
- Shared CSS design system in `src/index.css`
- Fully responsive corporate landing and service pages

## Backend

- Express server in `artifacts/api-server`
- Structured logging with Pino
- JSON validation using Zod
- CORS configuration and security headers
- Modular route layer for business operations

## Database

- PostgreSQL with Drizzle ORM
- Schema definition in `lib/db/src/schema/index.ts`
- Migration files in `lib/db/migrations`
- Future-ready tables for users, leads, quotes, newsletters and tracking searches

## API architecture

Primary endpoints:
- `GET /api/healthz`
- `GET /api/db-health`
- `POST /api/contact`
- `POST /api/quotes`
- `POST /api/newsletter`
- `POST /api/tracking`

Each route validates inputs, sanitizes data, and writes to the database when configured.

## Authentication and security

This codebase is prepared for a future admin layer with role-based access control. The current setup keeps secrets in environment variables and avoids exposing raw credentials in frontend code.

## Hosting and deployment

Recommended production setup:
- Managed PostgreSQL database
- Node.js hosting server or VPS
- HTTPS enabled via domain certificate
- Reverse proxy or load balancer if scaling beyond a single instance
- Daily DB backup automation

## Monitoring

- Structured application logs
- API health endpoints
- Database health checks
- Error tracking via server logs
- Performance monitoring can be added later without changing the route structure

## Future expansion strategy

The current structure is organized so future features can be added cleanly:
- customer login
- admin dashboard
- CRM dashboard
- service management
- reporting and analytics
- lead assignment and export flows
- multilingual support and branch management
