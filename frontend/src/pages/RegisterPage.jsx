import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      await register(formState);
      toast.success("Registration successful.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to register.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Start scheduling smart reminders for your day.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
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
            {isSubmitting ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
