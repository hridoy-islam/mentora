import React from "react";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Baby,
  Stethoscope,
  Brain,
  ShieldCheck,
  Briefcase,
  Utensils,
  Activity,
  ArrowUpRight,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Updated Sectors Data for Health/Care ---
const sectors = [
  { 
    icon: HeartHandshake, 
    name: "Health & Social Care", 
    courses: 120, 
    color: "from-teal-500 to-emerald-500", 
    shadow: "shadow-teal-500/20" 
  },
  { 
    icon: Baby, 
    name: "Child Care", 
    courses: 45, 
    color: "from-pink-500 to-rose-500", 
    shadow: "shadow-pink-500/20" 
  },
  { 
    icon: Stethoscope, 
    name: "Clinical Skills", 
    courses: 50, 
    color: "from-blue-500 to-cyan-500", 
    shadow: "shadow-blue-500/20" 
  },
  { 
    icon: Brain, 
    name: "Mental Health", 
    courses: 35, 
    color: "from-violet-500 to-purple-500", 
    shadow: "shadow-violet-500/20" 
  },
  { 
    icon: ShieldCheck, 
    name: "Health & Safety", 
    courses: 60, 
    color: "from-orange-500 to-amber-500", 
    shadow: "shadow-orange-500/20" 
  },
  { 
    icon: Briefcase, 
    name: "Leadership & Mgmt", 
    courses: 28, 
    color: "from-indigo-500 to-blue-500", 
    shadow: "shadow-indigo-500/20" 
  },
  { 
    icon: Utensils, 
    name: "Food Hygiene", 
    courses: 15, 
    color: "from-red-500 to-orange-500", 
    shadow: "shadow-red-500/20" 
  },
  { 
    icon: Activity, 
    name: "First Aid", 
    courses: 22, 
    color: "from-emerald-500 to-green-500", 
    shadow: "shadow-emerald-500/20" 
  },
];

const SectorsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      
      {/* --- Background Texture --- */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>
      
      <div className="container relative z-10 mx-auto px-6">
        
        {/* --- Section Header --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-4">
                <LayoutGrid className="w-3 h-3" />
                Our Expertise
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Sectors We <span className="text-gradient">Cover</span>
              </h2>
              <p className="text-gray-500 text-lg">
                Specialised training solutions tailored to specific industry needs to ensure compliance and care excellence.
              </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Button variant="outline" className="hidden md:flex gap-2 rounded-full border-gray-300 hover:border-supperagent hover:text-supperagent transition-all">
                    View All Sectors <ArrowUpRight className="w-4 h-4" />
                </Button>
            </motion.div>
        </div>

        {/* --- Sectors Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {sectors.map((sector, index) => (
            <motion.div
              key={sector.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="group relative h-full bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:border-supperagent/30 hover:shadow-xl hover:shadow-gray-200/50"
              >
                {/* Hover Interaction Arrow */}
                <div className="absolute top-4 right-4 opacity-0 transform translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5 text-supperagent" />
                </div>

                {/* Icon Container */}
                <div className="mb-6 relative">
                    {/* Glow effect behind icon */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${sector.color} blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                    
                    <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${sector.color} flex items-center justify-center text-white shadow-lg ${sector.shadow} group-hover:scale-110 transition-transform duration-300`}>
                       <sector.icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Content */}
                <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-supperagent transition-colors duration-300 mb-1">
                      {sector.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${sector.color} w-3/4`}></div>
                        </div>
                        <p className="text-xs font-medium text-gray-400">
                        {sector.courses} Courses
                        </p>
                    </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {/* Mobile Button */}
        <div className="mt-8 flex md:hidden justify-center">
             <Button variant="outline" className="w-full rounded-full border-gray-300">
                View All Sectors <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
        </div>

      </div>
    </section>
  );
};

export default SectorsSection;