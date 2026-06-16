import React, { useState } from 'react';

const CheckInForm = ({ onCheckIn, loading }) => {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;         
    await onCheckIn(trimmed);
    setName('');                 
  };

  // Allow submitting with Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const containerStyles = {
    display: 'flex',
    gap: '12px',
    marginBottom: 'var(--space-lg)',
    alignItems: 'center',
  };

  const inputStyles = {
    flex: 1,
    height: '48px',
    padding: '0 20px',
    borderRadius: 'var(--radius-pill)',
    border: '1.5px solid var(--color-border-subtle)',
    fontFamily: 'var(--font-family-base)',
    fontSize: 'var(--font-size-body)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-bg-white)',
    outline: 'none',
    transition: 'var(--transition-fast)',
    boxShadow: 'var(--shadow-card)',
  };

  const inputFocusStyles = {
    borderColor: 'var(--color-primary-blue)',
    boxShadow: '0 0 0 3px rgba(27, 111, 242, 0.12)',
  };

  const buttonStyles = {
    height: '48px',
    padding: '0 28px',
    borderRadius: 'var(--radius-pill)',
    border: 'none',
    background: 'var(--color-primary-blue)',
    color: '#fff',
    fontFamily: 'var(--font-family-base)',
    fontWeight: 'var(--font-weight-semibold)',
    fontSize: 'var(--font-size-body)',
    cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
    opacity: loading || !name.trim() ? 0.65 : 1,
    transition: 'var(--transition-fast)',
    boxShadow: 'var(--shadow-button)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };

  const [focused, setFocused] = useState(false);

  return (
    <div style={containerStyles}>
      <input
        id="patient-name-input"
        type="text"
        placeholder="Enter patient name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={loading}
        style={{ ...inputStyles, ...(focused ? inputFocusStyles : {}) }}
        autoComplete="off"
      />
      <button
        id="check-in-btn"
        onClick={handleSubmit}
        disabled={loading || !name.trim()}
        style={buttonStyles}
      >
        {loading ? 'Checking in…' : '+ Check In'}
      </button>
    </div>
  );
};

export default CheckInForm;