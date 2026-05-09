import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const response = NextResponse.redirect(new URL('/', origin));
  
  response.cookies.delete('auth_token');
  
  return response;
}
