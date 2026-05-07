'use client';

import React, { useState, useEffect } from 'react';
import ReviewerForm from '../../../components/ReviewerForm';
import { Ticket, ExtractedReceiptData, ReceiptStatus } from '../../../lib/types';

export default function ReviewerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
          className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-2"
        >
          <span>&larr;</span> Back to Inbox
        </button>
        <ReviewerForm
          initialData={selectedTicket.finalStatus ? selectedTicket.data : selectedTicket.data}
          evaluation={selectedTicket.evaluation}
          imageBase64={selectedTicket.imageBase64}
          onSubmit={handleReviewSubmit}
          onCancel={() => setSelectedTicket(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviewer Inbox</h2>
      
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
              {tickets.map(ticket => {
                const isProcessed = ticket.finalStatus !== undefined;
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
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
        </div>
      )}
    </div>
  );
}
