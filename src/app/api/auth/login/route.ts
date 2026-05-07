import { NextResponse } from 'next/server';
import { mockDb } from '../../../../lib/mockDb';
import { createToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = mockDb.users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = await createToken(user);

    const response = NextResponse.json({ success: true, user });
    
    // Set cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 2, // 2 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
