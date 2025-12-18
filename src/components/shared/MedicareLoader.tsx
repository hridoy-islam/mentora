import React from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-md transition-all">
      
      
      <div className="relative flex items-center justify-center h-32 w-32">
        
        
        <div className="absolute inset-0 rounded-full border-2 border-supperagent opacity-50 animate-ping-slow"></div>
        
       
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-supperagent border-r-blue-600/30 animate-spin-slow"></div>
        
        
        <div className="absolute inset-4 rounded-full border-[3px] border-slate-200 border-b-supperagent animate-spin-reverse"></div>

        {/* Center Icon */}
        <div className="relative z-10 rounded-full bg-white p-4 shadow-sm border border-slate-100">
          <GraduationCap className="h-8 w-8 text-gradient animate-pulse" />
        </div>
      </div>

      {/* --- Text Content --- */}
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-xl font-semibold text-gradient tracking-tight">
          Medicare Training
        </h3>
        
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
        .animate-ping-slow {
           animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};