import React from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  ArrowRight, 
  HeartPulse, 
  Star, 
  Activity, 
  CheckCircle, 
  Stethoscope, 
  ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Sub-Component: Floating UI Card (Left - Reviews) ---
const ReviewCard = () => (
  <motion.div
    animate={{ y: [0, 30, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className="hidden lg:flex absolute left-[5%] top-2/3 bg-white/90 backdrop-blur-md border border-gray-100 p-4 rounded-2xl shadow-xl z-20 max-w-[260px]"
  >
    <div className="flex gap-3 items-start">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
        <Stethoscope size={20} />
      </div>
      <div>
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-xs text-gray-700 font-medium italic">"The Dementia Care module was incredibly detailed."</p>
        <p className="text-[10px] text-gray-400 mt-1 font-semibold">Sarah J. • Clinical Lead</p>
      </div>
    </div>
  </motion.div>
);

// --- Sub-Component: Floating UI Card (Right - Progress) ---
const ProgressCard = () => (
  <motion.div
    animate={{ y: [0, 15, 0] }}
    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    className="hidden lg:flex absolute right-[5%] bottom-1/3 bg-white/90 backdrop-blur-md border border-gray-100 p-4 rounded-2xl shadow-xl z-20 w-[240px]"
  >
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 rounded-lg text-red-500">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800">First Aid Lvl 2</span>
            <span className="text-[10px] text-gray-500">Module 4 of 5</span>
          </div>
        </div>
        <span className="text-xs font-bold text-supperagent">84%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "84%" }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="h-full bg-supperagent rounded-full"
        />
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500">
        <CheckCircle className="w-3 h-3 text-green-500" />
        <span>CPR Certification Pending</span>
      </div>
    </div>
  </motion.div>
);

// --- Sub-Component: Avatar Stack ---
const AvatarStack = () => (
  <div className="flex items-center gap-3 pt-8 justify-center">
    <div className="flex -space-x-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
          <img 
            src={`https://i.pravatar.cc/100?img=${i + 20}`} 
            alt="Medical Professional" 
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <div className="w-10 h-10 rounded-full border-2 border-white bg-supperagent text-white flex items-center justify-center text-xs font-bold">
        5k+
      </div>
    </div>
    <div className="text-left">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-xs font-medium text-gray-600 mt-0.5">Trusted by Care Professionals</p>
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-50">
      
      {/* --- Background Elements --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-supperagent/10 blur-[120px] rounded-full mix-blend-multiply" />
        
        {/* Animated Blobs */}
        <motion.div
          className="absolute top-1/4 left-0 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* --- Floating Objects --- */}
      <ReviewCard />
      <ProgressCard />

      {/* --- Main Content --- */}
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white border border-supperagent/20 shadow-sm hover:shadow-md transition-shadow cursor-default"
          >
            <HeartPulse className="w-4 h-4 text-supperagent fill-supperagent/10" />
            <span className="text-sm font-semibold text-supperagent tracking-wide uppercase">
              #1 Accredited Healthcare Training
            </span>
          </motion.div>

          {/* Heading - Updated with Mentora Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-7xl font-extrabold tracking-tight mb-6 text-gray-900 leading-[1.1]"
          >
            Quality Health & Social Care <br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-supperagent via-purple-600 to-supperagent animate-gradient-x pb-2">
              Training with Mentora
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Gain expert skills with easy-to-access certified courses designed to 
            advance your career in the healthcare and social sectors.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-supperagent text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-supperagent/30 hover:bg-supperagent/90 hover:scale-105 transition-all duration-300 rounded-full"
            >
              Explore Courses
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            {/* <Button
              size="lg"
              className="bg-white text-gray-700 font-semibold h-14 px-8 text-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-supperagent transition-all duration-300 rounded-full shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-supperagent/10 flex items-center justify-center mr-3">
                 <ShieldCheck className="w-4 h-4 text-supperagent" />
              </div>
              View Accreditation
            </Button> */}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <AvatarStack />
          </motion.div>
          
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;