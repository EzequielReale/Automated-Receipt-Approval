'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (email: string) => {
    setLoading(email);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const { user } = await res.json();
        router.push(`/dashboard/${user.role.toLowerCase()}`);
        router.refresh(); // Refresh to apply new auth state
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Login error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login (Mock DB)</h2>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Select a user to login. The system will issue a JWT and redirect you to the appropriate dashboard.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('employee@demo.com')}
            disabled={loading !== null}
            className={`w-full flex justify-between items-center px-6 py-4 rounded-lg border-2 border-blue-500 text-blue-700 hover:bg-blue-50 transition-colors ${
              loading === 'employee@demo.com' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="text-left">
              <p className="font-bold text-lg">Employee</p>
              <p className="text-sm">employee@demo.com</p>
            </div>
            {loading === 'employee@demo.com' ? (
              <span className="animate-spin h-5 w-5 border-2 border-blue-700 border-t-transparent rounded-full"></span>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            )}
          </button>

          <button
            onClick={() => handleLogin('reviewer@demo.com')}
            disabled={loading !== null}
            className={`w-full flex justify-between items-center px-6 py-4 rounded-lg border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition-colors ${
              loading === 'reviewer@demo.com' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="text-left">
              <p className="font-bold text-lg">Reviewer</p>
              <p className="text-sm">reviewer@demo.com</p>
            </div>
            {loading === 'reviewer@demo.com' ? (
              <span className="animate-spin h-5 w-5 border-2 border-purple-700 border-t-transparent rounded-full"></span>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            )}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:underline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
