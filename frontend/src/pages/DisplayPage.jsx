
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
      <header className="bg-white border-b border-gray-200 px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Stethoscope size={18} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-900">Queue Cure</span>
          <span className="text-xs text-slate-400 ml-1">Patient Display</span>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-10 grid grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-start">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Now Serving</p>
          {inProgress ? (
            <>
              <div className="text-9xl font-bold text-slate-900 leading-none mb-3">
                #{inProgress.tokenNumber}
              </div>
              <div className="text-2xl font-semibold text-slate-700 mb-4">
                {inProgress.patientName}
              </div>
              <StatusBadge status="IN_PROGRESS" />
            </>
          ) : (
            <>
              <div className="text-9xl font-bold text-slate-200 leading-none mb-3">—</div>
              <div className="text-lg text-slate-400">No patient in progress</div>
            </>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Up Next</p>
            {nextUp ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 font-bold text-lg flex items-center justify-center flex-shrink-0">
                  {nextUp.tokenNumber}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{nextUp.patientName}</div>
                  <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock size={12} /> Est. wait: ~{nextUp.estimatedWaitMinutes} min
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No patients waiting</p>
            )}
          </div>
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-100 bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Waiting Queue ({waiting.length})
              </p>
            </div>
            {waiting.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Queue is empty</p>
            ) : (
              <div>
                {waiting.map((entry, i) => (
                  <div key={entry.id} className={`flex items-center gap-4 px-6 py-3.5 ${
                    i < waiting.length - 1 ? 'border-b border-gray-100' : ''
                  }`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {entry.tokenNumber}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-800">{entry.patientName}</div>
                    <div className="text-xs text-slate-500">~{entry.estimatedWaitMinutes} min</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="border border-gray-200 rounded-lg p-4 text-center bg-white shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{stats?.totalWaiting ?? 0}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Waiting</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center bg-white shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{stats?.currentlyInProgress ?? 0}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">In Progress</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 text-center bg-white shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{stats?.avgConsultMinutes ?? 10}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Avg Min</div>
            </div>
          </div>
        </div>
      </main>
      <Toast toast={toast} />
    </div>
  );
};
export default DisplayPage;