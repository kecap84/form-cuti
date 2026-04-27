import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import { mergeFormData, LeaveRequest } from '@/lib/db';
import { ApprovalSignature } from '@/lib/form-types';

// GET /api/leave-requests/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // neon() dipanggil di dalam handler — aman saat build time
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const { id } = await params;
    const rows = await sql`SELECT * FROM leave_requests WHERE id = ${id}`;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    }

    const row = rows[0] as LeaveRequest;
    const formData = mergeFormData(row);

    return NextResponse.json({
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      formData,
    });
  } catch (err) {
    console.error('[leave-requests GET]', err);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

// PATCH /api/leave-requests/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // neon() dipanggil di dalam handler — aman saat build time
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const { id } = await params;
    const body = (await req.json()) as {
      level: 'supervisor' | 'manager' | 'hc';
      approval: ApprovalSignature;
    };

    const { level, approval } = body;

    if (!level || !approval?.name) {
      return NextResponse.json(
        { error: 'Data approval tidak lengkap' },
        { status: 400 }
      );
    }

    const nextStatus =
      level === 'supervisor'
        ? 'pending_manager'
        : level === 'manager'
        ? 'pending_hc'
        : 'approved';

    if (level === 'supervisor') {
      await sql`
        UPDATE leave_requests SET
          supervisor_name      = ${approval.name},
          supervisor_date      = ${approval.date ?? ''},
          supervisor_signature = ${approval.signatureData ?? null},
          status               = ${nextStatus},
          updated_at           = NOW()
        WHERE id = ${id}
      `;
    } else if (level === 'manager') {
      await sql`
        UPDATE leave_requests SET
          manager_name      = ${approval.name},
          manager_date      = ${approval.date ?? ''},
          manager_signature = ${approval.signatureData ?? null},
          status            = ${nextStatus},
          updated_at        = NOW()
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE leave_requests SET
          hc_name      = ${approval.name},
          hc_date      = ${approval.date ?? ''},
          hc_signature = ${approval.signatureData ?? null},
          status       = ${nextStatus},
          updated_at   = NOW()
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err) {
    console.error('[leave-requests PATCH]', err);
    return NextResponse.json(
      { error: 'Gagal menyimpan approval' },
      { status: 500 }
    );
  }
}
