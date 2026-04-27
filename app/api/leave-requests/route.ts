import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId } from '@/lib/db';
import { LeaveFormData } from '@/lib/form-types';

// POST /api/leave-requests
// Menyimpan pengajuan cuti baru, return { id }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeaveFormData;

    if (!body.employeeName || !body.entity) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Pisahkan tanda tangan dari form_data utama
    const { employeeSignature, immediateSupervision, managerApproval, hcDepartment, ...formRest } = body;

    let id = generateId();
    // Pastikan ID unik (retry sekali jika collision)
    const existing = await sql`SELECT id FROM leave_requests WHERE id = ${id}`;
    if (existing.length > 0) id = generateId();

    await sql`
      INSERT INTO leave_requests (
        id, status, form_data, employee_signature,
        supervisor_name, supervisor_date, supervisor_signature,
        manager_name, manager_date, manager_signature,
        hc_name, hc_date, hc_signature
      ) VALUES (
        ${id},
        'pending_supervisor',
        ${JSON.stringify(formRest)}::jsonb,
        ${employeeSignature ?? null},
        ${immediateSupervision?.name ?? null},
        ${immediateSupervision?.date ?? null},
        ${immediateSupervision?.signatureData ?? null},
        ${managerApproval?.name ?? null},
        ${managerApproval?.date ?? null},
        ${managerApproval?.signatureData ?? null},
        ${hcDepartment?.name ?? null},
        ${hcDepartment?.date ?? null},
        ${hcDepartment?.signatureData ?? null}
      )
    `;

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('[leave-requests POST]', err);
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}
