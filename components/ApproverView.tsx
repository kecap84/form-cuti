'use client';

import { useState } from 'react';
import { LeaveFormData, LEAVE_TYPES, LeaveType } from '@/lib/form-types';
import { formatDateIndonesian, formatDateTimeIndonesian } from '@/lib/date-utils';
import { exportFormToPDF } from '@/lib/pdf-utils';
import { SignaturePad } from './SignaturePad';
import { getTodayISO } from '@/lib/date-utils';

interface ApproverViewProps {
  requestId: string;
  status: string;
  data: LeaveFormData;
}

type ApproverLevel = 'supervisor' | 'manager' | 'hc';

const LEVEL_META: Record<
  ApproverLevel,
  { label: string; sub: string; dataKey: keyof LeaveFormData }
> = {
  supervisor: {
    label: 'Diketahui Oleh',
    sub: 'Atasan Langsung',
    dataKey: 'immediateSupervision',
  },
  manager: {
    label: 'Disetujui Oleh',
    sub: 'Manager / GM / Direksi',
    dataKey: 'managerApproval',
  },
  hc: {
    label: 'Diterima Oleh',
    sub: 'HC Department',
    dataKey: 'hcDepartment',
  },
};

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5 font-medium">{value || '—'}</p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 rounded bg-[#00479f]" />
      <h3 className="text-xs font-bold text-[#00479f] uppercase tracking-wider">{children}</h3>
    </div>
  );
}

/** Tentukan level approver yang saat ini aktif dari status DB */
function activeLevel(status: string): ApproverLevel | null {
  if (status === 'pending_supervisor') return 'supervisor';
  if (status === 'pending_manager')    return 'manager';
  if (status === 'pending_hc')         return 'hc';
  return null; // 'approved' — semua selesai
}

export function ApproverView({ requestId, status: initialStatus, data: initialData }: ApproverViewProps) {
  const [formData, setFormData] = useState<LeaveFormData>(initialData);
  const [status, setStatus]     = useState(initialStatus);

  // Form state untuk approver yang sedang aktif
  const [approverName, setApproverName] = useState('');
  const [approverDate, setApproverDate] = useState(getTodayISO());
  const [approverSig,  setApproverSig]  = useState('');
  const [isSaving,     setIsSaving]     = useState(false);
  const [saveError,    setSaveError]    = useState<string | null>(null);
  const [isExporting,  setIsExporting]  = useState(false);
  const [exportError,  setExportError]  = useState<string | null>(null);
  const [copyDone,     setCopyDone]     = useState(false);

  const current = activeLevel(status);
  const isFullyApproved = status === 'approved';

  const totalParts: string[] = [];
  if (formData.totalDays  > 0) totalParts.push(`${formData.totalDays} hari`);
  if (formData.totalHours > 0) totalParts.push(`${formData.totalHours} jam`);

  /** Simpan TTD approver via PATCH, lalu update state lokal */
  const handleSaveApproval = async () => {
    if (!current) return;
    if (!approverName.trim()) { setSaveError('Nama pejabat harus diisi.'); return; }
    if (!approverSig || approverSig.length < 100) { setSaveError('Tanda tangan harus dilengkapi.'); return; }

    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/leave-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: current,
          approval: { name: approverName, date: approverDate, signatureData: approverSig },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Gagal menyimpan');
      }
      const { status: newStatus } = await res.json();
      setStatus(newStatus);

      // Perbarui formData lokal agar preview TTD muncul
      const approval = { name: approverName, date: approverDate, signatureData: approverSig };
      setFormData(prev => ({
        ...prev,
        ...(current === 'supervisor' && { immediateSupervision: approval }),
        ...(current === 'manager'    && { managerApproval: approval }),
        ...(current === 'hc'         && { hcDepartment: approval }),
      }));

      // Reset form input untuk slot berikutnya
      setApproverName('');
      setApproverDate(getTodayISO());
      setApproverSig('');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  /** Salin link approval untuk diteruskan ke approver berikutnya */
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/leave-form?id=${requestId}`;
    await navigator.clipboard.writeText(url);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2500);
  };

  const handleExportPDF = async () => {
    setExportError(null);
    setIsExporting(true);
    try {
      await exportFormToPDF(formData);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Gagal export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-5">

      {/* Banner */}
      <div className="bg-[#00479f] text-white rounded-xl px-6 py-4">
        <h1 className="text-lg font-bold">Permohonan Cuti — Form Approval</h1>
        <p className="text-xs text-blue-200 mt-1">
          ID Pengajuan: <span className="font-mono font-semibold">{requestId}</span>
          {' · '}
          Status:{' '}
          <span className="font-semibold capitalize">
            {isFullyApproved
              ? 'Disetujui Semua'
              : `Menunggu ${LEVEL_META[current!]?.sub ?? ''}`}
          </span>
        </p>
      </div>

      {/* Data Karyawan */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <SectionHeading>Data Karyawan</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <ReadField label="Nama Lengkap"      value={formData.employeeName} />
          <ReadField label="NIK"               value={formData.employeeNumber} />
          <ReadField label="Jabatan"           value={formData.position} />
          <ReadField label="Departemen"        value={formData.department} />
          <ReadField label="Status"            value={formData.employmentStatus} />
          <ReadField label="Entitas"           value={formData.entity} />
          <ReadField label="Lokasi Penempatan" value={formData.placementLocation} />
          <ReadField label="No. WhatsApp"      value={formData.whatsappPhone} />
          <ReadField label="No. Emergency"     value={formData.emergencyPhone} />
          {formData.leaveAddress && (
            <div className="col-span-2 sm:col-span-3">
              <ReadField label="Alamat Selama Cuti" value={formData.leaveAddress} />
            </div>
          )}
        </div>
      </div>

      {/* Jenis Cuti */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <SectionHeading>Jenis Cuti / Ijin</SectionHeading>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_110px] text-xs font-bold text-[#00479f] bg-blue-50 px-4 py-2 border-b border-gray-200">
            <span>Jenis</span>
            <span className="text-right">Durasi</span>
          </div>
          {(formData.leaveEntries || []).map((entry, i) => (
            <div key={i} className={`grid grid-cols-[1fr_110px] px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <span className="text-gray-800">{i + 1}. {LEAVE_TYPES[entry.type as LeaveType] || entry.type}</span>
              <span className="text-right font-semibold text-gray-900">
                {entry.durationValue} {entry.durationUnit === 'days' ? 'hari' : 'jam'}
              </span>
            </div>
          ))}
          {totalParts.length > 0 && (
            <div className="grid grid-cols-[1fr_110px] px-4 py-2 bg-blue-700 text-sm font-bold text-white">
              <span>Total</span>
              <span className="text-right">{totalParts.join(' + ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Periode */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <SectionHeading>Periode Cuti</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <ReadField label="Tanggal Mulai"   value={formatDateTimeIndonesian(formData.startDate, formData.startTime)} />
          <ReadField label="Tanggal Selesai" value={formatDateTimeIndonesian(formData.endDate, formData.endTime)} />
          <ReadField label="Tgl. Pengajuan"  value={formatDateIndonesian(formData.submissionDate)} />
          {formData.substitutePerson && <ReadField label="Pejabat Pengganti" value={formData.substitutePerson} />}
          {formData.notes && (
            <div className="col-span-2 sm:col-span-3">
              <ReadField label="Catatan" value={formData.notes} />
            </div>
          )}
        </div>
      </div>

      {/* TTD Karyawan */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <SectionHeading>Tanda Tangan Karyawan</SectionHeading>
        {formData.employeeSignature && formData.employeeSignature.length > 100 ? (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 inline-block">
            <img
              src={formData.employeeSignature}
              alt="Tanda tangan karyawan"
              className="max-h-20 max-w-full object-contain"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Tanda tangan tidak tersedia.</p>
        )}
      </div>

      {/* Riwayat Approval yang sudah terisi */}
      {(['supervisor', 'manager', 'hc'] as ApproverLevel[]).map((level) => {
        const meta = LEVEL_META[level];
        const approval = formData[meta.dataKey] as { name?: string; date?: string; signatureData?: string } | undefined;
        if (!approval?.name || !approval?.signatureData) return null;
        return (
          <div key={level} className="bg-white border border-green-200 rounded-xl p-5">
            <SectionHeading>{meta.label} — {meta.sub}</SectionHeading>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="border border-green-200 rounded-lg p-2 bg-green-50">
                <img
                  src={approval.signatureData}
                  alt={`TTD ${meta.sub}`}
                  className="max-h-16 max-w-[140px] object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{approval.name}</p>
                <p className="text-xs text-gray-500">{formatDateIndonesian(approval.date ?? '')}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-700 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  Sudah Ditandatangani
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Form Approval Aktif */}
      {!isFullyApproved && current && (
        <div className="bg-white border-2 border-blue-400 rounded-xl p-5 shadow-md">
          <SectionHeading>{LEVEL_META[current].label} — {LEVEL_META[current].sub}</SectionHeading>
          <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-4">
            Silakan isi nama dan tanda tangan Anda untuk menyetujui pengajuan ini.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Pejabat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={e => setApproverName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={approverDate}
                  onChange={e => setApproverDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Tanda Tangan <span className="text-red-500">*</span>
              </label>
              <SignaturePad
                value={approverSig}
                onChange={setApproverSig}
                height={130}
              />
            </div>

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveApproval}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#00479f] text-white text-sm font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan & Setujui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel setelah salah satu / semua approval selesai */}
      {(status !== 'pending_supervisor') && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">
            {isFullyApproved ? 'Semua Approval Selesai' : 'Tindakan Selanjutnya'}
          </h3>

          {!isFullyApproved && (
            <p className="text-xs text-gray-500">
              Kirimkan link berikut ke approver selanjutnya ({LEVEL_META[current!]?.sub}).
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {/* Tombol copy link — selalu tersedia hingga approved */}
            {!isFullyApproved && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#00479f] text-[#00479f] text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                {copyDone ? (
                  <>
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-700">Link Disalin!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Salin Link Approval
                  </>
                )}
              </button>
            )}

            {/* Export PDF */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-5 py-2.5 bg-[#00479f] text-white text-sm font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors"
            >
              {isExporting ? 'Mengekspor...' : 'Export PDF'}
            </button>
          </div>

          {exportError && (
            <p className="text-sm text-red-600">{exportError}</p>
          )}

          {isFullyApproved && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-medium">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pengajuan telah disetujui oleh semua pihak. Silakan export PDF untuk arsip.
            </div>
          )}
        </div>
      )}

    </div>
  );
}
