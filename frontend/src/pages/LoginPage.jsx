import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      await login(formState);
      toast.success("Welcome back.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Login to manage your smart reminders.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formState.password}
            onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
