import React from 'react';
import { FrameSequence } from '../components/landing/FrameSequence';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { FeatureRibbon } from '../components/landing/FeatureRibbon';
import { ExploreSection } from '../components/landing/ExploreSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#07030d] text-white overflow-x-hidden font-sans selection:bg-purple-400 selection:text-purple-950">
      {/* 240-Frame Canvas Scroll Animation in Background with Seamless Blending (z-0) */}
      <FrameSequence />

      {/* Top Floating Glass Navbar */}
      <LandingNavbar />

      {/* Main Content Sections (relative z-10 for layered depth) */}
      <main className="relative z-10 flex flex-col items-center justify-center">
        {/* Hero Section matching Reference 1 */}
        <LandingHero />

        {/* Feature Capabilities Ribbon */}
        <FeatureRibbon />

        {/* Interactive Feature Exploration */}
        <ExploreSection />
      </main>

      {/* Landing Footer */}
      <LandingFooter />
    </div>
  );
};
