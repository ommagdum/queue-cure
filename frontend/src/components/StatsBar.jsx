import React from 'react';
import { Users, UserCheck, Clock, Timer } from 'lucide-react';

const StatCard = ({ Icon, label, value, valueClass = 'text-slate-900' }) => (
  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 md:p-4 shadow-sm">
    <div className="w-8 h-8 rounded-md bg-slate-50 border border-gray-200 flex items-center justify-center text-slate-500 flex-shrink-0">
      <Icon size={15} />
    </div>
    <div className="min-w-0">
      <div className={`text-lg md:text-xl font-bold leading-none truncate ${valueClass}`}>{value}</div>
      <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide mt-1 font-medium truncate">{label}</div>
    </div>
  </div>
);

const StatsBar = ({ stats }) => {
  if (!stats) return null;
  const { totalWaiting, currentlyInProgress, avgConsultMinutes, estimatedNextWaitMinutes } = stats;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
      <StatCard Icon={Users}      label="Waiting"     value={totalWaiting}                      valueClass="text-amber-700" />
      <StatCard Icon={UserCheck}  label="In Progress" value={currentlyInProgress}               valueClass="text-blue-700" />
      <StatCard Icon={Clock}      label="Avg Consult" value={`${avgConsultMinutes} min`}        valueClass="text-slate-900" />
      <StatCard Icon={Timer}      label="Next Wait"   value={`~${estimatedNextWaitMinutes} min`} valueClass="text-slate-900" />
    </div>
  );
};

export default StatsBar;