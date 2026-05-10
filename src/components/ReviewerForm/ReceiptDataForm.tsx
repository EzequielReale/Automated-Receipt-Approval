import React from 'react';
import { ExtractedReceiptData } from '../../lib/types';
import { VALID_CATEGORIES } from '../../lib/constants';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ReceiptDataFormProps {
  formData: ExtractedReceiptData;
  readOnly: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function ReceiptDataForm({ formData, readOnly, onInputChange }: ReceiptDataFormProps) {
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...VALID_CATEGORIES.map(cat => ({ value: cat, label: cat }))
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      <Input
        label="Merchant Name"
        name="merchant_name"
        value={formData.merchant_name || ''}
        onChange={onInputChange}
        disabled={readOnly}
      />
      <Input
        label="Receipt Date"
        type="date"
        name="receipt_date"
        value={formData.receipt_date ? formData.receipt_date.split('T')[0] : ''}
        onChange={onInputChange}
        disabled={readOnly}
      />
      <Input
        label="Total Amount"
        type="number"
        step="0.01"
        name="total_amount"
        leftIcon={<span>$</span>}
        value={formData.total_amount || 0}
        onChange={onInputChange}
        disabled={readOnly}
        className="font-mono font-bold"
      />
      <Select
        label="Category"
        name="category"
        value={formData.category || ''}
        onChange={onInputChange}
        disabled={readOnly}
        options={categoryOptions}
      />
    </div>
  );
}
