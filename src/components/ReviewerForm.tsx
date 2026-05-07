'use client';

import React, { useState } from 'react';
import { ExtractedReceiptData, ReceiptStatus, RuleEvaluationResult } from '../lib/types';
import { VALID_CATEGORIES } from '../lib/constants';

interface ReviewerFormProps {
  initialData: ExtractedReceiptData;
  evaluation: RuleEvaluationResult;
  imageBase64: string;
  onSubmit: (finalData: ExtractedReceiptData, finalStatus: ReceiptStatus, comment: string) => void;
  onCancel: () => void;
}

export default function ReviewerForm({ initialData, evaluation, imageBase64, onSubmit, onCancel }: ReviewerFormProps) {
  const [formData, setFormData] = useState<ExtractedReceiptData>(initialData);
  const [status, setStatus] = useState<ReceiptStatus>(evaluation.status);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'total_amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-100 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Original Receipt</h3>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center min-h-[400px] overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={`data:image/jpeg;base64,${imageBase64}`} 
            alt="Uploaded receipt" 
            className="max-w-full h-auto object-contain rounded shadow-sm"
            style={{ maxHeight: '80vh' }}
          />
        </div>
      </div>

      {/* Form Panel */}
      <div className="w-full lg:w-1/2">
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-md border border-gray-200 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Review Data</h2>
            <button 
              type="button" 
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancel
            </button>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Automated Decision</h3>
            <p className="text-sm">
              <span className="font-medium text-gray-600">Status:</span>{' '}
              <span className={`font-bold ${evaluation.status === 'Approved' ? 'text-green-600' : evaluation.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                {evaluation.status}
              </span>
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium text-gray-600">Reasoning:</span> {evaluation.reason}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Name</label>
              <input
                type="text"
                name="merchant_name"
                value={formData.merchant_name || ''}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
              <input
                type="date"
                name="receipt_date"
                value={formData.receipt_date ? formData.receipt_date.split('T')[0] : ''} 
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <input
                type="number"
                step="0.01"
                name="total_amount"
                value={formData.total_amount || 0}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a category</option>
                {VALID_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReceiptStatus)}
              className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
            >
              <option value="Approved">Approve</option>
              <option value="Rejected">Reject</option>
              <option value="Needs Review">Needs Review</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Comment <span className="text-red-500">*</span></label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={`w-full p-2.5 border rounded focus:ring-2 outline-none min-h-[100px] ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="Explain the reason for this final decision..."
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-lg"
          >
            Save Final Decision
          </button>
        </form>
      </div>
    </div>
  );
}
