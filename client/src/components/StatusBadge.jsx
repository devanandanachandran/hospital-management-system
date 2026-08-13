function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-accent-100 text-accent-600 border-accent-300/60',
    confirmed: 'bg-brand-50 text-brand-600 border-brand-200',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-red-50 text-red-500 border-red-200',
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
