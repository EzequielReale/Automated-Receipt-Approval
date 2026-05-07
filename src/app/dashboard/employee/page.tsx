'use client';

import React, { useState, useEffect } from 'react';
import UploadComponent from '../../../components/UploadComponent';
import { Ticket } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const { data } = await res.json();
        setTickets(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTickets();
  }, []);

  const handleImageSelected = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Extract Data and Save Ticket atomically
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const extractJson = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractJson.error || 'Extraction failed');

      setSuccess('Receipt successfully uploaded and processed!');
      fetchTickets(); // Refresh list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Receipt
        </h2>
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">{success}</div>}
        <UploadComponent onImageSelected={handleImageSelected} isLoading={isLoading} />
      </section>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            My Tickets
          </h2>
          <button 
            onClick={fetchTickets}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets found. Upload a receipt to get started.</p>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.slice(0, visibleCount).map(ticket => (
                <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.finalStatus === 'Approved' || ticket.evaluation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      ticket.finalStatus === 'Rejected' || ticket.evaluation.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ticket.finalStatus || ticket.evaluation.status}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">{formatDate(ticket.createdAt)}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 truncate">{ticket.data.merchant_name || 'Unknown Merchant'}</h3>
                  <p className="text-gray-600 text-sm mt-1 mb-4">{ticket.data.category}</p>
                  <div className="text-2xl font-bold text-gray-900 mb-4">${ticket.data.total_amount}</div>
                  {ticket.comment && (
                    <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700 italic border-l-4 border-gray-300">
                      &quot;{ticket.comment}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {tickets.length > visibleCount && (
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show More
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
