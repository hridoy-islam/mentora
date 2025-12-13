import React from "react";
import { motion } from "framer-motion";
import { Search, PlayCircle, Award, Rocket, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Find Your Course",
    description: "Explore our curated catalog of expert-led courses tailored to your goals.",
  },
  {
    icon: PlayCircle,
    step: "02",
    title: "Start Learning",
    description: "Watch high-quality video lessons and access interactive resources anytime.",
  },
  {
    icon: Award,
    step: "03",
    title: "Get Certified",
    description: "Complete hands-on projects and earn an industry-recognized certificate.",
  },
  {
    icon: Rocket,
    step: "04",
    title: "Advance Career",
    description: "Leverage your new skills to land your dream job or start a business.",
  },
];

// Floating background object component
const FloatingBlob = ({ className, delay = 0 }) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay,
    }}
    className={`absolute rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${className}`}
  />
);

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50">
      
      {/* --- Background Objects --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Colorful Blobs */}
        <FloatingBlob className="w-96 h-96 bg-purple-300 -top-20 -left-20" delay={0} />
        <FloatingBlob className="w-80 h-80 bg-blue-300 top-40 right-0" delay={2} />
        <FloatingBlob className="w-72 h-72 bg-indigo-300 -bottom-10 left-1/3" delay={4} />
      </div>

      <div className="container relative z-10 mx-auto ">
        
        {/* --- Section Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium text-supperagent bg-white rounded-full shadow-sm border border-gray-100">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-supperagent to-purple-600 font-bold">
              Simple Process
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 tracking-tight">
            Your Journey to <span className="text-supperagent relative inline-block">
              Success
              {/* Underline Object */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-yellow-400 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            We've simplified the learning process so you can focus on what matters most: mastering new skills and achieving your potential.
          </p>
        </motion.div>

        {/* --- Steps Grid --- */}
        <div className="relative">
          
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[60px] left-0 w-full h-1 z-0">
             <svg className="w-full h-full overflow-visible">
                <motion.line 
                    x1="10%" y1="50%" x2="90%" y2="50%" 
                    stroke="#E2E8F0" 
                    strokeWidth="2" 
                    strokeDasharray="8 8"
                />
                {/* Moving dot on the line */}
                <motion.circle 
                    r="4" 
                    fill="#4F46E5"
                    animate={{ cx: ["10%", "90%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    cy="50%"
                />
             </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Card Container */}
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-supperagent/10 transition-all duration-300 h-full flex flex-col items-center text-center relative z-10"
                >
                  {/* Step Number Badge */}
                  <div className="absolute top-4 right-4 bg-gray-50 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-md border border-gray-100 group-hover:bg-supperagent group-hover:text-white transition-colors">
                    {step.step}
                  </div>

                  {/* Icon Wrapper */}
                  <div className="relative mb-6">
                    {/* Glowing ring behind icon */}
                    <div className="absolute inset-0 bg-supperagent/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white to-gray-50 border border-gray-100 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <div className="w-16 h-16 rounded-full bg-supperagent/10 flex items-center justify-center text-supperagent group-hover:bg-supperagent group-hover:text-white transition-colors duration-300">
                        <step.icon className="w-8 h-8" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-supperagent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;