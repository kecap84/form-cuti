import { LeaveFormData } from './form-types';

/**
 * Field utama yang wajib diisi: Nama Karyawan, Jenis Cuti, Tanggal Mulai, Tanggal Selesai.
 * Semua field lainnya bersifat opsional.
 */
export function validateForm(data: Partial<LeaveFormData>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.employeeName?.trim()) {
    errors.employeeName = 'Nama karyawan wajib diisi';
  }

  if (!data.leaveTypes || data.leaveTypes.length === 0) {
    errors.leaveTypes = 'Pilih minimal satu jenis cuti/ijin';
  }

  if (!data.startDate?.trim()) {
    errors.startDate = 'Tanggal mulai wajib diisi';
  }
  if (!data.endDate?.trim()) {
    errors.endDate = 'Tanggal selesai wajib diisi';
  }
  if (data.startDate && data.endDate) {
    const start = new Date(`${data.startDate}T${data.startTime || '00:00'}`);
    const end   = new Date(`${data.endDate}T${data.endTime || '00:00'}`);
    if (end <= start) {
      errors.endDate = 'Tanggal & jam selesai harus setelah tanggal & jam mulai';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
