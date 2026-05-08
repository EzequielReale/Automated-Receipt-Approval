import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { jwtVerify } from 'jose';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-demo');

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;
    const userId = payload.sub as string;

    let tickets;

    if (role === 'EMPLOYEE') {
      tickets = await prisma.ticket.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'REVIEWER') {
      tickets = await prisma.ticket.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Map the Prisma tickets back to the frontend expected shape
    const formattedTickets = tickets.map(t => ({
      id: t.id,
      userId: t.userId,
      data: {
        merchant_name: t.merchant_name,
        receipt_date: t.date,
        total_amount: t.amount,
        category: t.category
      },
      evaluation: {
        status: t.ai_status,
        reason: t.ai_reasoning
      },
      finalStatus: t.final_status,
      comment: t.reviewer_comment,
      imageBase64: t.imageBase64,
      createdAt: t.createdAt.toISOString()
    }));

    return NextResponse.json({ data: formattedTickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
