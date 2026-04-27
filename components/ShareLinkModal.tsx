'use client';

import { useState, useEffect } from 'react';
import { LeaveFormData } from '@/lib/form-types';
import { buildShareUrl, estimateUrlLength, LinkMode } from '@/lib/url-utils';

interface ShareLinkModalProps {
  data: LeaveFormData;
  mode: LinkMode;
  onClose: () => void;
}

export function ShareLinkModal({ data, mode, onClose }: ShareLinkModalProps) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [urlLength, setUrlLength] = useState(0);

  useEffect(() => {
    const generated = buildShareUrl(data, mode);
    setUrl(generated);
    setUrlLength(estimateUrlLength(data, mode));
  }, [data, mode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback untuk browser yang tidak support clipboard API
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isLong = urlLength > 8000;
  const isMedium = urlLength > 4000 && !isLong;

  const modeLabel = mode === 'employee'
    ? 'Link untuk Atasan (Approval)'
    : 'Link Final (Semua TTD)';

  const modeDescription = mode === 'employee'
    ? 'Kirimkan link ini ke atasan langsung Anda. Atasan dapat membuka link, melihat data, dan menambahkan tanda tangan persetujuan.'
    : 'Link ini berisi semua tanda tangan. Atasan berikutnya dapat membuka dan menambahkan TTD, atau langsung export ke PDF.';

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#00479f] text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">{modeLabel}</h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {mode === 'employee' ? 'Langkah: Isi Form → TTD → Generate Link' : 'Langkah: TTD Approver → Generate Link → Export PDF'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white transition-colors text-xl leading-none font-light"
              aria-label="Tutup"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{modeDescription}</p>

          {/* URL Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Link Dokumen
            </label>
            <div className="flex items-stretch gap-2">
              <textarea
                readOnly
                value={url}
                rows={3}
                className="flex-1 text-xs font-mono bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCopy}
                className={`px-4 rounded-md text-sm font-semibold transition-all border ${
                  copied
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-blue-700 text-white border-blue-700 hover:bg-blue-800'
                }`}
              >
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
            </div>

            {/* URL length indicator */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isLong ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (urlLength / 10000) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] font-medium ${
                isLong ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-green-700'
              }`}>
                {(urlLength / 1000).toFixed(1)}KB
              </span>
            </div>

            {isLong && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <p className="text-xs text-red-700">
                  Link sangat panjang karena data tanda tangan berukuran besar. Beberapa platform pesan (WhatsApp Web, email) mungkin memotong link. Disarankan menggunakan WhatsApp mobile atau layanan URL shortener.
                </p>
              </div>
            )}

            {isMedium && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <p className="text-xs text-amber-700">
                  Link cukup panjang. Pastikan link tidak terpotong saat dikirim.
                </p>
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Cara Menggunakan</p>
            {mode === 'employee' ? (
              <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
                <li>Salin link di atas</li>
                <li>Kirim ke atasan langsung via WhatsApp / Email</li>
                <li>Atasan buka link — data form sudah terisi otomatis</li>
                <li>Atasan menambahkan nama, tanggal, dan tanda tangan</li>
                <li>Atasan generate link baru atau langsung export PDF</li>
              </ol>
            ) : (
              <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside">
                <li>Salin link di atas</li>
                <li>Kirim ke approver berikutnya jika masih diperlukan</li>
                <li>Atau buka link dan klik &ldquo;Export PDF&rdquo; untuk unduh dokumen final</li>
              </ol>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
