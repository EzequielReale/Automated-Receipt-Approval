'use client';

import React, { useState, useEffect } from 'react';
import ReviewerForm from '../../../components/ReviewerForm';
import { Ticket, ExtractedReceiptData, ReceiptStatus } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';

export default function ReviewerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

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

  const handleReviewSubmit = async (finalData: ExtractedReceiptData, finalStatus: ReceiptStatus, comment: string) => {
    if (!selectedTicket) return;

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: finalData,
          finalStatus,
          comment
        }),
      });

      if (res.ok) {
        setSelectedTicket(null);
        fetchTickets();
      } else {
        alert('Failed to save review');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving review');
    }
  };

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all font-medium text-sm border border-gray-200 shadow-sm"
        >
          <span>&larr;</span> Back to Inbox
        </button>
        <ReviewerForm
          initialData={selectedTicket.data}
          evaluation={selectedTicket.evaluation}
          imageBase64={selectedTicket.imageBase64}
          initialComment={selectedTicket.comment}
          initialStatus={selectedTicket.finalStatus}
          onSubmit={handleReviewSubmit}
          onCancel={() => setSelectedTicket(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          Reviewer Inbox
        </h2>
        <button 
          onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all font-medium text-sm"
        >
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="relative py-2 mb-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-100"></div>
        </div>
      </div>
      
      {tickets.length === 0 ? (
        <p className="text-gray-500 bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          No tickets currently require review. You&apos;re all caught up!
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.slice(0, visibleCount).map(ticket => {
                const isProcessed = ticket.finalStatus !== undefined;
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.data.merchant_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{ticket.data.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      ${ticket.data.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.finalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                        ticket.finalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ticket.finalStatus || ticket.evaluation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className={`text-blue-600 hover:text-blue-900 font-semibold ${isProcessed ? 'text-gray-600 hover:text-gray-900' : ''}`}
                      >
                        {isProcessed ? 'View Details' : 'Review Ticket'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tickets.length > visibleCount && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 5)}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Show More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
