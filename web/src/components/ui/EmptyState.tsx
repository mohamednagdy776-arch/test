import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = '📭', title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border border-emerald-100 p-10 text-center space-y-3 ${className}`}>
      <p className="text-4xl">{icon}</p>
      <p className="font-semibold text-[#065F46]">{title}</p>
      {description && <p className="text-sm text-[#10B981]">{description}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
