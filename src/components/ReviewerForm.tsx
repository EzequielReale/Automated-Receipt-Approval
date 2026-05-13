'use client';

import React, { useState } from 'react';
import { ExtractedReceiptData, ReceiptStatus, RuleEvaluationResult } from '../lib/types';
import { ReceiptImagePanel } from './ReviewerForm/ReceiptImagePanel';
import { AutomatedDecisionBanner } from './ReviewerForm/AutomatedDecisionBanner';
import { ReceiptDataForm } from './ReviewerForm/ReceiptDataForm';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Icons } from './ui/Icons';

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
  const [status, setStatus] = useState<ReceiptStatus | ''>(() => {
    if (initialStatus) return initialStatus;
    if (evaluation.status === 'Approved' || evaluation.status === 'Rejected') {
      return evaluation.status;
    }
    return '';
  });
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
    if (!status) {
      setError('Please select a final status (Approve or Reject).');
      return;
    }
    if (!comment.trim()) {
      setError('A comment is mandatory to finalize the review.');
      return;
    }
    setError(null);
    onSubmit(formData, status as ReceiptStatus, comment);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto">
      <ReceiptImagePanel imageBase64={imageBase64} />

      <div className="w-full lg:w-1/2">
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded-2xl shadow-xl border border-gray-200 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {readOnly ? 'Ticket Details' : 'Review Data'}
            </h2>
          </div>
          
          <AutomatedDecisionBanner evaluation={evaluation} />

          <div className="flex-1">
            <ReceiptDataForm 
              formData={formData} 
              readOnly={readOnly} 
              onInputChange={handleInputChange} 
            />

            <div className="mb-6">
              <Select
                label="Final Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ReceiptStatus);
                  if (error && e.target.value) setError(null);
                }}
                disabled={readOnly}
                options={[
                  { value: '', label: 'Select one', disabled: true },
                  { value: 'Approved', label: 'Approve' },
                  { value: 'Rejected', label: 'Reject' }
                ]}
                className="font-bold text-lg"
              />
            </div>

            <div className="mb-8 space-y-1">
              <label className="block text-sm font-bold text-gray-700">
                Reviewer Comment {!readOnly && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (error && e.target.value.trim()) setError(null);
                }}
                disabled={readOnly}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 outline-none min-h-[120px] transition-all disabled:bg-gray-50 disabled:text-gray-500 ${error ? 'border-red-500 focus:ring-red-500 bg-red-50/50' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="Explain the reason for this final decision..."
              />
              {error && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{error}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            {readOnly ? (
              <Button 
                type="button" 
                onClick={onCancel}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
              >
                Close
              </Button>
            ) : (
              <>
                <Button 
                  type="button" 
                  onClick={onCancel}
                  variant="outline"
                  leftIcon={<Icons.Cancel className="w-5 h-5" />}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Icons.Save className="w-5 h-5" />}
                  className="flex-[2] text-lg"
                >
                  Save Final Decision
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
