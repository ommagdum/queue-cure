
import React from 'react';
import { Users, UserCheck, Clock, Timer } from 'lucide-react';
const StatCard = ({ Icon, label, value, valueClass = 'text-slate-900' }) => (
  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 flex-1 min-w-[130px] shadow-sm">
    <div className="w-8 h-8 rounded-md bg-slate-50 border border-gray-200 flex items-center justify-center text-slate-500 flex-shrink-0">
      <Icon size={15} />
    </div>
    <div>
      <div className={`text-lg font-bold leading-none ${valueClass}`}>{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wide mt-1 font-medium">{label}</div>
    </div>
  </div>
);
const StatsBar = ({ stats }) => {
  if (!stats) return null;
  const { totalWaiting, currentlyInProgress, avgConsultMinutes, estimatedNextWaitMinutes } = stats;
  return (
    <div className="flex gap-3 mb-5 flex-wrap">
      <StatCard Icon={Users}      label="Waiting"     value={totalWaiting}                      valueClass="text-amber-700" />
      <StatCard Icon={UserCheck}  label="In Progress" value={currentlyInProgress}               valueClass="text-blue-700" />
      <StatCard Icon={Clock}      label="Avg Consult" value={`${avgConsultMinutes} min`}        valueClass="text-slate-900" />
      <StatCard Icon={Timer}      label="Next Wait"   value={`~${estimatedNextWaitMinutes} min`} valueClass="text-slate-900" />
    </div>
  );
};
export default StatsBar;