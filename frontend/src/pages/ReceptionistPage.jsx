import React, { useState } from 'react';
import useQueueState from '../hooks/useQueueState';
import { checkInPatient, callNextPatient, markDone, markNoShow } from '../api/queueApi';
import ConnectionIndicator from '../components/ConnectionIndicator';
import StatsBar from '../components/StatsBar';
import CheckInForm from '../components/CheckInForm';
import PatientRow from '../components/PatientRow';
import Toast from '../components/Toast';

const ReceptionistPage = () => {
  const { queueState, loading, error, connectionStatus, loadQueue, showToast, toast } = useQueueState();
  const [actionLoading, setActionLoading] = useState(false);

  const handleCheckIn = async (name) => {
    setActionLoading(true);
    try {
      await checkInPatient(name);
      showToast(`${name} checked in successfully ✓`, 'success');
    } catch {
      showToast('Check-in failed. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const result = await callNextPatient();
      if (!result) {
        showToast('No patients waiting', 'info');
      }
    } catch {
      showToast('Could not call next patient.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDone = async (id) => {
    setActionLoading(true);
    try {
      await markDone(id);
      showToast('Consultation marked complete ✓', 'success');
    } catch (err) {
      if (err.message?.includes('conflict')) {
        showToast('Action conflict — queue refreshed', 'conflict');
        await loadQueue();
      } else {
        showToast(err.message || 'Action failed', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async (id) => {
    setActionLoading(true);
    try {
      await markNoShow(id);
      showToast('Marked as no-show', 'info');
    } catch (err) {
      if (err.message?.includes('conflict')) {
        showToast('Action conflict — queue refreshed', 'conflict');
        await loadQueue();
      } else {
        showToast(err.message || 'Action failed', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const pageStyles = {
    minHeight: '100vh',
    background: 'var(--color-bg-cream)',
    fontFamily: 'var(--font-family-base)',
  };

  const headerStyles = {
    background: 'var(--color-primary-blue)',
    padding: '0 var(--space-xl)',
    height: 'var(--header-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 16px rgba(27,111,242,0.2)',
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#fff',
  };

  const logoTitleStyles = {
    fontSize: 'var(--font-size-h3)',
    fontWeight: 'var(--font-weight-bold)',
    letterSpacing: '-0.01em',
  };

  const logoSubStyles = {
    fontSize: 'var(--font-size-xs)',
    opacity: 0.75,
    fontWeight: 'var(--font-weight-medium)',
  };

  const mainStyles = {
    maxWidth: 'var(--container-max-width)',
    margin: '0 auto',
    padding: 'var(--space-xl) var(--space-xl)',
  };

  const queueHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-md)',
  };

  const queueTitleStyles = {
    fontSize: 'var(--font-size-h3)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-text-primary)',
  };

  const callNextBtnStyles = {
    height: '44px',
    padding: '0 24px',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    background: 'var(--color-accent-orange)',
    color: '#fff',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-body)',
    cursor: actionLoading ? 'not-allowed' : 'pointer',
    opacity: actionLoading ? 0.7 : 1,
    transition: 'var(--transition-fast)',
    boxShadow: '0 4px 14px rgba(255,140,59,0.35)',
  };

  const emptyStyles = {
    textAlign: 'center',
    padding: 'var(--space-section) 0',
    color: 'var(--color-text-secondary)',
  };


  if (error) {
    return (
      <div style={{ ...pageStyles, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-reconnecting)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-semibold)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>

      <header style={headerStyles}>
        <div style={logoStyles}>
          <span style={{ fontSize: '24px' }}>🏥</span>
          <div>
            <div style={logoTitleStyles}>Queue Cure</div>
            <div style={logoSubStyles}>Receptionist Dashboard</div>
          </div>
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      <main style={mainStyles}>

        <StatsBar stats={queueState?.stats} />

        <CheckInForm onCheckIn={handleCheckIn} loading={actionLoading} />

        <div style={queueHeaderStyles}>
          <h2 style={queueTitleStyles}>
            Today's Queue
            {queueState?.entries?.length > 0 && (
              <span style={{
                marginLeft: '10px',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-secondary)',
              }}>
                ({queueState.entries.length} patients)
              </span>
            )}
          </h2>
          <button
            id="call-next-btn"
            style={callNextBtnStyles}
            onClick={handleCallNext}
            disabled={actionLoading}
          >
            📣 Call Next
          </button>
        </div>

        {loading ? (
          <div style={emptyStyles}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <p>Loading queue…</p>
          </div>
        ) : queueState?.entries?.length === 0 ? (
          <div style={emptyStyles}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
            <p style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              Queue is empty
            </p>
            <p style={{ fontSize: 'var(--font-size-body)', marginTop: '8px' }}>
              Check in the first patient above to get started
            </p>
          </div>
        ) : (
          <div>
            {queueState?.entries?.map((entry) => (
              <PatientRow
                key={entry.id}
                entry={entry}
                onDone={handleDone}
                onNoShow={handleNoShow}
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
};

export default ReceptionistPage;