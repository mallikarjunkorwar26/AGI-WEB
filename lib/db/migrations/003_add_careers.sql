CREATE TABLE IF NOT EXISTS careers_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  experience_required TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  filled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES careers_jobs(id) ON DELETE SET NULL,
  job_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  experience TEXT NOT NULL,
  cover_letter TEXT,
  resume_original_name TEXT NOT NULL,
  resume_mime_type TEXT NOT NULL,
  resume_data BYTEA NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_careers_jobs_visibility
  ON careers_jobs (published, filled);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at
  ON career_applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_applications_job_id
  ON career_applications (job_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status
  ON career_applications (status);
