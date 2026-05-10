'use client';

import React, { useRef, useState } from 'react';
import { processImageForOCR } from '../lib/imageUtils';
import { Icons } from './ui/Icons';
import { Button } from './ui/Button';

interface UploadComponentProps {
  onImageSelected: (base64: string) => void;
  isLoading: boolean;
}

export default function UploadComponent({ onImageSelected, isLoading }: UploadComponentProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const base64 = await processImageForOCR(file);
      onImageSelected(base64);
    } catch (error) {
      console.error('Image processing failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to process image');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative p-10 border-2 border-dashed rounded-2xl text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Icons.Receipt className={`w-12 h-12 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-xl font-bold text-gray-800">
              {isLoading ? 'Processing image...' : 'Drag & drop a receipt image here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPEG, PNG and HEIC up to 10MB
            </p>
          </div>

          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            loading={isLoading}
            variant={dragActive ? 'primary' : 'outline'}
            className="px-8 shadow-sm"
          >
            {isLoading ? 'Extracting data...' : 'Select File'}
          </Button>
        </div>
      </div>
    </div>
  );
}
