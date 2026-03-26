function priorityStyles(priority) {
  if (priority === "high") return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200";
  if (priority === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200";
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";
}

function getRepeatLabel(task) {
  if (task.repeatType === "daily") {
    return "Repeats daily";
  }

  if (task.repeatType === "dates") {
    const dateList = task.repeatDates || [];
    return dateList.length ? `Repeats on: ${dateList.join(", ")}` : "Specific dates";
  }

  return `One-time on: ${task.dueDate || "No date"}`;
}

function TaskCard({ task, onEdit, onDelete, onToggleComplete, actionLoadingId }) {
  const isBusy = actionLoadingId === task._id;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-card transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`font-heading text-base font-semibold ${task.completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
            {task.title}
          </p>
          <p className="mt-1 font-body text-sm text-slate-500 dark:text-slate-400">Due at {task.time}</p>
          <p className="mt-1 font-body text-xs text-cyan-700 dark:text-cyan-300">{getRepeatLabel(task)}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${priorityStyles(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          disabled={isBusy}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          {task.completed ? "Mark Incomplete" : "Mark Complete"}
        </button>
        <button
          type="button"
          onClick={() => onEdit(task)}
          disabled={isBusy}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task._id)}
          disabled={isBusy}
          className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          {isBusy ? "Deleting..." : "Delete"}
        </button>
      </div>
    </li>
  );
}

export default TaskCard;
