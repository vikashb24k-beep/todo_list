import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <div>
          <h1 className="font-heading text-xl font-semibold text-slate-900 dark:text-white">Smart Todo Reminder</h1>
          <p className="font-body text-xs text-slate-500 dark:text-slate-400">Welcome back, {user?.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            type="button"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
          <button
            onClick={logout}
            className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
