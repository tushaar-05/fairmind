import React, { useState } from "react";

const SignupForm = ({ onSwitch }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organization, setOrganization] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Signup:", { fullName, email, password, organization });
    // Handle signup logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-3xl font-bold mb-6 text-white">Signup</h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
          placeholder="Jane Doe"
          required
        />
      </div>
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
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
          placeholder="Choose a password"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
          placeholder="Re-enter your password"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">
          Organization (optional)
        </label>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
          placeholder="FairMind Labs"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition duration-200 hover:opacity-90"
      >
        Signup
      </button>
      <p className="text-center mt-4 text-gray-400">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-purple-300 hover:text-white transition"
        >
          Switch to Login
        </button>
      </p>
    </form>
  );
};

export default SignupForm;
