import React from "react";

const HowItWorks = () => {
  const steps = [
    {
      icon: "⬆️",
      title: "Upload Dataset",
      description: "Securely upload your CSV or dataset files for analysis.",
    },
    {
      icon: "🔬",
      title: "Analyze Bias",
      description: "Our AI runs comprehensive fairness checks and metrics.",
    },
    {
      icon: "📋",
      title: "Get Report",
      description:
        "Receive detailed reports with actionable insights and recommendations.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-gray-300 max-w-xs">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute mt-10 ml-32 text-purple-400 text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
