import React from "react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const features = [
    {
      icon: "📊",
      title: "Dataset Analysis",
      description:
        "Deep dive into your datasets to identify potential biases and imbalances across protected attributes.",
    },
    {
      icon: "⚖️",
      title: "Fairness Metrics",
      description:
        "Calculate comprehensive fairness metrics including demographic parity, equal opportunity, and more.",
    },
    {
      icon: "🔍",
      title: "Bias Detection",
      description:
        "Advanced algorithms to detect subtle biases that traditional methods might miss.",
    },
  ];

  return (
    <section id="features" className="py-20 px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
