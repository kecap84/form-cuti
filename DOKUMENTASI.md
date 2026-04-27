# Digital Form Permohonan Cuti/Ijin

Aplikasi web untuk membuat, mengisi, dan mengexport form permohonan cuti/ijin ke PDF dengan digital signature.

## 📁 Struktur Folder

```
app/
├── page.tsx                    # Landing page homepage
├── leave-form/
│   └── page.tsx               # Form page utama
└── layout.tsx                 # Root layout

components/
├── LeaveForm.tsx              # Form container utama dengan validasi
├── EmployeeInfoSection.tsx    # Section 1: Data karyawan
├── LeaveTypeSection.tsx       # Section 2: Pilihan jenis cuti
├── DatePeriodSection.tsx      # Section 3: Tanggal & durasi
├── ApprovalSection.tsx        # Section 4: Approval & signatures
├── SignaturePad.tsx           # Canvas untuk tanda tangan digital
└── FormPDFPreview.tsx         # Preview & export PDF

lib/
├── form-types.ts              # Type definitions
├── form-validation.ts         # Validasi form dengan Zod
├── date-utils.ts              # Utility fungsi untuk date
└── pdf-utils.ts               # Utility untuk PDF export
```

## 🎯 Features

- ✅ Form input lengkap dengan validasi real-time
- ✅ Digital signature pad (canvas-based)
- ✅ Auto-calculate hari kerja (exclude weekend)
- ✅ Preview PDF sebelum download
- ✅ Export ke PDF berkualitas tinggi
- ✅ Responsive design (mobile, tablet, desktop)

## 🔧 Teknologi

- **Framework**: Next.js 16 (React 19)
- **Form**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS
- **PDF**: jsPDF + html2canvas
- **Date**: date-fns dengan locale Indonesia
- **Icons**: Lucide React

## 🚀 User Flow

1. **Homepage** (`/`)
   - Landing page dengan informasi aplikasi
   - Tombol untuk mulai membuat permohonan

2. **Form Page** (`/leave-form`)
   - Section 1: Isi data karyawan
   - Section 2: Pilih jenis cuti/ijin
   - Section 3: Tentukan periode & durasi (auto-calculate)
   - Section 4: Tambah signature digital (3 approver)
   - Validasi real-time
   - Tombol: Reset atau Lanjutkan ke Preview

3. **Preview & Export**
   - Lihat preview PDF
   - Download PDF (filename: CUTI-[NIK]-[TANGGAL].pdf)
   - Opsi kembali edit

## 📝 Jenis Cuti/Ijin (10 Opsi)

1. Cuti Tahunan
2. Cuti Melahirkan
3. Ijin Tidak Dibayar
4. Ijin Emergency (Kematian)
5. Ijin Emergency (Melahirkan/Keguguran)
6. Ijin Pernikahan
7. Ijin Menikahkan Anak
8. Ijin Mengkhitankan Anak
9. Ijin Membaptiskan Anak
10. Perjalanan Khusus

## 📋 Data Form

### Employee Info
- Nama, NIK KTP, Nomor Induk Karyawan
- Jabatan, Departemen, Status POH
- Tanggal Diterima Kerja, Lokasi Penempatan
- Alamat Cuti, No. WhatsApp, No. Emergency

### Leave Details
- Jenis Cuti/Ijin
- Tanggal Mulai - Tanggal Selesai (auto-calculate total hari)
- Pejabat Pengganti
- Catatan

### Approvals (3-level)
- Atasan Langsung (Mengetahui)
- Manager/GM/Direksi (Menyetujui)
- HC Department (Penerima)

Setiap approver: Nama + Tanggal + Digital Signature

## 🎨 Design

- **Color Scheme**: Blue (primary), Gray (neutral), Green (accent)
- **Typography**: 2 fonts (sans-serif)
- **Layout**: Responsive Flexbox/Grid
- **Spacing**: Tailwind scale (4px units)

## ✅ Validasi

- NIK: 16 digit numeric only
- Tanggal Mulai < Tanggal Selesai
- Minimal 1 hari cuti
- Semua field required kecuali notes & emergency phone
- Signature: minimal ada 1px tanda tangan

## 📥 Export PDF

- Format: A4 Portrait
- Quality: 2x scale (high resolution)
- Filename: `CUTI-[NIK]-[DD-MM-YYYY].pdf`
- Include: Semua data + signatures + metadata

## 🔐 Notes

- Aplikasi ini adalah **client-side only** (no backend/database)
- Data hanya disimpan di memory selama session
- PDF di-generate dengan html2canvas untuk capture form
- Signature disimpan sebagai base64 canvas image
