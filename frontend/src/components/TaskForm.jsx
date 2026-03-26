function getLocalDateStamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function TaskForm({ formState, setFormState, onSubmit, onCancel, isSubmitting, isEditing }) {
  const repeatType = formState.repeatType || "none";

  const addRepeatDate = (dateValue) => {
    if (!dateValue) {
      return;
    }

    setFormState((prev) => {
      const mergedDates = [...new Set([...(prev.repeatDates || []), dateValue])].sort();
      return { ...prev, repeatDates: mergedDates };
    });
  };

  const removeRepeatDate = (dateValue) => {
    setFormState((prev) => ({
      ...prev,
      repeatDates: (prev.repeatDates || []).filter((date) => date !== dateValue),
    }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
        {isEditing ? "Edit Task" : "Add New Task"}
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="font-body text-sm text-slate-600 dark:text-slate-300">Task Title</label>
          <input
            type="text"
            value={formState.title}
            onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Example: Prepare project demo"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-body text-sm text-slate-800 outline-none ring-emerald-200 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
        </div>

        <div>
          <label className="font-body text-sm text-slate-600 dark:text-slate-300">Time</label>
          <input
            type="time"
            value={formState.time}
            onChange={(event) => setFormState((prev) => ({ ...prev, time: event.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-body text-sm text-slate-800 outline-none ring-emerald-200 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            required
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="font-body text-sm text-slate-600 dark:text-slate-300">Priority</label>
        {["low", "medium", "high"].map((priority) => (
          <button
            key={priority}
            type="button"
            onClick={() => setFormState((prev) => ({ ...prev, priority }))}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition ${
              formState.priority === priority
                ? "bg-emerald-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            {priority}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="font-body text-sm font-semibold text-slate-700 dark:text-slate-200">Repeat Schedule</p>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                repeatType: "none",
                repeatDates: [],
                dueDate: prev.dueDate || getLocalDateStamp(new Date()),
              }))
            }
            className={`rounded-full px-3 py-1 text-sm transition ${
              repeatType === "none"
                ? "bg-cyan-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            One-time
          </button>
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                repeatType: "daily",
                dueDate: "",
                repeatDates: [],
              }))
            }
            className={`rounded-full px-3 py-1 text-sm transition ${
              repeatType === "daily"
                ? "bg-cyan-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                repeatType: "dates",
                dueDate: "",
                repeatDates: prev.repeatDates || [],
              }))
            }
            className={`rounded-full px-3 py-1 text-sm transition ${
              repeatType === "dates"
                ? "bg-cyan-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            Specific dates
          </button>
        </div>

        {repeatType === "none" && (
          <div className="mt-3">
            <label className="font-body text-sm text-slate-600 dark:text-slate-300">Due Date</label>
            <input
              type="date"
              value={formState.dueDate || ""}
              onChange={(event) => setFormState((prev) => ({ ...prev, dueDate: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-body text-sm text-slate-800 outline-none ring-emerald-200 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>
        )}

        {repeatType === "dates" && (
          <div className="mt-3">
            <label className="font-body text-sm text-slate-600 dark:text-slate-300">Pick dates to repeat</label>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                type="date"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-body text-sm text-slate-800 outline-none ring-emerald-200 transition focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                onChange={(event) => {
                  addRepeatDate(event.target.value);
                  event.target.value = "";
                }}
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {(formState.repeatDates || []).map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => removeRepeatDate(date)}
                  className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-200 dark:bg-cyan-900 dark:text-cyan-200"
                  title="Click to remove"
                >
                  {date} x
                </button>
              ))}
            </div>
            {(formState.repeatDates || []).length === 0 && (
              <p className="mt-2 text-xs text-rose-500">Add at least one date for this repeat mode.</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-500 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 font-body text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
