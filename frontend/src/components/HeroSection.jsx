import React from "react";

const HeroSection = () => {
  return (
    <section className="flex flex-col md:flex-row items-center justify-between px-6 py-20 bg-gray-900">
      <div className="md:w-1/2 mb-10 md:mb-0">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
          AI systems should be fair. We make sure they are.
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Detect and mitigate bias in your AI models with our comprehensive
          fairness audit platform. Analyze datasets, measure metrics, and
          generate actionable reports.
        </p>
        <div className="flex space-x-4">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all">
            Upload Dataset
          </button>
          <button className="border border-purple-500 px-8 py-3 rounded-full text-purple-400 hover:bg-purple-500 hover:text-white transition-all">
            See Demo
          </button>
        </div>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <div className="relative">
          <div className="w-80 h-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl">⚡</div>
            <div className="absolute top-10 left-10 w-16 h-16 bg-purple-500 rounded-lg rotate-45 opacity-80"></div>
            <div className="absolute bottom-10 right-10 w-12 h-12 bg-pink-500 rounded-full opacity-80"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
