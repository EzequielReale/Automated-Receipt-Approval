import React from 'react';
import { RuleEvaluationResult } from '../../lib/types';
import { Icons } from '../ui/Icons';
import { Badge } from '../ui/Badge';

interface AutomatedDecisionBannerProps {
  evaluation: RuleEvaluationResult;
}

export function AutomatedDecisionBanner({ evaluation }: AutomatedDecisionBannerProps) {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <div className="mb-8 p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icons.Info className="w-20 h-20 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
        Automated Decision
      </h3>
      <div className="space-y-2 relative z-10">
        <p className="text-sm">
          <span className="font-semibold text-blue-800">Status:</span>{' '}
          <Badge variant={getBadgeVariant(evaluation.status)}>
            {evaluation.status}
          </Badge>
        </p>
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Reasoning:</span> {evaluation.reason}
        </p>
      </div>
    </div>
  );
}
