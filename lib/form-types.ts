export type LeaveType =
  | 'annual'
  | 'maternity'
  | 'unpaid'
  | 'emergency_death'
  | 'emergency_birth'
  | 'marriage'
  | 'child_marriage'
  | 'child_circumcision'
  | 'child_baptism';

export type EmploymentStatus = 'permanent' | 'contract' | 'internship';

export type DurationUnit = 'days' | 'hours';

export type EntityOption = 'PT Sarana Sukses Sejahtera' | 'PT Gunungmas Sukses Makmur';

export const ENTITY_OPTIONS: EntityOption[] = [
  'PT Sarana Sukses Sejahtera',
  'PT Gunungmas Sukses Makmur',
];

/** One jenis cuti beserta durasinya */
export interface LeaveEntry {
  type: LeaveType;
  durationValue: number;   // angka durasi (mis. 2)
  durationUnit: DurationUnit; // 'days' atau 'hours'
}

export interface ApprovalSignature {
  name: string;
  date: string;
  signatureData?: string; // Base64 encoded canvas data
}

export interface LeaveFormData {
  // Employee Info
  entity: string;          // wajib — entitas perusahaan
  employeeName: string;
  employeeNumber: string;
  position: string;
  department: string;
  employmentStatus: string;
  dateHired: string;
  placementLocation: string;
  leaveAddress: string;
  whatsappPhone: string;
  emergencyPhone: string;
  submissionDate: string;

  // Leave Details — multi-entry dengan durasi masing-masing
  leaveEntries: LeaveEntry[];
  /** computed totals (diisi otomatis) */
  totalDays: number;
  totalHours: number;

  // Periode
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  durationType: DurationUnit;

  substitutePerson: string;
  notes: string;

  // Tanda tangan karyawan (wajib sebelum export PDF)
  employeeSignature: string; // Base64 PNG dari signature pad karyawan

  // Approvals
  immediateSupervision: ApprovalSignature;
  managerApproval: ApprovalSignature;
  hcDepartment: ApprovalSignature;
}

export const LEAVE_TYPES: Record<LeaveType, string> = {
  annual:             'Cuti Tahunan',
  maternity:          'Cuti Melahirkan',
  unpaid:             'Izin Tidak Dibayar (dipotong THP)',
  emergency_death:    'Izin Emergency — Kematian',
  emergency_birth:    'Izin Emergency — Melahirkan/Keguguran Istri',
  marriage:           'Ijin Pernikahan Karyawan (pertama kali)',
  child_marriage:     'Ijin Menikahkan Anak (sesuai KK)',
  child_circumcision: 'Ijin Mengkhitankan Anak (sesuai KK)',
  child_baptism:      'Ijin Membaptiskan Anak (sesuai KK)',
};

/** Maximum duration in calendar days (null = no fixed limit) */
export const LEAVE_TYPE_MAX_DAYS: Record<LeaveType, number | null> = {
  annual:             null,
  maternity:          90,
  unpaid:             null,
  emergency_death:    2,
  emergency_birth:    2,
  marriage:           3,
  child_marriage:     2,
  child_circumcision: 2,
  child_baptism:      2,
};
