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
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-4 border-b border-gray-100 last:border-b-0 transition-colors ${
      isDimmed ? 'opacity-50' : 'hover:bg-slate-50'
    }`}>

      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700'
          : status === 'DONE'        ? 'bg-slate-100 text-slate-400'
          : 'bg-slate-100 text-slate-600'
        }`}>
          {tokenNumber}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-900 truncate">{patientName}</div>
          <div className="text-xs text-slate-500 mt-0.5">Checked in at {formatTime(checkInTime)}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pl-12 sm:pl-0 flex-wrap">
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          <StatusBadge status={status} />
          <WaitTimeBadge minutes={estimatedWaitMinutes} status={status} />
        </div>

        {status === 'IN_PROGRESS' && (
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
            <button
              onClick={() => onDone(id)}
              disabled={loading}
              className="flex-1 sm:flex-none w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors"
            >
              <CheckCircle size={13} /> Done
            </button>
            <button
              onClick={() => onNoShow(id)}
              disabled={loading}
              className="flex-1 sm:flex-none w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 text-xs font-semibold rounded-md border border-gray-200 transition-colors"
            >
              <UserX size={13} /> No Show
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default PatientRow;