# Atlant Global India Database Setup Guide

This project already includes a backend API layer and a Drizzle-based database package. The intent is to keep the frontend separate from the database and route all business data through the API layer.

## 1. Prerequisites

Install PostgreSQL 16 or newer and confirm the server is running locally or on your staging/production host.

Required tools:
- PostgreSQL client
- Node.js 20+
- pnpm
- A terminal with access to the project root

## 2. Create the database

Connect to PostgreSQL and create a database named `atlant_global_india`.

```bash
createdb atlant_global_india
```

If you are using a password-based configuration, create a user and grant privileges.

```sql
CREATE USER postgres WITH PASSWORD 'your_password';
ALTER USER postgres WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE atlant_global_india TO postgres;
```

## 3. Configure environment variables

Copy the sample configuration and fill in the real values.

```bash
cp .env.example .env
```

The required values are:
- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`
- `API_SECRET`
- `SMTP_*`
- `CORS_ORIGIN`

Example:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/atlant_global_india
CORS_ORIGIN=http://localhost:19167,http://localhost:5173
JWT_SECRET=replace_with_a_secure_random_string
API_SECRET=replace_with_a_secure_random_string
```

## 4. Run database migrations

From the workspace root:

```bash
pnpm --dir Atlantis-Global-India-Website/lib/db exec drizzle-kit migrate --config ./drizzle.config.ts
```

If the database is empty, this creates the website tables for:
- users
- contact_leads
- quote_requests
- website_enquiries
- newsletter_subscribers
- tracking_searches

## 5. Start the backend API

```bash
cd Atlantis-Global-India-Website/artifacts/api-server
pnpm install
pnpm run build
pnpm run start
```

To start both the API and website together from the workspace root, run:

```bash
bash scripts/run-project.sh
```

The website is available at `http://localhost:19167` and the API at
`http://localhost:3001`. The script requires pnpm, a configured `.env` file,
and a running PostgreSQL database.

The server exposes:
- `GET /api/healthz`
- `GET /api/db-health`
- `POST /api/contact`
- `POST /api/quotes`
- `POST /api/newsletter`
- `POST /api/tracking`

## 6. Connect the frontend to the API

The frontend should call the backend API instead of writing directly to the database. The current UI is already structured to support this via secure API requests with graceful mailto fallbacks in cases where the backend is unavailable.

## 7. Backup and recovery plan

Recommended practice:
- Daily automated postgres dump
- Weekly backup verification
- Monthly restore drill
- Retain backups for 30–90 days depending on business needs

Example backup command:

```bash
pg_dump -U postgres -h localhost -d atlant_global_india > backup.sql
```

## 8. Security checklist

- Never hardcode credentials in frontend code
- Never expose database credentials in public repos
- Validate every incoming request
- Restrict admin access behind authentication
- Run the API behind HTTPS in production
- Use environment variables for secrets
- Log errors without including secrets or passwords

## 9. Maintainability

The schema is centralized in `lib/db/src/schema/index.ts`, migrations are stored in `lib/db/migrations`, and the API routes live under `artifacts/api-server/src/routes`.

This makes future expansion easier for:
- admin dashboard
- CRM lead management
- customer login portal
- reporting and analytics
- service management features
