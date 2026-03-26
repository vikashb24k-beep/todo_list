function PriorityFilter({ value, onChange }) {
  const options = ["all", "low", "medium", "high"];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <p className="font-body text-sm font-semibold text-slate-600 dark:text-slate-300">Filter by priority:</p>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1 text-sm capitalize transition ${
            value === option
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default PriorityFilter;
