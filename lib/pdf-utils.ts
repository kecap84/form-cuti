import jsPDF from 'jspdf';
import { LeaveFormData, LEAVE_TYPES, LeaveType } from './form-types';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatDateIndonesian, formatDateTimeIndonesian } from './date-utils';

// ─── Page geometry ─────────────────────────────────────────────────────────
const PAGE_MARGIN  = 14;    // mm left/right
const ROW_H        = 8;     // fixed row height — taller for breathing room
const SECTION_H    = 7;     // section header bar height

// ─── Font sizes ────────────────────────────────────────────────────────────
const FS_LABEL    = 7.5;
const FS_VALUE    = 8;
const FS_SECTION  = 8.5;

// ─── Colors ────────────────────────────────────────────────────────────────
const C_BLUE_DARK   : [number,number,number] = [0,   71,  160];
const C_BLUE_MID    : [number,number,number] = [30,  100, 200];
const C_BLUE_LIGHT  : [number,number,number] = [219, 234, 254];
const C_BLUE_TEXT   : [number,number,number] = [15,  63,  135];
const C_BLUE_PALE   : [number,number,number] = [240, 245, 255];
const C_BLACK       : [number,number,number] = [20,  20,  20];
const C_GRAY        : [number,number,number] = [100, 100, 100];
const C_BORDER      : [number,number,number] = [180, 180, 180];
const C_WHITE       : [number,number,number] = [255, 255, 255];
const C_ROW_ALT     : [number,number,number] = [248, 250, 255];
const C_TOTAL_BG    : [number,number,number] = [0,   95,  200]; // TOTAL DURASI highlight

export async function exportFormToPDF(data: LeaveFormData): Promise<void> {
  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PW = pdf.internal.pageSize.getWidth();   // 210 mm
    const PH = pdf.internal.pageSize.getHeight();  // 297 mm
    const ML = PAGE_MARGIN;
    const MR = PAGE_MARGIN;
    const CW = PW - ML - MR;                       // ~182 mm usable width
    let y = 0;

    // ── helpers ──────────────────────────────────────────────────────────
    const setFont = (weight: 'normal'|'bold', size: number, color: [number,number,number]) => {
      pdf.setFont('helvetica', weight);
      pdf.setFontSize(size);
      pdf.setTextColor(...color);
    };

    const text = (
      str: string,
      x: number,
      ty: number,
      weight: 'normal'|'bold' = 'normal',
      size = FS_VALUE,
      color: [number,number,number] = C_BLACK,
      align: 'left'|'center'|'right' = 'left',
    ) => {
      setFont(weight, size, color);
      pdf.text(str || '', x, ty, { align });
    };

    const hLine = (lx: number, ty: number, w: number, color: [number,number,number] = C_BORDER, lw = 0.15) => {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(lw);
      pdf.line(lx, ty, lx + w, ty);
    };

    const vLine = (lx: number, ty: number, h: number, color: [number,number,number] = C_BORDER, lw = 0.15) => {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(lw);
      pdf.line(lx, ty, lx, ty + h);
    };

    const rect = (
      lx: number, ty: number, w: number, h: number,
      fill: [number,number,number]|null,
      stroke: [number,number,number]|null,
      lw = 0.2,
    ) => {
      pdf.setLineWidth(lw);
      if (fill)   pdf.setFillColor(...fill);
      if (stroke) pdf.setDrawColor(...stroke);
      const mode = fill && stroke ? 'FD' : fill ? 'F' : 'D';
      pdf.rect(lx, ty, w, h, mode);
    };

    // Section header bar with left accent stripe
    const sectionBar = (title: string, ty: number): number => {
      rect(ML, ty, CW, SECTION_H, C_BLUE_LIGHT, C_BLUE_MID, 0.25);
      rect(ML, ty, 3, SECTION_H, C_BLUE_MID, null);
      text(title, ML + 7, ty + SECTION_H - 1.5, 'bold', FS_SECTION, C_BLUE_DARK);
      return ty + SECTION_H + 3; // +3 inner gap after bar before first row
    };

    // LABEL_W: fixed label column width within a half-cell
    const LABEL_W = 34;

    // Two-column field row (each half = CW/2)
    const fieldRow = (
      label1: string, value1: string,
      label2: string, value2: string,
      ty: number,
      altBg = false,
    ): number => {
      const half = CW / 2;
      if (altBg) rect(ML, ty, CW, ROW_H, C_ROW_ALT, null);
      hLine(ML, ty, CW);
      hLine(ML, ty + ROW_H, CW);
      vLine(ML + half, ty, ROW_H);

      const midY = ty + ROW_H / 2 + 1.4; // vertically centered text
      text(label1, ML + 2,           midY, 'bold',   FS_LABEL, C_BLUE_TEXT);
      text(value1 || '—', ML + LABEL_W,   midY, 'normal', FS_VALUE, C_BLACK);

      if (label2) {
        text(label2, ML + half + 2,              midY, 'bold',   FS_LABEL, C_BLUE_TEXT);
        text(value2 || '—', ML + half + LABEL_W, midY, 'normal', FS_VALUE, C_BLACK);
      }
      return ty + ROW_H;
    };

    // Full-width field row — value wraps if too long
    const fieldRowFull = (label: string, value: string, ty: number, altBg = false, extraH = 0): number => {
      const h = ROW_H + extraH;
      if (altBg) rect(ML, ty, CW, h, C_ROW_ALT, null);
      hLine(ML, ty, CW);
      hLine(ML, ty + h, CW);
      const midY = ty + ROW_H / 2 + 1.4;
      text(label, ML + 2, midY, 'bold', FS_LABEL, C_BLUE_TEXT);
      // wrap long values
      setFont('normal', FS_VALUE, C_BLACK);
      const maxW = CW - LABEL_W - 4;
      const lines = pdf.splitTextToSize(value || '—', maxW);
      pdf.text(lines, ML + LABEL_W, midY);
      return ty + h;
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════
    const HEADER_H = 34;
    rect(0, 0, PW, HEADER_H, C_BLUE_DARK, null);

    // Line 1: Document title
    text('PERMOHONAN CUTI / IZIN KARYAWAN', PW / 2, 10, 'bold', 15, C_WHITE, 'center');
    // Line 2: Sub-title (split across two sub-lines)
    text('Formulir Permohonan Cuti dan Izin Karyawan', PW / 2, 16, 'normal', 7, [190, 210, 255] as [number,number,number], 'center');
    text('HCGA-Form Cuti  |  Berlaku 01 Mei 2026 (Rev.0)', PW / 2, 20.5, 'normal', 6.5, [160, 195, 255] as [number,number,number], 'center');

    // Entitas — prominent identity box
    const entityVal = (data.entity || '—').toUpperCase();
    setFont('normal', 6.5, [160, 195, 255] as [number,number,number]);
    text('ENTITAS PERUSAHAAN', PW / 2, 26, 'normal', 6.5, [160, 195, 255] as [number,number,number], 'center');
    // Box around entity name
    setFont('bold', 14, C_WHITE);
    const entityW = pdf.getTextWidth(entityVal) + 14;
    const entityBoxX = PW / 2 - entityW / 2;
    // subtle rounded-ish box (jsPDF does not support border-radius, draw rect)
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.4);
    pdf.rect(entityBoxX, 28, entityW, 7, 'D');
    text(entityVal, PW / 2, 33.5, 'bold', 14, C_WHITE, 'center');

    // Meta strip below header
    const META_Y = HEADER_H + 0.5;
    rect(ML, META_Y, CW, 6.5, C_BLUE_PALE, C_BLUE_MID, 0.2);
    text('Tgl. Pengajuan :', ML + 2,           META_Y + 4.3, 'bold',   FS_LABEL, C_BLUE_TEXT);
    text(formatDateIndonesian(data.submissionDate) || '—', ML + 32, META_Y + 4.3, 'normal', FS_VALUE, C_BLACK);
    text('No. Induk Karyawan :', PW / 2 + 2,  META_Y + 4.3, 'bold',   FS_LABEL, C_BLUE_TEXT);
    text(data.employeeNumber || '—', PW / 2 + 40, META_Y + 4.3, 'normal', FS_VALUE, C_BLACK);

    // ── Approval block dimensions (defined early for spacer calculation) ───
    const FOOTER_TOP   = PH - 11;   // absolute y where footer bar starts
    const GAP_APPROVAL = 5;         // gap between approval bottom and footer
    const AP_COL_W     = CW / 4;
    const AP_H         = 55;        // approval block height — tall for signature space
    const SIG_H        = 32;        // signature image height inside cell
    const AP_ROLE_H    = 12;        // role + sub-label bar at top of cell
    // sectionBar adds SECTION_H + 1.5 before returning next y
    const APPROVAL_TOTAL_H = SECTION_H + 1.5 + AP_H;
    // Pinned top-of-sectionBar for approval
    const APPROVAL_Y_PIN = FOOTER_TOP - GAP_APPROVAL - APPROVAL_TOTAL_H;

    // Content starts after meta strip with breathing room
    y = META_Y + 14;

    // outer border top anchor — sections 1–3 only
    const contentTop = y - 0.5;

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 1 — DATA KARYAWAN
    // ═══════════════════════════════════════════════════════════════════════
    y = sectionBar('DATA KARYAWAN', y);
    y = fieldRow('Nama Lengkap',   data.employeeName,             'Jabatan',           data.position || '—',                     y, false);
    y = fieldRow('Departemen',     data.department || '—',        'Status Karyawan',   capitalize(data.employmentStatus || '—'), y, true);
    y = fieldRow('Lokasi Kerja',   data.placementLocation || '—', 'No. WhatsApp',      data.whatsappPhone || '—',                y, false);
    y = fieldRow('No. Emergency',  data.emergencyPhone || '—',    'Pejabat Pengganti', data.substitutePerson || '—',             y, true);

    // Address — may wrap
    const addrVal = data.leaveAddress || '—';
    setFont('normal', FS_VALUE, C_BLACK);
    const addrSplit   = pdf.splitTextToSize(addrVal, CW - LABEL_W - 4);
    const addrExtraH  = addrSplit.length > 1 ? (addrSplit.length - 1) * (FS_VALUE * 0.352778 * 1.4) : 0;
    y = fieldRowFull('Alamat Selama Cuti', addrVal, y, false, addrExtraH);

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 2 — JENIS CUTI / IZIN
    // ═══════════════════════════════════════════════════════════════════════

    // Fixed inter-section gap for visual breathing room between sections
    const SEC_GAP = 10;
    y += SEC_GAP;

    y = sectionBar('JENIS CUTI / IZIN', y);

    const entries = data.leaveEntries || [];
    const COL_DIV = ML + CW * 0.72;
    const COL_W2  = CW - (COL_DIV - ML);

    if (entries.length === 0) {
      y = fieldRowFull('Jenis yang Dipilih', '—', y, false);
    } else {
      // Sub-header row
      rect(ML, y, CW, ROW_H, [220, 235, 255] as [number,number,number], null);
      hLine(ML, y, CW);
      hLine(ML, y + ROW_H, CW);
      vLine(COL_DIV, y, ROW_H);
      const shMid = y + ROW_H / 2 + 1.4;
      text('Jenis Cuti / Izin', ML + 3,                shMid, 'bold', FS_LABEL, C_BLUE_TEXT);
      text('Durasi',             COL_DIV + COL_W2 / 2, shMid, 'bold', FS_LABEL, C_BLUE_TEXT, 'center');
      y += ROW_H;

      entries.forEach((entry, i) => {
        const typeLabel = LEAVE_TYPES[entry.type as LeaveType] || entry.type;
        const durUnit   = entry.durationUnit === 'days' ? 'hari' : 'jam';
        const durLabel  = `${entry.durationValue} ${durUnit}`;
        const altBg     = i % 2 !== 0;

        if (altBg) rect(ML, y, CW, ROW_H, C_ROW_ALT, null);
        hLine(ML, y, CW);
        hLine(ML, y + ROW_H, CW);
        vLine(COL_DIV, y, ROW_H);

        const rowMid = y + ROW_H / 2 + 1.4;
        text(`${i + 1}.`, ML + 3,             rowMid, 'bold',   FS_VALUE, C_BLUE_TEXT);
        text(typeLabel,   ML + 9,             rowMid, 'normal', FS_VALUE, C_BLACK);
        text(durLabel, COL_DIV + COL_W2 / 2, rowMid, 'bold',   FS_VALUE, C_BLUE_DARK, 'center');
        y += ROW_H;
      });

      // TOTAL DURASI — highlighted row
      const totalParts: string[] = [];
      if (data.totalDays  > 0) totalParts.push(`${data.totalDays} hari`);
      if (data.totalHours > 0) totalParts.push(`${data.totalHours} jam`);
      const totalStr = totalParts.join(' + ') || '—';
      const TOTAL_H  = ROW_H + 2;

      rect(ML, y, CW, TOTAL_H, C_TOTAL_BG, null);
      hLine(ML, y,           CW, C_BLUE_DARK, 0.3);
      hLine(ML, y + TOTAL_H, CW, C_BLUE_DARK, 0.3);
      vLine(COL_DIV, y, TOTAL_H, C_WHITE, 0.3);
      const totMid = y + TOTAL_H / 2 + 1.6;
      text('TOTAL DURASI', ML + 9,             totMid, 'bold', 9,  C_WHITE);
      text(totalStr, COL_DIV + COL_W2 / 2,    totMid, 'bold', 10, C_WHITE, 'center');
      y += TOTAL_H;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 3 — PERIODE CUTI
    // ═══════════════════════════════════════════════════════════════════════
    y += SEC_GAP;
    y = sectionBar('PERIODE CUTI', y);

    const startDisplay = formatDateTimeIndonesian(data.startDate, data.startTime);
    const endDisplay   = formatDateTimeIndonesian(data.endDate,   data.endTime);
    y = fieldRow('Mulai', startDisplay, 'Selesai', endDisplay, y, false);

    if (data.notes && data.notes.trim()) {
      setFont('normal', FS_VALUE, C_BLACK);
      const noteLines   = pdf.splitTextToSize(data.notes.trim(), CW - LABEL_W - 4);
      const noteExtraH  = noteLines.length > 1 ? (noteLines.length - 1) * (FS_VALUE * 0.352778 * 1.4) : 0;
      y = fieldRowFull('Catatan', data.notes.trim(), y, true, noteExtraH);
    }

    // Outer border enclosing sections 1–3 only
    const contentBottom = y;
    pdf.setDrawColor(C_BLUE_MID[0], C_BLUE_MID[1], C_BLUE_MID[2]);
    pdf.setLineWidth(0.4);
    pdf.rect(ML - 0.5, contentTop, CW + 1, contentBottom - contentTop + 0.5, 'D');

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION 4 — APPROVAL / PERSETUJUAN
    // Pinned to bottom: always at APPROVAL_Y_PIN, regardless of content above.
    // If content overflows past the pin point, fall back to minSpacer below.
    // ═══════════════════════════════════════════════════════════════════════
    const approvalStartY = Math.max(contentBottom + 8, APPROVAL_Y_PIN);
    y = sectionBar('APPROVAL / PERSETUJUAN', approvalStartY);

    const approvalCols = [
      { role: 'Dibuat Oleh',    sub: 'Karyawan',               name: data.employeeName,                    date: data.submissionDate,                   sig: data.employeeSignature                  || null },
      { role: 'Diketahui Oleh', sub: 'Atasan Langsung',        name: data.immediateSupervision?.name || '', date: data.immediateSupervision?.date || '',  sig: data.immediateSupervision?.signatureData || null },
      { role: 'Disetujui Oleh', sub: 'Manager / GM / Direksi', name: data.managerApproval?.name || '',      date: data.managerApproval?.date || '',       sig: data.managerApproval?.signatureData      || null },
      { role: 'Diterima Oleh',  sub: 'HC Dept.',               name: data.hcDepartment?.name || '',         date: data.hcDepartment?.date || '',          sig: data.hcDepartment?.signatureData         || null },
    ];

    approvalCols.forEach((col, idx) => {
      const cx    = ML + idx * AP_COL_W;
      const colBg : [number,number,number] = idx % 2 === 0 ? C_WHITE : C_ROW_ALT;

      // Cell background + border
      rect(cx, y, AP_COL_W, AP_H, colBg, C_BORDER, 0.25);

      // Role label bar at top of cell
      rect(cx, y, AP_COL_W, AP_ROLE_H, idx === 0 ? C_BLUE_LIGHT : [235, 240, 252] as [number,number,number], null);
      text(col.role,       cx + AP_COL_W / 2, y + 5,    'bold',   8,   C_BLUE_DARK, 'center');
      text(`(${col.sub})`, cx + AP_COL_W / 2, y + 9.5,  'normal', 6,   C_GRAY,      'center');

      // Signature image
      const sigAreaY = y + AP_ROLE_H + 2;
      if (col.sig) {
        try {
          pdf.addImage(col.sig, 'PNG', cx + 3, sigAreaY, AP_COL_W - 6, SIG_H);
        } catch (_) { /* blank fallback */ }
      }

      // Name + date area at bottom of cell
      const nameY = y + AP_H - 13;
      hLine(cx + 4, nameY, AP_COL_W - 8, C_BORDER, 0.4);
      const displayName = col.name || '..............................';
      text(displayName, cx + AP_COL_W / 2, nameY + 4.5, 'bold',   7.5, C_BLACK, 'center');
      const dateStr = formatDateIndonesian(col.date);
      if (dateStr) {
        text(dateStr, cx + AP_COL_W / 2, nameY + 9, 'normal', 6, C_GRAY, 'center');
      }
    });

    // y after approval (not used further, but kept for completeness)
    y += AP_H;

    // ═══════════════════════════════════════════════════════════════════════
    // FOOTER — centered, always at page bottom
    // ═══════════════════════════════════════════════════════════════════════
    rect(0, PH - 11, PW, 11, C_BLUE_DARK, null);
    const genTime = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
    text(`Digenerate: ${genTime}`, ML, PH - 4.5, 'normal', 6, [180, 210, 255] as [number,number,number]);
    text('@2026 Digital Leave Form - Y.F - HCGA Departemen', PW / 2, PH - 4.5, 'normal', 6.5, [180, 210, 255] as [number,number,number], 'center');

    // ═══════════════════════════════════════════════════════════════════════
    // SAVE
    // ═══════════════════════════════════════════════════════════════════════
    const safeName  = (data.employeeName || 'Karyawan').trim().replace(/[/\\:*?"<>|]/g, '');
    const dateObj   = data.submissionDate ? new Date(data.submissionDate) : new Date();
    const dateLabel = format(dateObj, 'dd MMMM yyyy', { locale: idLocale }); // e.g. "09 Mei 2026"
    const fileName  = `Cuti_${safeName}_${dateLabel}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('[pdf] exportFormToPDF error:', error);
    throw new Error(`Gagal export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ─── Utilities ─────────────────────────────────────────────────────────────
function capitalize(str: string): string {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
