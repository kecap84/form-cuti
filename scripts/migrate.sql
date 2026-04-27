-- Tabel utama untuk menyimpan pengajuan cuti
CREATE TABLE IF NOT EXISTS leave_requests (
  id            TEXT PRIMARY KEY,          -- short ID, e.g. "abc123"
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Status alur approval
  -- draft | pending_supervisor | pending_manager | pending_hc | approved | rejected
  status        TEXT NOT NULL DEFAULT 'draft',

  -- Data JSON lengkap dari LeaveFormData
  form_data     JSONB NOT NULL,

  -- Tanda tangan karyawan (base64 PNG) — disimpan terpisah dari form_data
  -- untuk memudahkan query tanpa harus load seluruh JSONB
  employee_signature  TEXT,

  -- Approval berjenjang (base64 TTD + metadata)
  supervisor_name       TEXT,
  supervisor_date       TEXT,
  supervisor_signature  TEXT,

  manager_name          TEXT,
  manager_date          TEXT,
  manager_signature     TEXT,

  hc_name               TEXT,
  hc_date               TEXT,
  hc_signature          TEXT
);

-- Index untuk mempercepat lookup berdasarkan status
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- Index untuk mempercepat pencarian berdasarkan tanggal buat
CREATE INDEX IF NOT EXISTS idx_leave_requests_created_at ON leave_requests(created_at DESC);

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON leave_requests;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
