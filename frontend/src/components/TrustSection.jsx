import React from "react";
import FeatureCard from "./FeatureCard";

const TrustSection = () => {
  const values = [
    {
      icon: "👁️",
      title: "Transparency",
      description:
        "Clear, interpretable reports that explain bias findings and their implications.",
    },
    {
      icon: "🎯",
      title: "Accuracy",
      description:
        "Precise detection algorithms backed by rigorous research and validation.",
    },
    {
      icon: "✅",
      title: "Compliance-ready",
      description:
        "Meet regulatory requirements with comprehensive audit trails and documentation.",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Built to detect bias at scale
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Trusted by organizations worldwide for reliable AI fairness auditing.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <FeatureCard key={index} {...value} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
