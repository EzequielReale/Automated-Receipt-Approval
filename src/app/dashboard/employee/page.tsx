'use client';

import React, { useState, useEffect } from 'react';
import UploadComponent from '../../../components/UploadComponent';
import { Ticket } from '../../../lib/types';
import { evaluateReceipt } from '../../../lib/ruleEngine';

export default function EmployeeDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      // 1. Extract Data
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const extractJson = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractJson.error || 'Extraction failed');

      const data = extractJson.data;
      const evaluation = evaluateReceipt(data);

      // 2. Save Ticket
      const saveRes = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          evaluation,
          imageBase64: base64
        }),
      });

      if (!saveRes.ok) throw new Error('Failed to save ticket');

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
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Receipt</h2>
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">{success}</div>}
        <UploadComponent onImageSelected={handleImageSelected} isLoading={isLoading} />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets found. Upload a receipt to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.finalStatus === 'Approved' || ticket.evaluation.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    ticket.finalStatus === 'Rejected' || ticket.evaluation.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ticket.finalStatus || ticket.evaluation.status}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
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
        )}
      </section>
    </div>
  );
}
