'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ReviewerForm from '../../../components/ReviewerForm';
import { Ticket, ExtractedReceiptData, ReceiptStatus } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';

export default function ReviewerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [filterPending, setFilterPending] = useState(true);

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

  const handleConfirmAI = async (ticket: Ticket) => {
    if (ticket.evaluation.status === 'Needs Review') return;

    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: ticket.data,
          finalStatus: ticket.evaluation.status,
          comment: 'Confirmed AI decision'
        }),
      });

      if (res.ok) {
        fetchTickets();
      } else {
        alert('Failed to confirm');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTickets = useMemo(() => {
    if (filterPending) {
      return tickets.filter(t => !t.finalStatus);
    }
    return tickets;
  }, [tickets, filterPending]);

  if (selectedTicket) {
    const isFinalized = !!selectedTicket.finalStatus;
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
          readOnly={isFinalized}
          onSubmit={handleReviewSubmit}
          onCancel={() => setSelectedTicket(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          Reviewer Inbox
        </h2>
        
        <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button 
            onClick={() => setFilterPending(true)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterPending ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Pending Only
          </button>
          <button 
            onClick={() => setFilterPending(false)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!filterPending ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            All Tickets
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button 
            onClick={fetchTickets}
            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-purple-50 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No tickets to show</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            {filterPending ? 'You have reviewed all current tickets. Great job!' : 'No tickets found in the system.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Merchant</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount & Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AI Insight</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Final Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTickets.slice(0, visibleCount).map(ticket => {
                  const isFinalized = !!ticket.finalStatus;
                  const aiStatus = ticket.evaluation.status;
                  const canConfirm = !isFinalized && aiStatus !== 'Needs Review';
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-gray-400 mb-1">{formatDate(ticket.createdAt)}</div>
                        <div className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                          {ticket.data.merchant_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-extrabold text-gray-900 mb-1">${ticket.data.total_amount}</div>
                        <div className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md inline-block">
                          {ticket.data.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            aiStatus === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                            aiStatus === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            AI: {aiStatus}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2 italic" title={ticket.evaluation.reason}>
                          &quot;{ticket.evaluation.reason}&quot;
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isFinalized ? (
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                            ticket.finalStatus === 'Approved' ? 'bg-green-600 text-white shadow-sm' :
                            'bg-red-600 text-white shadow-sm'
                          }`}>
                            {ticket.finalStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        {canConfirm && (
                          <button 
                            onClick={() => handleConfirmAI(ticket)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Confirm AI decision"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        {!isFinalized ? (
                          <button 
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit and Review"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        ) : (
                          <button 
                            onClick={() => setSelectedTicket(ticket)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredTickets.length > visibleCount && (
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors px-6 py-2 bg-white border border-purple-100 rounded-full shadow-sm hover:shadow-md"
              >
                Load more tickets
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
