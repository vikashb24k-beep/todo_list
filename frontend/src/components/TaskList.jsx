import TaskCard from "./TaskCard";

function TaskList({ tasks, onEdit, onDelete, onToggleComplete, actionLoadingId }) {
  if (!tasks.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-card dark:border-slate-700 dark:bg-slate-900">
        <p className="font-body text-sm text-slate-500 dark:text-slate-400">No tasks found for this filter.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          actionLoadingId={actionLoadingId}
        />
      ))}
    </ul>
  );
}

export default TaskList;
