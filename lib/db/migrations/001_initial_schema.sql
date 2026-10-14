CREATE TYPE user_role AS ENUM ('admin', 'staff', 'customer');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'closed');
CREATE TYPE newsletter_status AS ENUM ('active', 'unsubscribed');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS contact_leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_interest TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website',
  status lead_status NOT NULL DEFAULT 'new',
  assigned_employee TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_requests (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS website_enquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  page_source TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status newsletter_status NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS tracking_searches (
  id SERIAL PRIMARY KEY,
  tracking_number TEXT NOT NULL,
  search_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  search_source TEXT NOT NULL DEFAULT 'website',
  result_status TEXT NOT NULL DEFAULT 'unknown',
  result_summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON contact_leads (status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests (status);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers (status);
CREATE INDEX IF NOT EXISTS idx_tracking_searches_number ON tracking_searches (tracking_number);
