// components/PatientRow.jsx
import React from 'react';
import StatusBadge from './StatusBadge';
import WaitTimeBadge from './WaitTimeBadge';
import { CheckCircle, UserX } from 'lucide-react';

const formatTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PatientRow = ({ entry, onDone, onNoShow, loading }) => {
  const { id, patientName, tokenNumber, status, checkInTime, estimatedWaitMinutes } = entry;
  const isDimmed = status === 'DONE' || status === 'NO_SHOW';

  return (
    <div className={`flex items-center gap-4 py-3 px-4 border-b border-gray-100 last:border-b-0 transition-colors ${
      isDimmed ? 'opacity-50' : 'hover:bg-slate-50'
    }`}>

      {/* Token Number */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700'
        : status === 'DONE'        ? 'bg-slate-100 text-slate-400'
        : 'bg-slate-100 text-slate-600'
      }`}>
        {tokenNumber}
      </div>

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900 truncate">{patientName}</div>
        <div className="text-xs text-slate-500 mt-0.5">Checked in at {formatTime(checkInTime)}</div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <WaitTimeBadge minutes={estimatedWaitMinutes} status={status} />
        <StatusBadge status={status} />
      </div>

      {/* Action Buttons */}
      {status === 'IN_PROGRESS' && (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onDone(id)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors"
          >
            <CheckCircle size={13} /> Done
          </button>
          <button
            onClick={() => onNoShow(id)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 text-xs font-semibold rounded-md border border-gray-200 transition-colors"
          >
            <UserX size={13} /> No Show
          </button>
        </div>
      )}

      {isDimmed && <div className="w-36 flex-shrink-0" />}
    </div>
  );
};

export default PatientRow;