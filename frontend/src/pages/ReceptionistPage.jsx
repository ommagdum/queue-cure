import React, { useState } from 'react';
import useQueueState from '../hooks/useQueueState';
import { checkInPatient, callNextPatient, markDone, markNoShow } from '../api/queueApi';
import { API_BASE_URL } from '../config/api';
import ConnectionIndicator from '../components/ConnectionIndicator';
import StatsBar from '../components/StatsBar';
import CheckInForm from '../components/CheckInForm';
import PatientRow from '../components/PatientRow';
import Toast from '../components/Toast';
import { Stethoscope, ChevronRight, AlertCircle, Zap, CheckCircle2, XCircle } from 'lucide-react';

const ReceptionistPage = () => {
  const { queueState, loading, error, connectionStatus, loadQueue, showToast, toast } = useQueueState();
  const [actionLoading, setActionLoading] = useState(false);
  const [raceResult, setRaceResult] = useState(null);
  const [raceFiring, setRaceFiring] = useState(false);

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

  const handleRaceDemo = async () => {
    setRaceFiring(true);
    setRaceResult(null);
    const fire = () => fetch(`${API_BASE_URL}/api/v1/queue/call-next`, { method: 'POST' });
    const [r1, r2] = await Promise.all([fire(), fire()]);

    const parse = async (res) => {
      if (res.status === 204) return { ok: false, error: 'No waiting patients (queue empty)' };
      if (res.ok) {
        const d = await res.json();
        const called = d.entries?.find(e => e.status === 'IN_PROGRESS');
        return { ok: true, token: called?.tokenNumber, name: called?.patientName };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || err.message || `HTTP ${res.status} — blocked by DB lock` };
    };

    const results = await Promise.all([parse(r1), parse(r2)]);
    setRaceResult(results);
    setRaceFiring(false);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl border border-red-100 max-w-sm w-full">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <Stethoscope size={20} className="text-blue-600" />
          <div className="flex flex-col sm:flex-row sm:items-baseline">
            <span className="text-sm font-bold text-slate-900">Queue Cure</span>
            <span className="text-[10px] sm:text-xs text-slate-500 sm:ml-2">Receptionist Dashboard</span>
          </div>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-6">
        <StatsBar stats={queueState?.stats} />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          <CheckInForm onCheckIn={handleCheckIn} loading={actionLoading} />
          <button
            id="call-next-btn"
            onClick={handleCallNext}
            disabled={actionLoading}
            className="inline-flex justify-center items-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full sm:w-auto"
          >
            Call Next <ChevronRight size={15} />
          </button>
        </div>

        <div className="mb-5 border border-amber-200 rounded-lg bg-amber-50 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-amber-200">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Race Condition Demo</span>
              <p className="text-xs text-amber-700 mt-0.5">Ensure exactly <strong>1 patient is WAITING</strong>, then fire. One request wins the DB lock — the other is blocked.</p>
            </div>
            <button
              id="race-demo-btn"
              onClick={handleRaceDemo}
              disabled={raceFiring || actionLoading}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto"
            >
              <Zap size={13} />
              {raceFiring ? 'Firing...' : 'Trigger Race'}
            </button>
          </div>

          {raceResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-amber-200">
              {raceResult.map((res, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 ${
                  res.ok ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {res.ok
                    ? <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    : <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className={`text-xs font-bold ${ res.ok ? 'text-emerald-800' : 'text-red-700'}`}>
                      Request {i + 1}: {res.ok ? 'Succeeded' : 'Blocked by DB Lock'}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {res.ok ? `Called #${res.token} — ${res.name}` : res.error}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-slate-50">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Today's Queue
              {queueState?.entries?.length > 0 && (
                <span className="ml-2 text-slate-400 normal-case font-normal">
                  {queueState.entries.length} patients
                </span>
              )}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading queue...</div>
          ) : queueState?.entries?.length === 0 ? (
            <div className="py-16 text-center px-4">
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