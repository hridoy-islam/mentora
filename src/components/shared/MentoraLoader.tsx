import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Loader = () => {
  return (
    // Full screen centering container with a slight blur background
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Ripple Effect Rings */}
        <div className="absolute -inset-4 rounded-full bg-supperagent/20 animate-ping-slow"></div>
        <div className="absolute -inset-8 rounded-full bg-supperagent/10 animate-ping-slower delay-300"></div>
        
        {/* The Floating Cap Icon */}
        {/* We add a custom 'animate-float' class defined in CSS below */}
        <GraduationCap className="h-16 w-16 text-supperagent animate-float relative z-10 filter drop-shadow-lg" strokeWidth={1.5} />
        
        {/* Optional Text */}
        <span className="mt-4 text-lg font-bold text-supperagent animate-pulse">
          Mentora
        </span>
        
        {/* Shadow beneath the floating object */}
        <div className="mt-4 h-1.5 w-12 rounded-[50%] bg-gray-200 blur-sm animate-shadow-scale"></div>
      </div>

      {/* Adding custom keyframes directly here for ease of copy-paste. 
         Ideally, add these to your global CSS file. 
      */}
      <style>{`
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shadow-scale {
           animation: shadow-scale 3s ease-in-out infinite;
        }
        .animate-ping-slow {
           animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
           animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shadow-scale {
          0%, 100% { transform: scaleX(1); opacity: 0.8; }
          50% { transform: scaleX(0.6); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};