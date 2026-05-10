import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const baseUrl = process.env.BASE_URL || request.nextUrl.origin;
  
  const response = NextResponse.redirect(new URL('/', baseUrl));
  
  response.cookies.delete('auth_token');
  
  return response;
}
