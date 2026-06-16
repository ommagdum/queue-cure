import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

const CheckInForm = ({ onCheckIn, loading }) => {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onCheckIn(trimmed);
    setName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-md">
      <input
        id="patient-name-input"
        type="text"
        placeholder="Enter patient name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        autoComplete="off"
        className="w-full h-10 px-4 text-sm border border-gray-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
      />
      <button
        id="check-in-btn"
        onClick={handleSubmit}
        disabled={loading || !name.trim()}
        className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto"
      >
        <UserPlus size={15} />
        Check In
      </button>
    </div>
  );
};

export default CheckInForm;