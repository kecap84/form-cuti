'use client';

import { useEffect } from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { LeaveFormData, LeaveType, DurationUnit, LEAVE_TYPES, LEAVE_TYPE_MAX_DAYS } from '@/lib/form-types';

const ALL_LEAVE_TYPES = Object.entries(LEAVE_TYPES) as [LeaveType, string][];

export function LeaveTypeSection() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<LeaveFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'leaveEntries',
  });

  const entries = useWatch({ control, name: 'leaveEntries' }) || [];

  // Recalculate totals whenever entries change
  const totalDays  = entries.reduce((sum, e) => sum + (e.durationUnit === 'days'  ? (e.durationValue || 0) : 0), 0);
  const totalHours = entries.reduce((sum, e) => sum + (e.durationUnit === 'hours' ? (e.durationValue || 0) : 0), 0);

  // Sync computed totals into form values inside useEffect (never during render)
  useEffect(() => {
    setValue('totalDays', totalDays);
    setValue('totalHours', totalHours);
  }, [totalDays, totalHours, setValue]);

  const selectedTypes = entries.map((e) => e.type);

  const handleToggle = (key: LeaveType) => {
    if (selectedTypes.includes(key)) {
      const idx = fields.findIndex((f) => f.type === key);
      if (idx !== -1) remove(idx);
    } else {
      append({ type: key, durationValue: 1, durationUnit: 'days' });
    }
  };

  const grandTotalLabel = () => {
    const parts: string[] = [];
    if (totalDays > 0)  parts.push(`${totalDays} hari`);
    if (totalHours > 0) parts.push(`${totalHours} jam`);
    return parts.length > 0 ? parts.join(' + ') : '—';
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Jenis Cuti / Ijin</h2>
      <p className="text-xs text-gray-500 mb-4">
        Pilih satu atau lebih jenis cuti. Masukkan durasi untuk setiap jenis yang dipilih.
      </p>

      {/* Pilihan jenis cuti */}
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-4">
        {ALL_LEAVE_TYPES.map(([key, label]) => {
          const isChecked = selectedTypes.includes(key);
          const maxDays = LEAVE_TYPE_MAX_DAYS[key];
          const entryIdx = fields.findIndex((f) => f.type === key);
          const entryErrors = (errors.leaveEntries as any)?.[entryIdx];

          return (
            <div
              key={key}
              className={`transition-colors ${
                isChecked ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {/* Checkbox row */}
              <label className={`flex items-start gap-3 px-4 pt-3 ${isChecked ? 'pb-2' : 'pb-3'} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(key)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                  <span className={`text-sm ${isChecked ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                    {label}
                  </span>
                  {maxDays !== null && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      isChecked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      Maks. {maxDays} hari
                    </span>
                  )}
                </div>
              </label>

              {/* Duration input — hanya tampil kalau terpilih */}
              {isChecked && entryIdx !== -1 && (
                <div className="px-4 pb-3 pl-11">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        {...register(`leaveEntries.${entryIdx}.durationValue`, { valueAsNumber: true })}
                        className="w-20 px-2 py-1.5 text-sm border-0 outline-none"
                        placeholder="0"
                      />
                      <select
                        {...register(`leaveEntries.${entryIdx}.durationUnit`)}
                        className="px-2 py-1.5 text-sm bg-gray-50 border-l border-gray-300 outline-none"
                      >
                        <option value="days">hari</option>
                        <option value="hours">jam</option>
                      </select>
                    </div>
                    {maxDays !== null && (
                      <span className="text-xs text-gray-400">
                        (maks. {maxDays} hari)
                      </span>
                    )}
                  </div>
                  {entryErrors?.durationValue && (
                    <p className="text-red-500 text-xs mt-1">{entryErrors.durationValue.message}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error jika belum ada pilihan */}
      {errors.leaveEntries && !Array.isArray(errors.leaveEntries) && (
        <p className="text-red-500 text-xs mb-3">{(errors.leaveEntries as any).message}</p>
      )}

      {/* Summary total */}
      {fields.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ringkasan Durasi</p>
          <div className="space-y-1 mb-3">
            {entries.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{LEAVE_TYPES[e.type as LeaveType] || e.type}</span>
                <span className="font-medium text-gray-900">
                  {e.durationValue || 0} {e.durationUnit === 'days' ? 'hari' : 'jam'}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-300">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-sm font-bold text-blue-700">{grandTotalLabel()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
