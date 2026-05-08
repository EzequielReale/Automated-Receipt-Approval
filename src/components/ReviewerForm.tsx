'use client';

import React, { useState } from 'react';
import { ExtractedReceiptData, ReceiptStatus, RuleEvaluationResult } from '../lib/types';
import { VALID_CATEGORIES } from '../lib/constants';

interface ReviewerFormProps {
  initialData: ExtractedReceiptData;
  evaluation: RuleEvaluationResult;
  imageBase64: string;
  initialComment?: string;
  initialStatus?: ReceiptStatus;
  readOnly?: boolean;
  onSubmit: (finalData: ExtractedReceiptData, finalStatus: ReceiptStatus, comment: string) => void;
  onCancel: () => void;
}

export default function ReviewerForm({ 
  initialData, 
  evaluation, 
  imageBase64, 
  initialComment = '', 
  initialStatus, 
  readOnly = false,
  onSubmit, 
  onCancel 
}: ReviewerFormProps) {
  const [formData, setFormData] = useState<ExtractedReceiptData>(initialData);
  const [status, setStatus] = useState<ReceiptStatus>(initialStatus || (evaluation.status === 'Needs Review' ? 'Approved' : evaluation.status));
  const [comment, setComment] = useState<string>(initialComment || '');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!comment.trim()) {
      setError('A comment is mandatory to finalize the review.');
      return;
    }
    setError(null);
    onSubmit(formData, status, comment);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
      {/* Image Panel */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-inner">
        <div className="p-4 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Original Receipt
          </h3>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center min-h-[400px] overflow-auto bg-gray-200/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={`data:image/jpeg;base64,${imageBase64}`} 
            alt="Uploaded receipt" 
            className="max-w-full h-auto object-contain rounded-lg shadow-lg border-4 border-white"
            style={{ maxHeight: '80vh' }}
          />
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full lg:w-1/2">
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {readOnly ? 'Ticket Details' : 'Review Data'}
            </h2>
          </div>
          
          <div className="mb-8 p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-20 h-20 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              Automated Decision
            </h3>
            <div className="space-y-2 relative z-10">
              <p className="text-sm">
                <span className="font-semibold text-blue-800">Status:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${evaluation.status === 'Approved' ? 'bg-green-200 text-green-900' : evaluation.status === 'Rejected' ? 'bg-red-200 text-red-900' : 'bg-yellow-200 text-yellow-900'}`}>
                  {evaluation.status}
                </span>
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Reasoning:</span> {evaluation.reason}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 flex-1">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">Merchant Name</label>
              <input
                type="text"
                name="merchant_name"
                value={formData.merchant_name || ''}
                onChange={handleInputChange}
                disabled={readOnly}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">Receipt Date</label>
              <input
                type="date"
                name="receipt_date"
                value={formData.receipt_date ? formData.receipt_date.split('T')[0] : ''} 
                onChange={handleInputChange}
                disabled={readOnly}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">Total Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  name="total_amount"
                  value={formData.total_amount || 0}
                  onChange={handleInputChange}
                  disabled={readOnly}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                disabled={readOnly}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] disabled:bg-gray-50 disabled:text-gray-500"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.5em' }}
              >
                <option value="">Select a category</option>
                {VALID_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 space-y-1">
            <label className="block text-sm font-bold text-gray-700">Final Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReceiptStatus)}
              disabled={readOnly}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg appearance-none bg-no-repeat bg-[right_1rem_center] disabled:bg-gray-50 disabled:text-gray-500"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.5em' }}
            >
              <option value="Approved">Approve</option>
              <option value="Rejected">Reject</option>
            </select>
          </div>

          <div className="mb-8 space-y-1">
            <label className="block text-sm font-bold text-gray-700">
              Reviewer Comment {!readOnly && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={readOnly}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none min-h-[120px] transition-all disabled:bg-gray-50 disabled:text-gray-500 ${error ? 'border-red-500 focus:ring-red-500 bg-red-50/50' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="Explain the reason for this final decision..."
            />
            {error && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            {readOnly ? (
              <button 
                type="button" 
                onClick={onCancel}
                className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                Close
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={onCancel}
                  className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 text-lg transform hover:-translate-y-1 active:translate-y-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save Final Decision
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
