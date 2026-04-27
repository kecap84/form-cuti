'use client';

import Link from 'next/link';
import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-16">
          {/* Top Logos */}
          <div className="flex justify-between items-start mb-12">
            {/* Left Logo - GUNUNGMAS */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_GSM-GJo4iDE19wgWfUDLw8pUc4I35Z1kFg.png"
              alt="GUNUNGMAS Logo"
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
            />

            {/* Right Logo - SSS */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/SSS_LOGO_500px-24JjgKrgOkXTVM7FTWhotP8kkM4UkV.png"
              alt="SSS Logo"
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
            />
          </div>

          {/* Center Section */}
          <div className="flex flex-col items-center mb-12">
            {/* Center Badge - HCGA Logo */}
            <div className="mb-8">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HCGA_Logo_500px-mU67w8U1AD9e3UzkScPxblS9d8imtZ.png"
                alt="HCGA Logo"
                className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-lg"
              />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6">
              Pengajuan Cuti
            </h1>

            {/* Divider with dot */}
            <div className="flex items-center justify-center gap-3 mb-6 w-full">
              <div className="flex-grow h-0.5 bg-amber-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <div className="flex-grow h-0.5 bg-amber-500"></div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 text-center text-base md:text-lg max-w-md leading-relaxed">
              Ajukan permohonan cuti Anda dengan mudah secara digital dan cepat.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-12">
            <Link
              href="/leave-form"
              onClick={handleClick}
              prefetch={true}
              className={`flex items-center justify-center gap-3 bg-amber-600 text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg text-base md:text-lg w-full md:w-auto group active:scale-95 ${
                isLoading
                  ? 'bg-amber-700 scale-100'
                  : 'hover:bg-amber-700 hover:shadow-xl active:shadow-md'
              }`}
              style={{
                willChange: 'transform, background-color',
              }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              ) : (
                <FileText className="w-5 h-5 md:w-6 md:h-6" />
              )}
              <span>{isLoading ? 'Membuka Formulir...' : 'Klik Mulai buat pengajuan Cuti'}</span>
              {!isLoading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
            </Link>
          </div>

          {/* Bottom Divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex-grow h-0.5 bg-amber-200"></div>
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm whitespace-nowrap">
              <span>⚙️</span>
              <span>HCGA Department</span>
            </div>
            <div className="flex-grow h-0.5 bg-amber-200"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
