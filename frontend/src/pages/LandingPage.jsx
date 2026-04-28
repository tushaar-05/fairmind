import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import HowItWorks from "../components/HowItWorks";
import TrustSection from "../components/TrustSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar onOpenModal={openModal} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <TrustSection />
      <CTASection />
      <Footer />
      <AuthModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default LandingPage;
