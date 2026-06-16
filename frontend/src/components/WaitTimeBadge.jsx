
import React from 'react';
import { Clock } from 'lucide-react';
const WaitTimeBadge = ({ minutes, status }) => {
  if (status !== 'WAITING' || minutes === null || minutes === undefined) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
      <Clock size={11} />
      ~{minutes} min
    </span>
  );
};
export default WaitTimeBadge;