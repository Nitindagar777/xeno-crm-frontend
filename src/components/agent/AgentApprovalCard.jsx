import React from 'react';
import { Check, Edit2, X } from 'lucide-react';
import Button from '../ui/Button';

export default function AgentApprovalCard({
  step,
  onApprove,
  onEdit,
  onReject
}) {
  return (
    <div className="flex flex-col space-y-3 p-4 bg-surface-elevated/40 border border-border/60 rounded-xl mt-3 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary-light uppercase tracking-wider">
          AI Proposal Approval
        </span>
        <span className="text-xs text-text-muted">
          Review rules before launch
        </span>
      </div>

      <div className={`grid ${step === 'campaign' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        <Button
          variant="primary"
          size="sm"
          className="bg-success hover:bg-success/90 text-white border-0 py-2 rounded-lg"
          onClick={() => onApprove(step)}
        >
          <Check className="h-4.5 w-4.5 mr-1" />
          <span>{step === 'campaign' ? 'Launch' : 'Approve'}</span>
        </Button>

        {step !== 'campaign' && (
          <Button
            variant="secondary"
            size="sm"
            className="border border-warning/30 hover:border-warning/50 text-warning hover:bg-warning/5 py-2 rounded-lg"
            onClick={() => onEdit(step)}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            <span>Edit</span>
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="border border-danger/30 hover:border-danger/50 text-danger hover:bg-danger/5 py-2 rounded-lg"
          onClick={() => onReject(step)}
        >
          <X className="h-4.5 w-4.5 mr-1" />
          <span>{step === 'campaign' ? 'Cancel' : 'Reject'}</span>
        </Button>
      </div>
    </div>
  );
}
