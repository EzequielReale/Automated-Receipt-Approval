import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mockDb } from '../../../../lib/mockDb';
import { jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-demo');

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    if (role !== 'REVIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: ticketId } = await params;
    const body = await request.json();
    
    mockDb.updateTicket(ticketId, {
      data: body.data,
      finalStatus: body.finalStatus,
      comment: body.comment
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
