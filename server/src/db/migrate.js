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
    'store','project-manager','head-office','partner','team-member'
  )),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  quotation_id INTEGER NOT NULL REFERENCES quotations(id),
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoices_quotation ON invoices(quotation_id);
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
];
const DEMO_PASSWORD = 'Demo@2026';

export async function runMigrations() {
  await pool.query(SCHEMA);
  console.log('Database schema is ready.');

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
