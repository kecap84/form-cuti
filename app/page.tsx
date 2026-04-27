import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Hero Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Permohonan Cuti / Ijin
            </h1>
            <p className="text-gray-600 text-lg">
              Aplikasi digital untuk mengajukan dan export form permohonan cuti/ijin ke PDF
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-gray-900">Form Lengkap</h3>
              <p className="text-sm text-gray-600 mt-1">Semua data karyawan & jenis cuti</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">✍️</div>
              <h3 className="font-semibold text-gray-900">Tanda Tangan Digital</h3>
              <p className="text-sm text-gray-600 mt-1">Signature pad untuk approval</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📥</div>
              <h3 className="font-semibold text-gray-900">Export PDF</h3>
              <p className="text-sm text-gray-600 mt-1">Download instant ke PDF</p>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/leave-form"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Mulai Buat Permohonan
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Footer Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-sm text-gray-600">
            <p>Berlaku mulai: 01/11/2024 (Rev. 0)</p>
            <p className="mt-2">
              Aplikasi ini membantu Anda mengisi form permohonan cuti/ijin secara digital
              dan mengexport hasilnya ke file PDF yang siap untuk diserahkan.
            </p>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-8 text-center text-white text-sm">
          <p>Digital Leave Form System • Powered by Next.js</p>
        </div>
      </div>
    </main>
  );
}
