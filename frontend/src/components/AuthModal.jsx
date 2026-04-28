import React, { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full mx-auto overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0b1120] to-[#020617] shadow-2xl transition-all duration-300 ease-out transform scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl opacity-60"></div>
        <div className="relative p-8">
          <button
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors text-2xl"
            onClick={onClose}
          >
            ×
          </button>
          <div className="bg-white/5 rounded-2xl p-1 mb-8 grid grid-cols-2 gap-1">
            <button
              className={`rounded-2xl py-3 font-semibold transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button
              className={`rounded-2xl py-3 font-semibold transition-all duration-200 ${
                activeTab === "signup"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("signup")}
            >
              Signup
            </button>
          </div>
          {activeTab === "login" ? (
            <LoginForm onSwitch={() => setActiveTab("signup")} />
          ) : (
            <SignupForm onSwitch={() => setActiveTab("login")} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
