import React from 'react';
import useQueueState from '../hooks/useQueueState';
import ConnectionIndicator from '../components/ConnectionIndicator';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';

const DisplayPage = () => {
  const { queueState, connectionStatus, toast } = useQueueState();

  const entries    = queueState?.entries || [];
  const stats      = queueState?.stats;
  const inProgress = entries.find(e => e.status === 'IN_PROGRESS');
  const waiting    = entries.filter(e => e.status === 'WAITING');
  const nextUp     = waiting[0];

  const pageStyles = {
    minHeight: '100vh',
    background: 'var(--color-bg-cream)',
    fontFamily: 'var(--font-family-base)',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles = {
    background: 'var(--color-primary-blue)',
    padding: '0 var(--space-xl)',
    height: 'var(--header-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyles = {
    color: '#fff',
    fontSize: 'var(--font-size-h3)',
    fontWeight: 'var(--font-weight-bold)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const mainStyles = {
    flex: 1,
    maxWidth: 'var(--container-max-width)',
    margin: '0 auto',
    width: '100%',
    padding: 'var(--space-xl)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-xl)',
    alignItems: 'start',
  };

  // Now serving card
  const nowServingCardStyles = {
    background: inProgress
      ? 'var(--color-primary-blue)'
      : 'var(--color-bg-white)',
    borderRadius: 'var(--radius-lg)',
    padding: '48px',
    textAlign: 'center',
    boxShadow: inProgress
      ? '0 8px 40px rgba(27,111,242,0.25)'
      : 'var(--shadow-card)',
    border: inProgress ? 'none' : '1px solid var(--color-border-subtle)',
    transition: 'var(--transition-base)',
  };

  const nowServingLabelStyles = {
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-semibold)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: inProgress ? 'rgba(255,255,255,0.75)' : 'var(--color-text-secondary)',
    marginBottom: '16px',
  };

  const tokenNumberStyles = {
    fontSize: '96px',
    fontWeight: 'var(--font-weight-bold)',
    color: inProgress ? '#fff' : 'var(--color-border-subtle)',
    lineHeight: 1,
    marginBottom: '12px',
  };

  const patientNameStyles = {
    fontSize: 'var(--font-size-h2)',
    fontWeight: 'var(--font-weight-semibold)',
    color: inProgress ? '#fff' : 'var(--color-text-secondary)',
    marginBottom: '8px',
  };

  // Next up card
  const nextUpCardStyles = {
    background: 'var(--color-bg-white)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--color-border-subtle)',
    marginBottom: 'var(--space-lg)',
  };

  const sectionTitleStyles = {
    fontSize: 'var(--font-size-small)',
    fontWeight: 'var(--font-weight-semibold)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--color-text-secondary)',
    marginBottom: '16px',
  };

  // Waiting list card
  const waitingCardStyles = {
    background: 'var(--color-bg-white)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--color-border-subtle)',
  };

  const waitingRowStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid var(--color-border-subtle)',
  };

  const tokenCircleStyles = (isNext) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: isNext
      ? 'var(--color-accent-yellow)'
      : 'var(--color-bg-cream)',
    color: isNext ? '#8B6200' : 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'var(--font-weight-bold)',
    fontSize: 'var(--font-size-small)',
    flexShrink: 0,
  });

  // Stats strip at bottom
  const statsStripStyles = {
    background: 'var(--color-bg-dark)',
    padding: '20px var(--space-xl)',
    display: 'flex',
    justifyContent: 'center',
    gap: '60px',
  };

  const statItemStyles = {
    textAlign: 'center',
    color: '#fff',
  };

  const statValueStyles = {
    fontSize: 'var(--font-size-h2)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-accent-yellow)',
  };

  const statLabelStyles = {
    fontSize: 'var(--font-size-xs)',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: '4px',
  };

  return (
    <div style={pageStyles}>

      {/* ── Header ── */}
      <header style={headerStyles}>
        <div style={logoStyles}>
          <span>🏥</span> Queue Cure — Patient Display
        </div>
        <ConnectionIndicator status={connectionStatus} />
      </header>

      {/* ── Main Grid ── */}
      <main style={mainStyles}>

        {/* Left: Now Serving */}
        <div style={nowServingCardStyles}>
          <div style={nowServingLabelStyles}>Now Serving</div>
          <div style={tokenNumberStyles}>
            {inProgress ? `#${inProgress.tokenNumber}` : '—'}
          </div>
          <div style={patientNameStyles}>
            {inProgress ? inProgress.patientName : 'No patient in progress'}
          </div>
          {inProgress && (
            <StatusBadge status="IN_PROGRESS" />
          )}
        </div>

        {/* Right: Next Up + Waiting List */}
        <div>

          {/* Next Up */}
          <div style={nextUpCardStyles}>
            <div style={sectionTitleStyles}>Up Next</div>
            {nextUp ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={tokenCircleStyles(true)}>#{nextUp.tokenNumber}</div>
                <div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-h3)' }}>
                    {nextUp.patientName}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)', marginTop: '4px' }}>
                    ⏱ Est. wait: ~{nextUp.estimatedWaitMinutes} min
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-secondary)' }}>No patients waiting</div>
            )}
          </div>

          {/* Waiting List */}
          <div style={waitingCardStyles}>
            <div style={sectionTitleStyles}>
              Waiting Queue ({waiting.length})
            </div>
            {waiting.length === 0 ? (
              <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '24px 0' }}>
                🌿 Queue is empty
              </div>
            ) : (
              waiting.map((entry, index) => (
                <div key={entry.id} style={{
                  ...waitingRowStyles,
                  borderBottom: index === waiting.length - 1 ? 'none' : '1px solid var(--color-border-subtle)',
                }}>
                  <div style={tokenCircleStyles(index === 0)}>
                    #{entry.tokenNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{entry.patientName}</div>
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-small)',
                    color: 'var(--color-text-secondary)',
                  }}>
                    ~{entry.estimatedWaitMinutes} min
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ── Stats Strip ── */}
      <div style={statsStripStyles}>
        <div style={statItemStyles}>
          <div style={statValueStyles}>{stats?.totalWaiting ?? 0}</div>
          <div style={statLabelStyles}>Waiting</div>
        </div>
        <div style={statItemStyles}>
          <div style={statValueStyles}>{stats?.currentlyInProgress ?? 0}</div>
          <div style={statLabelStyles}>In Progress</div>
        </div>
        <div style={statValueStyles !== undefined && statItemStyles}>
          <div style={statValueStyles}>{stats?.avgConsultMinutes ?? 10} min</div>
          <div style={statLabelStyles}>Avg Consult</div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default DisplayPage;