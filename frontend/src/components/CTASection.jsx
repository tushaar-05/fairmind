import React from "react";

const CTASection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-purple-900 to-pink-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-white">
          Start auditing your AI today
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of developers ensuring fairness in their AI systems.
        </p>
        <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg">
          Upload CSV
        </button>
      </div>
    </section>
  );
};

export default CTASection;
