import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { jwtVerify } from 'jose';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is missing');
  return new TextEncoder().encode(secret);
};

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
        where: {
          events: {
            some: {
              userId,
              type: 'CREATED'
            }
          }
        },
        include: {
          events: {
            include: {
              user: {
                select: { email: true, role: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'REVIEWER') {
      tickets = await prisma.ticket.findMany({
        include: {
          events: {
            include: {
              user: {
                select: { email: true, role: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Map the Prisma tickets back to the frontend expected shape
    const formattedTickets = tickets.map(t => {
      const creationEvent = t.events.find(e => e.type === 'CREATED');
      const reviewEvent = t.events.find(e => e.type === 'REVIEWED');
      
      return {
        id: t.id,
        userId: creationEvent?.userId || 'Unknown',
        creatorEmail: creationEvent?.user.email,
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
        reviewerId: reviewEvent?.userId,
        reviewerEmail: reviewEvent?.user.email,
        imageBase64: t.imageBase64,
        createdAt: t.createdAt.toISOString(),
        history: t.events.map(e => ({
          type: e.type,
          user: e.user.email,
          date: e.createdAt.toISOString()
        }))
      };
    });

    return NextResponse.json({ data: formattedTickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
