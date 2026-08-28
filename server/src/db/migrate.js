import { pool } from './pool.js';

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

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
`;

export async function runMigrations() {
  await pool.query(SCHEMA);
  console.log('Database schema is ready.');
}
