import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { jwtVerify } from 'jose';

import { evaluateReceipt } from '../../../../lib/server/ruleEngine';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is missing');
  return new TextEncoder().encode(secret);
};

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as string;

    if (role !== 'REVIEWER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reviewerId = payload.sub as string;

    // Verify user exists in DB to prevent foreign key violations
    const userExists = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (!userExists) {
      return NextResponse.json({ error: 'User session invalid. Please log in again.' }, { status: 401 });
    }

    const { id: ticketId } = await params;
    const body = await request.json();

    // Get existing ticket to merge data for evaluation if only partial data is sent
    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Prepare data for re-evaluation
    const updatedData = {
      merchant_name: body.data?.merchant_name ?? existingTicket.merchant_name,
      receipt_date: body.data?.receipt_date ?? existingTicket.date,
      total_amount: body.data?.total_amount !== undefined ? Number(body.data.total_amount) : existingTicket.amount,
      category: body.data?.category ?? existingTicket.category,
    };

    // Re-run Rule Engine on the backend
    const evaluation = evaluateReceipt(updatedData);

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        final_status: body.finalStatus,
        reviewer_comment: body.comment,
        // Update data fields
        merchant_name: updatedData.merchant_name,
        date: updatedData.receipt_date,
        amount: updatedData.total_amount,
        category: updatedData.category,
        // Update AI status based on the new data
        ai_status: evaluation.status,
        ai_reasoning: evaluation.reason,
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
