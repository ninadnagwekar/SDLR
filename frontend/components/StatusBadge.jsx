const STYLES = {
  OPEN: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-slate-100 text-slate-700',
  OVERDUE: 'bg-red-100 text-red-800',
  PENDING: 'bg-slate-100 text-slate-700',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
