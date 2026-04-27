'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { LeaveFormData } from '@/lib/form-types';
import { SignaturePad } from './SignaturePad';

interface ApprovalBlockProps {
  fieldPrefix: 'immediateSupervision' | 'managerApproval' | 'hcDepartment';
  title: string;
  subtitle: string;
}

export function ApprovalBlock({ fieldPrefix, title, subtitle }: ApprovalBlockProps) {
  const { control, formState: { errors } } = useFormContext<LeaveFormData>();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-4">
        <h3 className="text-md font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`${fieldPrefix}.name` as any}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama pejabat"
              />
            )}
          />
          {errors[fieldPrefix]?.name && (
            <p className="text-red-500 text-xs mt-1">{errors[fieldPrefix]?.name?.message}</p>
          )}
        </div>

        {/* Tanggal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal <span className="text-red-500">*</span>
          </label>
          <Controller
            name={`${fieldPrefix}.date` as any}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          />
          {errors[fieldPrefix]?.date && (
            <p className="text-red-500 text-xs mt-1">{errors[fieldPrefix]?.date?.message}</p>
          )}
        </div>
      </div>

      {/* Signature Pad */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tanda Tangan <span className="text-red-500">*</span>
        </label>
        <Controller
          name={`${fieldPrefix}.signatureData` as any}
          control={control}
          render={({ field }) => (
            <SignaturePad
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors[fieldPrefix]?.signatureData && (
          <p className="text-red-500 text-xs mt-1">
            {typeof errors[fieldPrefix]?.signatureData?.message === 'string' 
              ? errors[fieldPrefix]?.signatureData?.message 
              : 'Error di tanda tangan'}
          </p>
        )}
      </div>
    </div>
  );
}

export function ApprovalSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Persetujuan & Tanda Tangan</h2>
      
      <ApprovalBlock
        fieldPrefix="immediateSupervision"
        title="Atasan Langsung"
        subtitle="Mengetahui dan Merekomendasikan"
      />
      
      <ApprovalBlock
        fieldPrefix="managerApproval"
        title="Manager / GM / Direksi"
        subtitle="Menyetujui Permohonan"
      />
      
      <ApprovalBlock
        fieldPrefix="hcDepartment"
        title="HC Department"
        subtitle="Menerima dan Memproses"
      />
    </div>
  );
}
