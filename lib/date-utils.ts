import { format, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDateIndonesian(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: id });
}

export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday (exclude weekends)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return Math.max(0, count);
}

export function getTodayISO(): string {
  return formatDateISO(new Date());
}

export function generateFileName(employeeName: string, submissionDate?: string): string {
  const d = submissionDate ? new Date(submissionDate) : new Date();
  const dateStr = format(d, 'dd MMMM yyyy', { locale: id });
  // Sanitize employee name: trim and remove characters invalid in filenames
  const safeName = (employeeName || 'Karyawan').trim().replace(/[/\\:*?"<>|]/g, '');
  return `Cuti_${safeName}_${dateStr}.pdf`;
}

/**
 * Calculates duration between two date+time pairs.
 * Returns { days, hours, durationType }
 * - durationType 'hours'  → same date OR less than 1 working day
 * - durationType 'days'   → spans multiple calendar days
 */
export function calculateDuration(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string,
): { days: number; hours: number; durationType: 'days' | 'hours' } {
  if (!startDate || !endDate) return { days: 0, hours: 0, durationType: 'hours' };

  const sTime = startTime || '08:00';
  const eTime = endTime   || '17:00';

  const start = new Date(`${startDate}T${sTime}:00`);
  const end   = new Date(`${endDate}T${eTime}:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { days: 0, hours: 0, durationType: 'hours' };
  }

  const diffMs   = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Same calendar day → always show in hours
  if (startDate === endDate) {
    return {
      days: 0,
      hours: Math.max(0, Math.round(diffHours * 10) / 10),
      durationType: 'hours',
    };
  }

  // Different dates → calculate working days
  const workingDays = calculateWorkingDays(startDate, endDate);

  return {
    days: workingDays,
    hours: Math.max(0, Math.round(diffHours * 10) / 10),
    durationType: 'days',
  };
}

export function formatTime24(time: string): string {
  if (!time) return '';
  return time; // already HH:mm
}

export function formatDateTimeIndonesian(date: string, time: string): string {
  if (!date) return '-';
  const dateStr = formatDateIndonesian(date);
  if (!time) return dateStr;
  return `${dateStr}, ${time} WIB`;
}
