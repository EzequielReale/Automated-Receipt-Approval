import React from 'react';
import { Icons } from '../ui/Icons';

interface ReceiptImagePanelProps {
  imageBase64: string;
}

export function ReceiptImagePanel({ imageBase64 }: ReceiptImagePanelProps) {
  return (
    <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-inner">
      <div className="p-4 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Icons.Receipt className="w-5 h-5 text-gray-500" />
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
  );
}
