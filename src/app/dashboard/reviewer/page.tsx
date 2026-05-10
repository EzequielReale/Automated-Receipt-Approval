'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReviewerForm from '../../../components/ReviewerForm';
import { Ticket, ExtractedReceiptData, ReceiptStatus } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Icons } from '../../../components/ui/Icons';
import { Card } from '../../../components/ui/Card';

export default function ReviewerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [filterPending, setFilterPending] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const { data } = await res.json();
        setTickets(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setSelectedTicket(null)}
          leftIcon={<Icons.ArrowLeft className="w-4 h-4" />}
        >
          Back to Inbox
        </Button>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
          <Icons.Inbox className="w-8 h-8 text-purple-600" />
          Reviewer Inbox
        </h2>
        
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
          <Button
            variant={filterPending ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterPending(true)}
            className="!rounded-xl"
          >
            Pending Only
          </Button>
          <Button
            variant={!filterPending ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterPending(false)}
            className="!rounded-xl"
          >
            All Tickets
          </Button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTickets}
            title="Refresh"
          >
            <Icons.Refresh className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card className="text-center py-20">
          <div className="w-20 h-20 bg-purple-50 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icons.Check className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">All caught up!</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {filterPending ? 'No pending tickets left to review.' : 'The inbox is empty.'}
          </p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Merchant</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount & Category</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Insight</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTickets.slice(0, visibleCount).map(ticket => (
                  <TicketRow 
                    key={ticket.id} 
                    ticket={ticket} 
                    onSelect={() => setSelectedTicket(ticket)}
                    onConfirmAI={() => handleConfirmAI(ticket)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {filteredTickets.length > visibleCount && (
            <div className="p-6 bg-gray-50/50 text-center border-t border-gray-50">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount(prev => prev + 10)}
                className="bg-white"
              >
                Load more tickets
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function TicketRow({ ticket, onSelect, onConfirmAI }: { ticket: Ticket, onSelect: () => void, onConfirmAI: () => void }) {
  const isFinalized = !!ticket.finalStatus;
  const aiStatus = ticket.evaluation.status;
  const canConfirm = !isFinalized && aiStatus !== 'Needs Review';
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-6 py-5">
        <div className="text-[10px] font-bold text-gray-400 mb-1 font-mono uppercase">{formatDate(ticket.createdAt)}</div>
        <div className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
          {ticket.data.merchant_name || 'Unknown'}
        </div>
      </td>
      <td className="px-6 py-5">
        <div className="text-lg font-black text-gray-900 mb-1 tracking-tight">
          <span className="text-xs text-gray-400 font-normal mr-0.5">$</span>
          {ticket.data.total_amount}
        </div>
        <div className="text-[10px] font-bold text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md inline-block uppercase">
          {ticket.data.category}
        </div>
      </td>
      <td className="px-6 py-5 max-w-xs">
        <div className="mb-1.5">
          <Badge variant={getBadgeVariant(aiStatus)} className="!text-[9px] !px-1.5 !py-0">AI: {aiStatus}</Badge>
        </div>
        <div className="text-[11px] text-gray-500 line-clamp-1 italic" title={ticket.evaluation.reason}>
          &quot;{ticket.evaluation.reason}&quot;
        </div>
      </td>
      <td className="px-6 py-5">
        {isFinalized ? (
          <div>
            <Badge variant={getBadgeVariant(ticket.finalStatus!)}>{ticket.finalStatus}</Badge>
            {ticket.reviewerEmail && (
              <div className="text-[9px] text-gray-400 mt-1 font-bold uppercase">
                {ticket.reviewerEmail}
              </div>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            Pending
          </span>
        )}
      </td>
      <td className="px-6 py-5 text-right space-x-1">
        {canConfirm && (
          <Button 
            variant="ghost"
            size="icon"
            onClick={onConfirmAI}
            className="text-green-600 hover:bg-green-50"
            title="Confirm AI decision"
          >
            <Icons.Check className="w-5 h-5" />
          </Button>
        )}
        <Button 
          variant="ghost"
          size="icon"
          onClick={onSelect}
          className={!isFinalized ? "text-blue-600 hover:bg-blue-50" : "text-gray-400 hover:bg-gray-100"}
          title={!isFinalized ? "Edit and Review" : "View Details"}
        >
          {!isFinalized ? <Icons.Edit className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
        </Button>
      </td>
    </tr>
  );
}
