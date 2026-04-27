'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LeaveForm } from '@/components/LeaveForm';
import { ApproverView } from '@/components/ApproverView';
import { LeaveFormData } from '@/lib/form-types';

interface RequestPayload {
  id: string;
  status: string;
  formData: LeaveFormData;
}

// --- Inner component yang boleh pakai useSearchParams ---
function LeaveFormContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<RequestPayload | null>(null);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/leave-requests/${requestId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Gagal memuat data');
        }
        return res.json() as Promise<RequestPayload>;
      })
      .then((data) => setPayload(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [requestId]);

  // ── Mode Approver: ada ?id= di URL ──────────────────────────────────────
  if (requestId) {
    if (loading) {
      return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-sm">Memuat data pengajuan...</p>
          </div>
        </main>
      );
    }

    if (error || !payload) {
      return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Tidak Valid</h2>
            <p className="text-sm text-gray-500 mb-6">
              {error ?? 'Data pengajuan tidak ditemukan. Pastikan link sudah benar.'}
            </p>
            <a
              href="/"
              className="inline-block px-5 py-2 bg-blue-600 text-white text-sm rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Kembali ke Beranda
            </a>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-gray-100">
        <ApproverView
          requestId={payload.id}
          status={payload.status}
          data={payload.formData}
        />
      </main>
    );
  }

  // ── Mode Karyawan: form baru ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
          >
            {'← Kembali'}
          </a>
          <span className="text-sm text-gray-500">Digital Leave Form System</span>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          <LeaveForm />
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>@2026 Digital Leave Form - Y.F - HCGA Departemen</p>
        </div>
      </div>
    </main>
  );
}

// --- Loading skeleton saat Suspense menunggu ---
function LeaveFormSkeleton() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Memuat halaman...</p>
      </div>
    </main>
  );
}

// --- Default export wajib membungkus dengan Suspense agar useSearchParams bekerja ---
export default function LeaveFormPage() {
  return (
    <Suspense fallback={<LeaveFormSkeleton />}>
      <LeaveFormContent />
    </Suspense>
  );
}
