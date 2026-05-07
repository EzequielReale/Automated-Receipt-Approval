import React from 'react';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  let role = '';
  let email = '';

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-demo');
      const { payload } = await jwtVerify(token, secret);
      role = payload.role as string;
      email = payload.email as string;
    } catch {
      // Token verification failed
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm p-4 px-8 flex justify-between items-center border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">ARA System</h1>
          <span className="text-gray-400">|</span>
          <span className="font-medium text-gray-600">{role === 'EMPLOYEE' ? 'Employee Portal' : 'Reviewer Portal'}</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="text-sm text-gray-500">
            {email}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
            role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {role}
          </span>
          <form action="/api/auth/logout" method="POST">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold group">
              <span>Logout</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </nav>
      <main className="flex-1 w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
