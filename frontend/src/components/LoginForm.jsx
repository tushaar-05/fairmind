import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

const LoginForm = ({ onSwitch, onSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser({ email, password });
      onSuccess?.();
      navigate("/overview");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/wrong-password"
            ? "Incorrect password. Please try again."
            : err.message || "Unable to login. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold mb-6 text-white">Login</h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
          placeholder="you@company.com"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
          placeholder="Enter your password"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-linear-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {error && (
        <p className="mt-4 text-center text-sm text-red-400">{error}</p>
      )}
      <p className="text-center mt-4 text-gray-400">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-purple-300 hover:text-white transition"
        >
          Switch to Signup
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
