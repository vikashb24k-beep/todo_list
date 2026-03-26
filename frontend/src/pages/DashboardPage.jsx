import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import PriorityFilter from "../components/PriorityFilter";
import { createTask, deleteTask, getTasks, updateTask } from "../services/taskApi";

function getLocalDateStamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isScheduledForToday(task, todayStamp) {
  if (task.repeatType === "daily") {
    return true;
  }

  if (task.repeatType === "dates") {
    return Array.isArray(task.repeatDates) && task.repeatDates.includes(todayStamp);
  }

  return task.dueDate === todayStamp;
}

const defaultFormState = {
  title: "",
  time: "",
  priority: "medium",
  repeatType: "none",
  dueDate: getLocalDateStamp(new Date()),
  repeatDates: [],
};

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [formState, setFormState] = useState(defaultFormState);
  const [editingTaskId, setEditingTaskId] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const isEditing = Boolean(editingTaskId);

  const filteredTasks = useMemo(() => {
    if (priorityFilter === "all") {
      return tasks;
    }
    return tasks.filter((task) => task.priority === priorityFilter);
  }, [tasks, priorityFilter]);

  async function fetchTasks() {
    try {
      setIsLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch tasks.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }

    const id = setInterval(() => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const todayStamp = getLocalDateStamp(now);

      tasks
        .filter((task) => !task.completed && task.time === currentTime && isScheduledForToday(task, todayStamp))
        .forEach((task) => {
          const key = `${task._id}-${todayStamp}-${currentTime}`;

          if (sessionStorage.getItem(key)) {
            return;
          }

          if (Notification.permission === "granted") {
            new Notification("Task Reminder", {
              body: `It's time to: ${task.title}`,
            });
          } else {
            toast(`Reminder: ${task.title}`, { icon: "?" });
          }

          sessionStorage.setItem(key, "sent");
        });
    }, 30000);

    return () => clearInterval(id);
  }, [tasks]);

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      toast.error("Browser notifications are not supported.");
      return;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      toast.success("Browser notifications enabled.");
    } else {
      toast("Notifications were not enabled.");
    }
  }

  function resetForm() {
    setFormState(defaultFormState);
    setEditingTaskId("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const payload = {
        ...formState,
        repeatDates: [...new Set(formState.repeatDates || [])].sort(),
      };

      if (isEditing) {
        await updateTask(editingTaskId, payload);
        toast.success("Task updated.");
      } else {
        await createTask(payload);
        toast.success("Task created.");
      }

      resetForm();
      await fetchTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(task) {
    setEditingTaskId(task._id);
    setFormState({
      title: task.title,
      time: task.time,
      priority: task.priority,
      repeatType: task.repeatType || "none",
      dueDate: task.dueDate || getLocalDateStamp(new Date()),
      repeatDates: task.repeatDates || [],
    });
  }

  async function handleDelete(taskId) {
    try {
      setActionLoadingId(taskId);
      await deleteTask(taskId);
      toast.success("Task deleted.");
      await fetchTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete task.");
    } finally {
      setActionLoadingId("");
    }
  }

  async function handleToggleComplete(task) {
    try {
      setActionLoadingId(task._id);
      await updateTask(task._id, { completed: !task.completed });
      toast.success(task.completed ? "Task marked incomplete." : "Task marked complete.");
      await fetchTasks();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update task status.");
    } finally {
      setActionLoadingId("");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold text-slate-900 dark:text-white">Your Dashboard</h2>
          <button
            type="button"
            onClick={enableBrowserNotifications}
            className="rounded-lg bg-cyan-500 px-4 py-2 font-body text-sm font-semibold text-white transition hover:bg-cyan-600"
          >
            Enable Notifications
          </button>
        </div>

        <TaskForm
          formState={formState}
          setFormState={setFormState}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
        />

        <section className="mt-6">
          <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />

          {isLoading ? (
            <Spinner label="Loading your tasks..." />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              actionLoadingId={actionLoadingId}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
