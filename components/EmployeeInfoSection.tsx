'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { LeaveFormData, EmploymentStatus, ENTITY_OPTIONS } from '@/lib/form-types';

const EMPLOYMENT_STATUSES: { value: EmploymentStatus; label: string }[] = [
  { value: 'permanent', label: 'Tetap' },
  { value: 'contract', label: 'Kontrak' },
  { value: 'internship', label: 'Magang' },
];

export function EmployeeInfoSection() {
  const { control, formState: { errors } } = useFormContext<LeaveFormData>();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Karyawan</h2>

      {/* Entitas — full width, di paling atas */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Entitas <span className="text-red-500">*</span>
        </label>
        <Controller
          name="entity"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.entity ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <option value="">Pilih entitas perusahaan</option>
              {ENTITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        />
        {errors.entity && (
          <p className="text-red-500 text-xs mt-1">{errors.entity.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Karyawan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Karyawan <span className="text-red-500">*</span>
          </label>
          <Controller
            name="employeeName"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            )}
          />
          {errors.employeeName && (
            <p className="text-red-500 text-xs mt-1">{errors.employeeName.message}</p>
          )}
        </div>



        {/* Nomor Induk Karyawan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor Induk Karyawan
          </label>
          <Controller
            name="employeeNumber"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor ID karyawan"
              />
            )}
          />
          {errors.employeeNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.employeeNumber.message}</p>
          )}
        </div>

        {/* Jabatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jabatan
          </label>
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Posisi karyawan"
              />
            )}
          />
          {errors.position && (
            <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>
          )}
        </div>

        {/* Departemen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departemen
          </label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unit kerja"
              />
            )}
          />
          {errors.department && (
            <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>
          )}
        </div>

        {/* Status Kepegawaian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status Karyawan
          </label>
          <Controller
            name="employmentStatus"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih status</option>
                {EMPLOYMENT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.employmentStatus && (
            <p className="text-red-500 text-xs mt-1">{errors.employmentStatus.message}</p>
          )}
        </div>

        {/* Lokasi Penempatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokasi Penempatan
          </label>
          <Controller
            name="placementLocation"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lokasi kerja"
              />
            )}
          />
        </div>

        {/* No. WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            No. HP WhatsApp
          </label>
          <Controller
            name="whatsappPhone"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="08xxxxxxxxxx"
              />
            )}
          />
          {errors.whatsappPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.whatsappPhone.message}</p>
          )}
        </div>

        {/* No. Emergency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            No. Emergency
          </label>
          <Controller
            name="emergencyPhone"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nomor kontak darurat"
              />
            )}
          />
        </div>
      </div>

      {/* Alamat Cuti */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alamat Cuti
        </label>
        <Controller
          name="leaveAddress"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Alamat selama cuti"
              rows={3}
            />
          )}
        />
      </div>
    </div>
  );
}
