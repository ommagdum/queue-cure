import React from 'react';
import StatusBadge from './StatusBadge';
import WaitTimeBadge from './WaitTimeBadge';

const formatTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PatientRow = ({ entry, onDone, onNoShow, loading }) => {
  const { id, patientName, tokenNumber, status, checkInTime, estimatedWaitMinutes } = entry;

  const isActive  = status === 'WAITING' || status === 'IN_PROGRESS';
  const isDimmed  = status === 'DONE' || status === 'NO_SHOW';

  const rowStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    padding: '16px 20px',
    background: isDimmed ? '#FAFAFA' : 'var(--color-bg-white)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: isDimmed ? 'none' : 'var(--shadow-card)',
    opacity: isDimmed ? 0.6 : 1,
    transition: 'var(--transition-base)',
    marginBottom: '10px',
  };

  // Token number circle
  const tokenStyles = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: status === 'IN_PROGRESS'
      ? 'var(--color-accent-orange)'
      : status === 'DONE'
      ? 'var(--color-status-done-bg)'
      : 'var(--color-primary-blue)',
    color: status === 'DONE' ? 'var(--color-status-done)' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'var(--font-weight-bold)',
    fontSize: 'var(--font-size-h3)',
    flexShrink: 0,
  };

  // Patient info section
  const infoStyles = {
    flex: 1,
    minWidth: 0,
  };

  const nameStyles = {
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-primary)',
    marginBottom: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const timeStyles = {
    fontSize: 'var(--font-size-small)',
    color: 'var(--color-text-secondary)',
  };

  // Badges group
  const badgesStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  };

  // Action buttons group
  const actionsStyles = {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  };

  const btnBase = {
    border: 'none',
    borderRadius: 'var(--radius-pill)',
    padding: '8px 18px',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-small)',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'var(--transition-fast)',
  };

  const doneBtn = {
    ...btnBase,
    background: 'var(--color-status-done)',
    color: '#fff',
  };

  const noShowBtn = {
    ...btnBase,
    background: 'var(--color-bg-white)',
    color: 'var(--color-text-secondary)',
    border: '1.5px solid var(--color-border-subtle)',
  };

  return (
    <div style={rowStyles}>

      <div style={tokenStyles}>#{tokenNumber}</div>

      <div style={infoStyles}>
        <div style={nameStyles}>{patientName}</div>
        <div style={timeStyles}>Checked in at {formatTime(checkInTime)}</div>
      </div>

      <div style={badgesStyles}>
        <WaitTimeBadge minutes={estimatedWaitMinutes} status={status} />
        <StatusBadge status={status} />
      </div>

      {status === 'IN_PROGRESS' && (
        <div style={actionsStyles}>
          <button
            style={doneBtn}
            onClick={() => onDone(id)}
            disabled={loading}
            tabIndex={0}
          >
            ✓ Done
          </button>
          <button
            style={noShowBtn}
            onClick={() => onNoShow(id)}
            disabled={loading}
            tabIndex={0}
          >
            No Show
          </button>
        </div>
      )}

      {isDimmed && (
        <div style={{ width: '140px', flexShrink: 0 }} />
      )}

    </div>
  );
};

export default PatientRow;