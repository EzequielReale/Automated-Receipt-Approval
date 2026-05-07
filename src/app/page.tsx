import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-6xl font-black text-gray-900 tracking-tight">
            ARA <span className="text-blue-600">System</span>
          </h1>
          <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">Auto Receipt Approval</h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            The next generation of automated expense management. Powered by AI for precision extraction and rule-based instant validation.
          </p>
        </div>
        
        <div className="pt-4">
          <Link 
            href="/login" 
            className="group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 px-12 rounded-2xl transition-all shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 text-xl"
          >
            Get Started
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">For Employees</h3>
            <p className="text-gray-600 text-lg">Quickly upload your receipts. The AI automatically extracts merchant data, dates, amounts, and categorizes expenses in seconds.</p>
          </div>

          <div className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-100 transition-all duration-300">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">For Reviewers</h3>
            <p className="text-gray-600 text-lg">Audit receipts that require human intervention. Verify extracted data against the original image and provide final approval with ease.</p>
          </div>
        </div>
        
        <div className="pt-12 text-gray-400 text-sm font-medium uppercase tracking-widest">
          Powered by Machines Like Me
        </div>
      </div>
    </div>
  );
}
