'use client';

import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { LeaveFormData, LEAVE_TYPES, LeaveType } from '@/lib/form-types';
import { useEffect } from 'react';

export function DatePeriodSection() {
  const {
    control,
    formState: { errors },
    setError,
    clearErrors,
  } = useFormContext<LeaveFormData>();

  const startDate  = useWatch({ control, name: 'startDate' });
  const startTime  = useWatch({ control, name: 'startTime' });
  const endDate    = useWatch({ control, name: 'endDate' });
  const endTime    = useWatch({ control, name: 'endTime' });
  const totalDays  = useWatch({ control, name: 'totalDays' });
  const totalHours = useWatch({ control, name: 'totalHours' });
  const entries    = useWatch({ control, name: 'leaveEntries' }) || [];

  // Validate period dates
  useEffect(() => {
    if (!startDate || !startTime || !endDate || !endTime) return;

    if (startDate === endDate) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      if (eh * 60 + em <= sh * 60 + sm) {
        setError('endTime', { message: 'Jam selesai harus lebih besar dari jam mulai' });
        return;
      }
    }

    const start = new Date(`${startDate}T${startTime}:00`);
    const end   = new Date(`${endDate}T${endTime}:00`);
    if (end <= start) {
      setError('endDate', { message: 'Tanggal & jam selesai harus setelah tanggal & jam mulai' });
      return;
    }

    clearErrors(['endDate', 'endTime']);
  }, [startDate, startTime, endDate, endTime, setError, clearErrors]);

  const inputCls = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  const totalLabel = () => {
    const parts: string[] = [];
    if (totalDays  > 0) parts.push(`${totalDays} hari`);
    if (totalHours > 0) parts.push(`${totalHours} jam`);
    return parts.length > 0 ? parts.join(' + ') : '—';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Periode Cuti</h2>
      <p className="text-xs text-gray-500 mb-4">
        Masukkan tanggal dan jam mulai serta selesai. Gunakan format 24 jam (HH:mm).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

        {/* Tanggal & Jam Mulai */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal &amp; Jam Mulai <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <input {...field} type="date" className={`flex-1 ${inputCls(!!errors.startDate)}`} />
              )}
            />
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <input {...field} type="time" className={`w-28 ${inputCls(!!errors.startTime)}`} />
              )}
            />
          </div>
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
          {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
        </div>

        {/* Tanggal & Jam Selesai */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal &amp; Jam Selesai <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <input {...field} type="date" className={`flex-1 ${inputCls(!!errors.endDate)}`} />
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <input {...field} type="time" className={`w-28 ${inputCls(!!errors.endTime)}`} />
              )}
            />
          </div>
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
          {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
        </div>

        {/* Pejabat Pengganti */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pejabat Pengganti
          </label>
          <Controller
            name="substitutePerson"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={inputCls(!!errors.substitutePerson)}
                placeholder="Nama pejabat pengganti"
              />
            )}
          />
          {errors.substitutePerson && (
            <p className="text-red-500 text-xs mt-1">{errors.substitutePerson.message}</p>
          )}
        </div>

        {/* Total durasi dari leaveEntries (read-only referensi) */}
        {entries.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Durasi (dari jenis cuti)
            </label>
            <div className="px-3 py-2 border border-gray-200 rounded-md bg-blue-50 text-sm font-semibold text-blue-800">
              {totalLabel()}
            </div>
          </div>
        )}
      </div>

      {/* Catatan */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catatan
        </label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Keterangan tambahan (opsional)"
              rows={2}
            />
          )}
        />
      </div>
    </div>
  );
}
