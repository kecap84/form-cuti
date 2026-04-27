'use client';

import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { LeaveFormData } from '@/lib/form-types';
import { EmployeeInfoSection } from './EmployeeInfoSection';
import { LeaveTypeSection } from './LeaveTypeSection';
import { DatePeriodSection } from './DatePeriodSection';
import { ApprovalSection } from './ApprovalSection';
import { FormPDFPreview } from './FormPDFPreview';
import { SignaturePad } from './SignaturePad';
import { getTodayISO } from '@/lib/date-utils';

// Validation schema
const leaveEntrySchema = z.object({
  type: z.string().min(1),
  durationValue: z.number().min(0.5, 'Durasi minimal 0.5'),
  durationUnit: z.enum(['days', 'hours']),
});

const leaveFormSchema = z.object({
  entity: z.string().min(1, 'Entitas wajib dipilih'),
  employeeName: z.string().min(1, 'Nama karyawan wajib diisi'),
  employeeNumber: z.string().optional().default(''),
  position: z.string().optional().default(''),
  department: z.string().optional().default(''),
  employmentStatus: z.string().optional().default(''),
  dateHired: z.string().optional().default(''),
  placementLocation: z.string().optional().default(''),
  leaveAddress: z.string().optional().default(''),
  whatsappPhone: z.string().optional().default(''),
  emergencyPhone: z.string().optional().default(''),
  submissionDate: z.string(),
  leaveEntries: z.array(leaveEntrySchema).min(1, 'Pilih minimal satu jenis cuti/ijin'),
  totalDays: z.number(),
  totalHours: z.number(),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  startTime: z.string().min(1, 'Jam mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  endTime: z.string().min(1, 'Jam selesai wajib diisi'),
  durationType: z.enum(['days', 'hours']),
  substitutePerson: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  employeeSignature: z.string().min(1, 'Tanda tangan karyawan wajib diisi sebelum melanjutkan'),
  immediateSupervision: z.object({
    name: z.string().optional().default(''),
    date: z.string().optional().default(''),
    signatureData: z.string().optional(),
  }),
  managerApproval: z.object({
    name: z.string().optional().default(''),
    date: z.string().optional().default(''),
    signatureData: z.string().optional(),
  }),
  hcDepartment: z.object({
    name: z.string().optional().default(''),
    date: z.string().optional().default(''),
    signatureData: z.string().optional(),
  }),
});

type LeaveFormInputs = z.infer<typeof leaveFormSchema>;

// ── Inline sub-component so it can access FormProvider context ───────────
function EmployeeSignatureSection({ methods }: { methods: ReturnType<typeof useForm<LeaveFormInputs>> }) {
  const { formState: { errors } } = methods;
  const sigError = errors.employeeSignature?.message;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Tanda Tangan Karyawan</h2>
      <p className="text-xs text-gray-500 mb-4">
        Tanda tangan wajib diisi sebelum melanjutkan ke preview. Gunakan mouse atau sentuh layar.
      </p>
      <Controller
        name="employeeSignature"
        control={methods.control}
        render={({ field }) => (
          <SignaturePad
            value={field.value}
            onChange={field.onChange}
            height={120}
            hasError={!!sigError}
          />
        )}
      />
      {sigError && (
        <p className="text-red-500 text-xs mt-2">{sigError}</p>
      )}
    </div>
  );
}

export function LeaveForm() {
  const [showPreview, setShowPreview] = useState(false);
  const methods = useForm<LeaveFormInputs>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      entity: '',
      employeeName: '',
      employeeNumber: '',
      position: '',
      department: '',
      employmentStatus: '',
      dateHired: '',
      placementLocation: '',
      leaveAddress: '',
      whatsappPhone: '',
      emergencyPhone: '',
      submissionDate: getTodayISO(),
      leaveEntries: [],
      totalDays: 0,
      totalHours: 0,
      startDate: '',
      startTime: '08:00',
      endDate: '',
      endTime: '17:00',
      durationType: 'days' as const,
      substitutePerson: '',
      notes: '',
      employeeSignature: '',
      immediateSupervision: { name: '', date: '', signatureData: '' },
      managerApproval: { name: '', date: '', signatureData: '' },
      hcDepartment: { name: '', date: '', signatureData: '' },
    },
    mode: 'onChange',
  });

  const onSubmit = (data: LeaveFormInputs) => {
    console.log('[v0] Form valid, showing preview');
    setShowPreview(true);
  };

  if (showPreview) {
    return (
      <FormPDFPreview
        data={methods.getValues()}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h1 className="text-2xl font-bold text-gray-900">Permohonan Cuti / Ijin</h1>
          <p className="text-sm text-gray-600 mt-1">
            Berlaku mulai: 01/11/2024 (Rev. 0)
          </p>
        </div>

        {/* Form Sections */}
        <EmployeeInfoSection />
        <LeaveTypeSection />
        <DatePeriodSection />
        <ApprovalSection />

        {/* Tanda Tangan Karyawan */}
        <EmployeeSignatureSection methods={methods} />

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <button
            type="button"
            onClick={() => methods.reset()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            Lanjutkan ke Preview
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
