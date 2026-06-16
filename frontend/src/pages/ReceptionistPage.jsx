// pages/ReceptionistPage.jsx
import React, { useState } from 'react';
import useQueueState from '../hooks/useQueueState';
import { checkInPatient, callNextPatient, markDone, markNoShow } from '../api/queueApi';
import ConnectionIndicator from '../components/ConnectionIndicator';
import StatsBar from '../components/StatsBar';
import CheckInForm from '../components/CheckInForm';
import PatientRow from '../components/PatientRow';
import Toast from '../components/Toast';
import { Stethoscope, ChevronRight, AlertCircle } from 'lucide-react';

const ReceptionistPage = () => {
  const { queueState, loading, error, connectionStatus, loadQueue, showToast, toast } = useQueueState();
  const [actionLoading, setActionLoading] = useState(false);

  const handleCheckIn = async (name) => {
    setActionLoading(true);
    try {
      await checkInPatient(name);
      showToast(`${name} checked in`, 'success');
    } catch {
      showToast('Check-in failed. Try again.', 'error');
    } finally { setActionLoading(false); }
  };

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const result = await callNextPatient();
      if (!result) showToast('No patients waiting', 'info');
    } catch {
      showToast('Could not call next patient.', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDone = async (id) => {
    setActionLoading(true);
    try {
      await markDone(id);
      showToast('Consultation complete', 'success');
    } catch (err) {
      showToast('Action conflict — queue refreshed', 'conflict');
      await loadQueue();
    } finally { setActionLoading(false); }
  };

  const handleNoShow = async (id) => {
    setActionLoading(true);
    try {
      await markNoShow(id);
      showToast('Marked as no-show', 'info');
    } catch {
      showToast('Action conflict — queue refreshed', 'conflict');
      await loadQueue();
    } finally { setActionLoading(false); }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <Stethoscope size={20} className="text-blue-600" />
          <div>
            <span className="text-sm font-bold text-slate-900">Queue Cure</span>
            <span className="text-xs text-slate-500 ml-2">Receptionist Dashboard</span>
          </div>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-6">

        <StatsBar stats={queueState?.stats} />

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <CheckInForm onCheckIn={handleCheckIn} loading={actionLoading} />
          <button
            id="call-next-btn"
            onClick={handleCallNext}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            Call Next <ChevronRight size={15} />
          </button>
        </div>

        {/* Queue Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-200 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Today's Queue
              {queueState?.entries?.length > 0 && (
                <span className="ml-2 text-slate-400 normal-case font-normal">
                  {queueState.entries.length} patients
                </span>
              )}
            </span>
          </div>

          {/* Queue Rows */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading queue...</div>
          ) : queueState?.entries?.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-slate-900 font-semibold">Queue is empty</p>
              <p className="text-slate-500 text-sm mt-1">Check in the first patient above</p>
            </div>
          ) : (
            queueState?.entries?.map((entry) => (
              <PatientRow
                key={entry.id}
                entry={entry}
                onDone={handleDone}
                onNoShow={handleNoShow}
                loading={actionLoading}
              />
            ))
          )}
        </div>
      </main>

      <Toast toast={toast} />
    </div>
  );
};

export default ReceptionistPage;