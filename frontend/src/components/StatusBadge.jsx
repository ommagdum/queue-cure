// components/StatusBadge.jsx
import React from 'react';

const STATUS_CONFIG = {
  WAITING:     { label: 'Waiting',     className: 'bg-amber-100 text-amber-900' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-900' },
  DONE:        { label: 'Done',        className: 'bg-slate-100 text-slate-500' },
  NO_SHOW:     { label: 'No Show',     className: 'bg-slate-100 text-slate-400' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.WAITING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
};

export default StatusBadge;