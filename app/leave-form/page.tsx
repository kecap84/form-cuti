import { LeaveForm } from '@/components/LeaveForm';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Form Permohonan Cuti/Ijin - Digital Form',
  description: 'Isi form permohonan cuti/ijin dan export ke PDF',
};

function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
}

export default function LeaveFormPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← Kembali
          </Link>
          <span className="text-sm text-gray-600">Digital Leave Form System</span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <Suspense fallback={<FormSkeleton />}>
            <LeaveForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>@2026 Digital Leave Form - Y.F - HCGA Departemen</p>
        </div>
      </div>
    </main>
  );
}
