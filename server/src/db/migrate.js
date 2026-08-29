import { pool } from './pool.js';
import bcrypt from 'bcryptjs';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS quotations (
  id SERIAL PRIMARY KEY,

  -- Partner / request details
  partner_name TEXT NOT NULL,
  partner_email TEXT,
  partner_phone TEXT,
  num_workers INTEGER NOT NULL DEFAULT 0,
  num_foremen INTEGER NOT NULL DEFAULT 0,
  num_operation_supervisors INTEGER NOT NULL DEFAULT 0,
  task_details TEXT,
  location_address TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  payment_terms TEXT NOT NULL DEFAULT 'upfront' CHECK (payment_terms IN ('upfront','monthly')),
  requested_stream TEXT CHECK (requested_stream IN ('pre_school','school','technical_services')),

  -- Overall workflow status
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted',
    'om_approved', 'om_rejected',
    'office_approved', 'office_rejected',
    'manager_approved', 'manager_rejected'
  )),

  -- Stage 1: Operation Management
  om_reviewed_by TEXT,
  om_reviewed_at TIMESTAMPTZ,
  om_notes TEXT,

  -- Stage 2: Operation Office
  office_approved_by TEXT,
  office_approved_at TIMESTAMPTZ,
  office_approved_amount NUMERIC(12,2),
  office_notes TEXT,

  -- Stage 3: Manager (final)
  manager_approved_by TEXT,
  manager_approved_at TIMESTAMPTZ,
  final_stream TEXT CHECK (final_stream IN ('pre_school','school','technical_services')),
  monthly_terms_approved BOOLEAN,
  manager_notes TEXT,

  created_by_user_id INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'teams','foreman','day-admin','operation-office','op-management',
    'store','project-manager','head-office','partner','team-member',
    'news-manager','shop-manager'
  )),
  display_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

CREATE TABLE IF NOT EXISTS news_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  author_username TEXT,
  author_display_name TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_posts_status ON news_posts(status);

CREATE TABLE IF NOT EXISTS email_broadcasts (
  id SERIAL PRIMARY KEY,
  news_post_id INTEGER REFERENCES news_posts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  recipients TEXT[] NOT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  sent_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(12,2),
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  quotation_id INTEGER NOT NULL REFERENCES quotations(id),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoices_quotation ON invoices(quotation_id);

CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id SERIAL PRIMARY KEY,
  quotation_id INTEGER NOT NULL REFERENCES quotations(id),
  stream TEXT NOT NULL CHECK (stream IN ('pre_school','school','technical_services')),
  account_name TEXT,
  scheduled_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status ON scheduled_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_quotation ON scheduled_jobs(quotation_id);

CREATE TABLE IF NOT EXISTS team_bookings (
  id SERIAL PRIMARY KEY,
  scheduled_job_id INTEGER NOT NULL REFERENCES scheduled_jobs(id),
  team_name TEXT NOT NULL,
  foreman_name TEXT NOT NULL,
  worker1_name TEXT NOT NULL,
  worker2_name TEXT NOT NULL,
  roll_call_session TEXT NOT NULL CHECK (roll_call_session IN ('07:30','12:30')),
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','deployed','completed')),
  no_show_names TEXT[] NOT NULL DEFAULT '{}',
  replacements JSONB NOT NULL DEFAULT '[]',
  deployed_by TEXT,
  deployed_at TIMESTAMPTZ,
  booked_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_bookings_job ON team_bookings(scheduled_job_id);
CREATE INDEX IF NOT EXISTS idx_team_bookings_status ON team_bookings(status);

CREATE TABLE IF NOT EXISTS jobsheets (
  id SERIAL PRIMARY KEY,
  team_booking_id INTEGER NOT NULL REFERENCES team_bookings(id),

  shift_hours INTEGER NOT NULL DEFAULT 4 CHECK (shift_hours IN (4,8)),
  qualified BOOLEAN NOT NULL DEFAULT true,
  labour_total_contracted NUMERIC(12,2) NOT NULL DEFAULT 385,

  -- Per-member payment method + amount (matches spec 3.8: each member's method/amount, segregated cash/EFT totals)
  foreman_payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (foreman_payment_method IN ('cash','eft')),
  foreman_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  worker1_payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (worker1_payment_method IN ('cash','eft')),
  worker1_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  worker2_payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (worker2_payment_method IN ('cash','eft')),
  worker2_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  extra_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  six_x_reward NUMERIC(12,2) NOT NULL DEFAULT 0,
  transport_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  charge_materials BOOLEAN NOT NULL DEFAULT true,
  bags_issued INTEGER NOT NULL DEFAULT 0,
  bags_returned INTEGER NOT NULL DEFAULT 0,
  bags_used INTEGER NOT NULL DEFAULT 0,
  gloves_issued INTEGER NOT NULL DEFAULT 0,
  gloves_returned INTEGER NOT NULL DEFAULT 0,
  gloves_used INTEGER NOT NULL DEFAULT 0,

  other_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  other_notes TEXT,

  serial_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','confirmed','serialed')),
  submitted_by TEXT,
  confirmed_by TEXT,
  confirmed_at TIMESTAMPTZ,
  serialed_by TEXT,
  serialed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobsheets_booking ON jobsheets(team_booking_id);
CREATE INDEX IF NOT EXISTS idx_jobsheets_status ON jobsheets(status);

CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_role TEXT,
  leave_type TEXT NOT NULL DEFAULT 'annual' CHECK (leave_type IN ('annual','sick','family','unpaid','other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  requested_by TEXT,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

CREATE TABLE IF NOT EXISTS payment_authorisations (
  id SERIAL PRIMARY KEY,
  payee_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','declined')),
  requested_by TEXT,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_auth_status ON payment_authorisations(status);

CREATE TABLE IF NOT EXISTS payroll_entries (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_role TEXT,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  hours_worked NUMERIC(8,2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  entered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_register_entries (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  week_ending DATE NOT NULL,
  days_worked INTEGER NOT NULL DEFAULT 0,
  hours_worked NUMERIC(8,2) NOT NULL DEFAULT 0,
  notes TEXT,
  entered_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS oasys_checks (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  expected_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok','discrepancy')),
  checked_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

const DEMO_USERS = [
  { username: 'partner', role: 'partner', display_name: 'Demo Partner' },
  { username: 'opmanagement', role: 'op-management', display_name: 'Demo Operation Management' },
  { username: 'operationoffice', role: 'operation-office', display_name: 'Demo Operation Office' },
  { username: 'manager', role: 'project-manager', display_name: 'Demo Manager' },
  { username: 'teams', role: 'teams', display_name: 'Demo Teams' },
  { username: 'foreman', role: 'foreman', display_name: 'Demo Foreman' },
  { username: 'dayadmin', role: 'day-admin', display_name: 'Demo Day Admin' },
  { username: 'store', role: 'store', display_name: 'Demo Store' },
  { username: 'headoffice', role: 'head-office', display_name: 'Demo Head Office' },
  { username: 'teammember', role: 'team-member', display_name: 'Demo Team Member' },
  { username: 'newsmanager', role: 'news-manager', display_name: 'Demo News Manager' },
  { username: 'shopmanager', role: 'shop-manager', display_name: 'Demo Shop Manager' },
];
const DEMO_PASSWORD = 'Demo@2026';

// Statements applied to databases that already had the old schema before news/shop/roles existed.
// Each is safe to re-run every boot.
const COMPAT_MIGRATIONS = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT`,
  `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`,
  `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (
    'teams','foreman','day-admin','operation-office','op-management',
    'store','project-manager','head-office','partner','team-member',
    'news-manager','shop-manager'
  ))`,
];

export async function runMigrations() {
  await pool.query(SCHEMA);
  console.log('Database schema is ready.');

  for (const stmt of COMPAT_MIGRATIONS) {
    await pool.query(stmt);
  }
  console.log('Compatibility migrations applied.');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const u of DEMO_USERS) {
    await pool.query(
      `INSERT INTO users (username, password_hash, role, display_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (username) DO NOTHING`,
      [u.username, passwordHash, u.role, u.display_name]
    );
  }
  console.log('Demo users seeded (if not already present).');
}
