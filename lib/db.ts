import { LeaveFormData } from './form-types';

/** Generate short random ID (8 karakter alphanumeric) */
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export type LeaveRequestStatus =
  | 'pending_supervisor'
  | 'pending_manager'
  | 'pending_hc'
  | 'approved';

export interface LeaveRequest {
  id: string;
  created_at: string;
  updated_at: string;
  status: LeaveRequestStatus;
  form_data: LeaveFormData | string;
  employee_signature: string | null;
  supervisor_name: string | null;
  supervisor_date: string | null;
  supervisor_signature: string | null;
  manager_name: string | null;
  manager_date: string | null;
  manager_signature: string | null;
  hc_name: string | null;
  hc_date: string | null;
  hc_signature: string | null;
}

/** Gabungkan database row menjadi LeaveFormData lengkap dengan semua approval */
export function mergeFormData(row: LeaveRequest): LeaveFormData {
  // Neon serverless driver otomatis parse JSONB → object.
  // Fallback JSON.parse jika datanya string (edge case).
  const formData: LeaveFormData =
    typeof row.form_data === 'string'
      ? JSON.parse(row.form_data)
      : (row.form_data as LeaveFormData);

  return {
    ...formData,
    employeeSignature: row.employee_signature ?? '',
    immediateSupervision: {
      name: row.supervisor_name ?? '',
      date: row.supervisor_date ?? '',
      signatureData: row.supervisor_signature ?? '',
    },
    managerApproval: {
      name: row.manager_name ?? '',
      date: row.manager_date ?? '',
      signatureData: row.manager_signature ?? '',
    },
    hcDepartment: {
      name: row.hc_name ?? '',
      date: row.hc_date ?? '',
      signatureData: row.hc_signature ?? '',
    },
  };
}
