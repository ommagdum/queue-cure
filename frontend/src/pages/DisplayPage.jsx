import React from 'react';
import useQueueState from '../hooks/useQueueState';
import ConnectionIndicator from '../components/ConnectionIndicator';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import { Stethoscope, Clock } from 'lucide-react';

const DisplayPage = () => {
  const { queueState, connectionStatus, toast } = useQueueState();

  const entries    = queueState?.entries || [];
  const stats      = queueState?.stats;
  const inProgress = entries.find(e => e.status === 'IN_PROGRESS');
  const waiting    = entries.filter(e => e.status === 'WAITING');
  const nextUp     = waiting[0];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <Stethoscope size={18} className="text-blue-600" />
          <div className="flex flex-col sm:flex-row sm:items-baseline">
             <span className="text-sm font-bold text-slate-900">Queue Cure</span>
             <span className="text-[10px] sm:text-xs text-slate-400 sm:ml-1">Patient Display</span>
          </div>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left bg-slate-50 lg:bg-transparent p-6 lg:p-0 rounded-2xl lg:rounded-none">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 lg:mb-4">Now Serving</p>

          {inProgress ? (
            <>
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold text-slate-900 leading-none mb-3">
                #{inProgress.tokenNumber}
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-slate-700 mb-4">
                {inProgress.patientName}
              </div>
              <StatusBadge status="IN_PROGRESS" />
            </>
          ) : (
            <>
              <div className="text-7xl sm:text-8xl md:text-9xl font-bold text-slate-200 leading-none mb-3">—</div>
              <div className="text-base sm:text-lg text-slate-400">No patient in progress</div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 md:gap-5 w-full">
          <div className="border border-gray-200 rounded-xl p-4 md:p-6 bg-white shadow-sm w-full">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Up Next</p>
            {nextUp ? (
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-100 text-amber-800 font-bold text-base md:text-lg flex items-center justify-center flex-shrink-0">
                  {nextUp.tokenNumber}
                </div>
                <div className="min-w-0">
                  <div className="text-base md:text-lg font-semibold text-slate-900 truncate">{nextUp.patientName}</div>
                  <div className="text-xs md:text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock size={12} className="flex-shrink-0" /> Est. wait: ~{nextUp.estimatedWaitMinutes} min
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No patients waiting</p>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden w-full flex flex-col max-h-[400px] lg:max-h-none">
            <div className="px-4 md:px-6 py-3 border-b border-gray-100 bg-slate-50 sticky top-0 z-10">
              <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Waiting Queue ({waiting.length})
              </p>
            </div>
            {waiting.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6 md:py-8">Queue is empty</p>
            ) : (
              <div className="overflow-y-auto">
                {waiting.map((entry, i) => (
                  <div key={entry.id} className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 ${
                    i < waiting.length - 1 ? 'border-b border-gray-100' : ''
                  }`}>
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {entry.tokenNumber}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-800 truncate">{entry.patientName}</div>
                    <div className="text-xs text-slate-500 flex-shrink-0">~{entry.estimatedWaitMinutes} min</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 w-full mt-2 lg:mt-0">
            <div className="border border-gray-200 rounded-lg p-3 md:p-4 text-center bg-white shadow-sm flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-bold text-slate-900">{stats?.totalWaiting ?? 0}</div>
              <div className="text-[9px] md:text-xs text-slate-500 uppercase tracking-wide mt-1 truncate">Waiting</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 md:p-4 text-center bg-white shadow-sm flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-bold text-slate-900">{stats?.currentlyInProgress ?? 0}</div>
              <div className="text-[9px] md:text-xs text-slate-500 uppercase tracking-wide mt-1 truncate">In Progress</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 md:p-4 text-center bg-white shadow-sm flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-bold text-slate-900">{stats?.avgConsultMinutes ?? 10}</div>
              <div className="text-[9px] md:text-xs text-slate-500 uppercase tracking-wide mt-1 truncate">Avg Min</div>
            </div>
          </div>
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
};

export default DisplayPage;