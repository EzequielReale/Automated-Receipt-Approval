'use client';

import React, { useState } from 'react';
import UploadComponent from '../components/UploadComponent';
import ReviewerForm from '../components/ReviewerForm';
import { ExtractedReceiptData, RuleEvaluationResult, ReceiptStatus } from '../lib/types';
import { evaluateReceipt } from '../lib/ruleEngine';

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [evaluation, setEvaluation] = useState<RuleEvaluationResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleImageSelected = async (base64: string) => {
    setImageBase64(base64);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to extract data');
      }

      const data = json.data as ExtractedReceiptData;
      setExtractedData(data);
      
      // Run the rule engine locally
      const evalResult = evaluateReceipt(data);
      setEvaluation(evalResult);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during extraction');
      setImageBase64(null); // Reset image on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = (finalData: ExtractedReceiptData, finalStatus: ReceiptStatus, comment: string) => {
    console.log('Final Submission:', { finalData, finalStatus, comment });
    setIsCompleted(true);
  };

  const handleReset = () => {
    setImageBase64(null);
    setExtractedData(null);
    setEvaluation(null);
    setIsCompleted(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Auto Receipt Approval</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your receipts for automatic data extraction and rule-based evaluation. 
          Reviewers can then finalize the decision.
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 max-w-xl w-full rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-sm underline mt-2">Dismiss</button>
          </div>
        )}

        {isCompleted ? (
          <div className="text-center p-10 bg-white rounded-xl shadow max-w-md w-full border border-green-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Review Submitted</h2>
            <p className="text-gray-600 mb-6">The receipt has been successfully reviewed and saved.</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Process Another Receipt
            </button>
          </div>
        ) : !extractedData || !evaluation ? (
          <UploadComponent onImageSelected={handleImageSelected} isLoading={isLoading} />
        ) : (
          <ReviewerForm
            initialData={extractedData}
            evaluation={evaluation}
            imageBase64={imageBase64!}
            onSubmit={handleReviewSubmit}
            onCancel={handleReset}
          />
        )}
      </main>
    </div>
  );
}
