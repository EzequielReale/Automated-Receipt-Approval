'use client';

import React, { useState, useEffect } from 'react';
import UploadComponent from '../../../components/UploadComponent';
import { Ticket } from '../../../lib/types';
import { formatDate } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Icons } from '../../../components/ui/Icons';

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
    fetchTickets();
  }, []);

  const handleImageSelected = async (base64: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const extractJson = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractJson.error || 'Extraction failed');

      setSuccess('Receipt successfully uploaded and processed!');
      fetchTickets(); 
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <Card 
        title="Upload Receipt" 
        icon={<Icons.Upload className="w-6 h-6 text-blue-600" />}
        className="!p-0"
      >
        <div className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-bold">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 font-bold">{success}</div>}
          <UploadComponent onImageSelected={handleImageSelected} isLoading={isLoading} />
        </div>
      </Card>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200"></div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Icons.Receipt className="w-6 h-6 text-purple-600" />
            My Tickets
          </h2>
          <Button 
            onClick={fetchTickets}
            variant="outline"
            size="sm"
            leftIcon={<Icons.Refresh className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Icons.Inbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No tickets found. Upload a receipt to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.slice(0, visibleCount).map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
            
            {tickets.length > visibleCount && (
              <div className="flex justify-center pt-8">
                <Button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  variant="outline"
                  rightIcon={<Icons.ChevronDown className="w-5 h-5" />}
                  className="px-10"
                >
                  Show More
                </Button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const status = ticket.finalStatus || ticket.evaluation.status;
  const variant = status === 'Approved' ? 'success' : status === 'Rejected' ? 'danger' : 'warning';

  return (
    <Card className="hover:shadow-md transition-shadow group !p-0">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge variant={variant}>{status}</Badge>
          <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">{formatDate(ticket.createdAt)}</span>
        </div>
        <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-blue-600 transition-colors">
          {ticket.data.merchant_name || 'Unknown Merchant'}
        </h3>
        <p className="text-gray-500 text-xs font-medium mt-1 mb-4 bg-gray-50 inline-block px-2 py-0.5 rounded-md">
          {ticket.data.category}
        </p>
        <div className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          <span className="text-lg text-gray-400 font-normal mr-1">$</span>
          {ticket.data.total_amount}
        </div>
        {ticket.comment && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 italic border-l-4 border-gray-300">
            &quot;{ticket.comment}&quot;
          </div>
        )}
      </div>
    </Card>
  );
}
