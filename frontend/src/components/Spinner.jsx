function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[30vh] items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-500 dark:border-t-slate-100" />
      <p className="font-body text-sm">{label}</p>
    </div>
  );
}

export default Spinner;
