/**
 * url-utils.ts
 * Encode / decode LeaveFormData ke URL hash (Base64).
 *
 * Format:
 *   /leave-form#data=<base64url>
 *
 * Mode:
 *   - 'employee'  → semua data karyawan + TTD karyawan. Approver belum isi.
 *   - 'approver'  → employee data sudah ada, approver mulai tambah TTD berjenjang.
 *
 * Alur:
 *   Karyawan isi form → Generate Link (mode employee)
 *   Atasan buka link  → lihat data → tambah TTD → Generate Link baru (mode approver)
 *   → Export PDF dengan semua TTD
 */

import { LeaveFormData } from './form-types';

export type LinkMode = 'employee' | 'approver';

export interface EncodedPayload {
  v: number;           // schema version
  mode: LinkMode;
  data: LeaveFormData;
}

// Signature data (base64 image) bisa sangat panjang.
// Kita potong / restore dengan key terpisah agar lebih jelas.
const VERSION = 1;

/**
 * Encode data menjadi hash string yang aman untuk URL.
 */
export function encodeFormData(data: LeaveFormData, mode: LinkMode): string {
  const payload: EncodedPayload = { v: VERSION, mode, data };
  const json = JSON.stringify(payload);
  // btoa hanya terima latin1 — gunakan encodeURIComponent terlebih dahulu
  const base64 = btoa(unescape(encodeURIComponent(json)));
  // Buat URL-safe (ganti +/= dengan karakter yang aman)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decode hash string kembali ke EncodedPayload.
 * Return null jika gagal.
 */
export function decodeFormData(hash: string): EncodedPayload | null {
  try {
    // Pulihkan padding & karakter base64 standar
    let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);

    const json = decodeURIComponent(escape(atob(base64)));
    const payload = JSON.parse(json) as EncodedPayload;

    if (!payload.v || !payload.mode || !payload.data) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Build full URL dengan data ter-encode di hash.
 * Jika di server-side (no window), kembalikan path saja.
 */
export function buildShareUrl(data: LeaveFormData, mode: LinkMode): string {
  const encoded = encodeFormData(data, mode);
  if (typeof window === 'undefined') {
    return `/leave-form#data=${encoded}`;
  }
  const origin = window.location.origin;
  return `${origin}/leave-form#data=${encoded}`;
}

/**
 * Baca hash dari URL saat ini dan decode.
 * Return null jika tidak ada atau invalid.
 */
export function readPayloadFromUrl(): EncodedPayload | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash; // "#data=xxxx"
  if (!hash.startsWith('#data=')) return null;
  const encoded = hash.slice('#data='.length);
  if (!encoded) return null;
  return decodeFormData(encoded);
}

/**
 * Estimasi panjang URL hasil encode (karakter).
 * Browser modern support URL hingga ~2MB, tapi beberapa tool share dibatasi ~2000 char.
 * Fungsi ini membantu memberi peringatan jika terlalu panjang.
 */
export function estimateUrlLength(data: LeaveFormData, mode: LinkMode): number {
  const encoded = encodeFormData(data, mode);
  return (typeof window !== 'undefined' ? window.location.origin.length : 30)
    + '/leave-form#data='.length
    + encoded.length;
}
