import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
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
    const reviewerId = payload.sub as string;
    
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        final_status: body.finalStatus,
        reviewer_comment: body.comment,
        // Update data fields if reviewer can modify them
        merchant_name: body.data?.merchant_name,
        date: body.data?.receipt_date,
        amount: body.data?.total_amount ? Number(body.data.total_amount) : undefined,
        category: body.data?.category,
        events: {
          create: {
            type: 'REVIEWED',
            userId: reviewerId
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
