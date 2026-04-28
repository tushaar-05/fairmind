import React from "react";

const Navbar = ({ onOpenModal }) => {
  return (
    <nav className="flex justify-between items-center p-6 bg-gray-900 bg-opacity-80 backdrop-blur-md border-b border-gray-800">
      <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        FairMind
      </div>
      <div className="hidden md:flex space-x-8">
        <a
          href="#features"
          className="text-gray-300 hover:text-purple-400 transition-colors"
        >
          Features
        </a>
        <a
          href="#use-cases"
          className="text-gray-300 hover:text-purple-400 transition-colors"
        >
          Use Cases
        </a>
        <a
          href="#pricing"
          className="text-gray-300 hover:text-purple-400 transition-colors"
        >
          Pricing
        </a>
        <a
          href="#about"
          className="text-gray-300 hover:text-purple-400 transition-colors"
        >
          About
        </a>
      </div>
      <button
        onClick={onOpenModal}
        className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
      >
        Get Started
      </button>
    </nav>
  );
};

export default Navbar;
