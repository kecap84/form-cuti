'use client';

import { useRef, useState } from 'react';
import { LeaveFormData, LEAVE_TYPES, LeaveType } from '@/lib/form-types';
import { formatDateIndonesian, formatDateTimeIndonesian } from '@/lib/date-utils';
import { exportFormToPDF } from '@/lib/pdf-utils';

interface FormPDFPreviewProps {
  data: LeaveFormData;
  onBack: () => void;
}

// ── small helper ────────────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value || '—'}</p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 rounded bg-blue-600" />
      <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">{children}</h3>
    </div>
  );
}

export function FormPDFPreview({ data, onBack }: FormPDFPreviewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEmployeeSignature = !!data.employeeSignature && data.employeeSignature.length > 100;

  const handleExportPDF = async () => {
    if (!hasEmployeeSignature) return;
    try {
      setError(null);
      setIsExporting(true);
      await exportFormToPDF(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal export PDF';
      setError(message);
      console.error('[v0] PDF Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const totalParts: string[] = [];
  if (data.totalDays  > 0) totalParts.push(`${data.totalDays} hari`);
  if (data.totalHours > 0) totalParts.push(`${data.totalHours} jam`);
  const totalLabel = totalParts.join(' + ') || '—';

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Preview Dokumen</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Periksa isi form sebelum mengunduh PDF.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Kembali Edit
          </button>

          {!hasEmployeeSignature ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-300 rounded-md">
              <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
              <span className="text-xs text-amber-700 font-medium">Tanda tangan karyawan belum diisi</span>
            </div>
          ) : (
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-2 text-sm bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {isExporting ? 'Sedang Ekspor...' : 'Unduh PDF'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Document preview */}
      <div
        className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden"
        style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}
      >
        {/* Document header */}
        <div className="bg-[#00479f] text-white text-center px-8 py-5">
          <h1 className="text-xl font-bold tracking-wide">PERMOHONAN CUTI / IJIN</h1>
          <p className="text-xs text-blue-200 mt-1">Formulir Permohonan Cuti dan Ijin Karyawan &nbsp;·&nbsp; HCGA-Form Cuti | Berlaku 01 Mei 2026 (Rev.0)</p>
          {/* Entitas — prominently displayed in header */}
          {data.entity && (
            <div className="mt-3 inline-block bg-white/15 border border-white/30 rounded px-4 py-1.5">
              <span className="text-[10px] text-blue-200 font-medium uppercase tracking-widest block">Entitas</span>
              <span className="text-base font-bold text-white">{data.entity}</span>
            </div>
          )}
        </div>

        {/* Meta strip */}
        <div className="bg-blue-50 border-b border-blue-200 px-8 py-2 flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Tgl. Pengajuan: </span>
            <span className="text-gray-900">{formatDateIndonesian(data.submissionDate)}</span>
          </div>
          <div>
            <span className="text-blue-600 font-medium">NIK: </span>
            <span className="text-gray-900">{data.employeeNumber || '—'}</span>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Section 1: Data Karyawan */}
          <section>
            <SectionHeading>Data Karyawan</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 border border-gray-200 rounded-md p-4">
              <Field label="Nama Lengkap"        value={data.employeeName} />
              <Field label="No. Induk Karyawan"  value={data.employeeNumber} />
              <Field label="Jabatan"             value={data.position} />
              <Field label="Departemen"          value={data.department} />
              <Field label="Status Karyawan"     value={data.employmentStatus} />
              <Field label="Lokasi Penempatan"   value={data.placementLocation} />
              <Field label="Alamat Selama Cuti"  value={data.leaveAddress} />
              <Field label="No. WhatsApp"        value={data.whatsappPhone} />
              <Field label="No. Emergency"       value={data.emergencyPhone} />
            </div>
          </section>

          {/* Section 2: Jenis Cuti */}
          <section>
            <SectionHeading>Jenis Cuti / Ijin &amp; Durasi</SectionHeading>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <div className="grid grid-cols-[1fr_120px] text-xs font-bold text-blue-800 bg-blue-50 px-4 py-2 border-b border-gray-200">
                <span>Jenis Cuti / Ijin</span>
                <span className="text-right">Durasi</span>
              </div>
              {(data.leaveEntries || []).length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400">—</p>
              ) : (
                data.leaveEntries.map((entry, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[1fr_120px] px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <span className="text-gray-800">{i + 1}. {LEAVE_TYPES[entry.type as LeaveType] || entry.type}</span>
                    <span className="text-right font-semibold text-gray-900">
                      {entry.durationValue} {entry.durationUnit === 'days' ? 'hari' : 'jam'}
                    </span>
                  </div>
                ))
              )}
              {totalParts.length > 0 && (
                <div className="grid grid-cols-[1fr_120px] px-4 py-2 bg-blue-100 border-t border-blue-200 text-sm font-bold text-blue-900">
                  <span>Total</span>
                  <span className="text-right">{totalLabel}</span>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Periode */}
          <section>
            <SectionHeading>Periode Cuti</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 border border-gray-200 rounded-md p-4">
              <Field label="Tanggal &amp; Jam Mulai"   value={formatDateTimeIndonesian(data.startDate, data.startTime)} />
              <Field label="Tanggal &amp; Jam Selesai" value={formatDateTimeIndonesian(data.endDate, data.endTime)} />
              <Field label="Pejabat Pengganti"          value={data.substitutePerson} />
              {data.notes && <div className="col-span-2 sm:col-span-3"><Field label="Catatan" value={data.notes} /></div>}
            </div>
          </section>

          {/* Section 4: Approval & Signatures — 4 columns side-by-side */}
          <section>
            <SectionHeading>Approval / Persetujuan</SectionHeading>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {/* Header bar */}
              <div className="bg-blue-700 text-white text-xs font-bold text-center py-2 tracking-wide uppercase">
                Approval / Persetujuan
              </div>

              {/* 4 columns */}
              <div className="grid grid-cols-4 divide-x divide-gray-200">
                {[
                  {
                    role: 'Dibuat Oleh',
                    sub: 'Karyawan',
                    name: data.employeeName,
                    date: data.submissionDate,
                    sig: data.employeeSignature,
                  },
                  {
                    role: 'Diketahui Oleh',
                    sub: 'Atasan Langsung',
                    name: data.immediateSupervision?.name,
                    date: data.immediateSupervision?.date,
                    sig: data.immediateSupervision?.signatureData,
                  },
                  {
                    role: 'Disetujui Oleh',
                    sub: 'Manager / GM / Direksi',
                    name: data.managerApproval?.name,
                    date: data.managerApproval?.date,
                    sig: data.managerApproval?.signatureData,
                  },
                  {
                    role: 'Diterima Oleh',
                    sub: 'HC Dept.',
                    name: data.hcDepartment?.name,
                    date: data.hcDepartment?.date,
                    sig: data.hcDepartment?.signatureData,
                  },
                ].map((col, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center px-3 pt-3 pb-4 min-h-[140px] ${
                      i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {/* Role label */}
                    <p className="text-[11px] font-bold text-blue-900 text-center">{col.role}</p>
                    <p className="text-[10px] text-gray-500 text-center mb-2">{col.sub}</p>

                    {/* Signature area — fixed height */}
                    <div className="flex-1 flex items-center justify-center w-full" style={{ minHeight: 64 }}>
                      {col.sig && col.sig.length > 100 ? (
                        <img
                          src={col.sig}
                          alt={`TTD ${col.sub}`}
                          className="max-h-14 max-w-full object-contain"
                        />
                      ) : (
                        <div className="w-full border-b border-dashed border-gray-300 mt-6" />
                      )}
                    </div>

                    {/* Name and date below signature */}
                    <div className="mt-3 w-full border-t border-gray-300 pt-2 text-center">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {col.name || '................................'}
                      </p>
                      {col.date && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {formatDateIndonesian(col.date)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-[#00479f] text-blue-200 text-xs px-8 py-2 flex justify-between items-center">
          <span>@2026 Digital Leave Form - Y.F - HCGA Departemen</span>
          <span>Digenerate: {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
        </div>
      </div>
    </div>
  );
}
