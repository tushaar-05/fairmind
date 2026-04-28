import React from "react";

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 md:mb-0">
          FairMind
        </div>
        <div className="flex space-x-8 text-gray-400">
          <a
            href="#features"
            className="hover:text-purple-400 transition-colors"
          >
            Features
          </a>
          <a
            href="#use-cases"
            className="hover:text-purple-400 transition-colors"
          >
            Use Cases
          </a>
          <a
            href="#pricing"
            className="hover:text-purple-400 transition-colors"
          >
            Pricing
          </a>
          <a href="#about" className="hover:text-purple-400 transition-colors">
            About
          </a>
          <a
            href="#contact"
            className="hover:text-purple-400 transition-colors"
          >
            Contact
          </a>
        </div>
        <p className="text-gray-500 text-sm mt-4 md:mt-0">
          © 2024 FairMind. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
