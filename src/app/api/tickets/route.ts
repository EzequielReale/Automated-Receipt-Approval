import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { mockDb } from '../../../lib/mockDb';
import { Ticket } from '../../../lib/types';
import { jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-demo');

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;
    const userId = payload.sub as string;

    let tickets = mockDb.tickets;

    if (role === 'EMPLOYEE') {
      tickets = tickets.filter(t => t.userId === userId);
    } else if (role === 'REVIEWER') {
      // Reviewer sees Needs Review or already processed items
      tickets = tickets.filter(t => 
        t.evaluation.status === 'Needs Review' || 
        t.finalStatus !== undefined
      );
    }

    return NextResponse.json({ data: tickets });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;
    const userId = payload.sub as string;

    if (role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const evaluationStatus = body.evaluation.status;
    const finalStatus = evaluationStatus === 'Needs Review' ? undefined : evaluationStatus;

    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      userId,
      data: body.data,
      evaluation: body.evaluation,
      finalStatus,
      imageBase64: body.imageBase64,
      createdAt: new Date().toISOString(),
    };

    mockDb.addTicket(newTicket);
    return NextResponse.json({ data: newTicket }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
