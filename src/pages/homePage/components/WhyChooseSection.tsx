import React from "react";
import { motion } from "framer-motion";
import {
  HeartHandshake,
  Film,
  FileText,
  CheckCircle2,
  Globe,
  Award,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const whyChooseFeatures = [
  {
    icon: HeartHandshake,
    title: "Care-Specific Content",
    description: "Our courses are written for care workers and focus on the knowledge needed in everyday care practice.",
    color: "from-teal-500 to-emerald-500",
    shadow: "shadow-teal-500/20",
  },
  {
    icon: Film,
    title: "Clear Video Lessons",
    description: "Short videos explain important procedures and concepts in a visual, accessible format.",
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
  },
  {
    icon: FileText,
    title: "Downloadable Manuals",
    description: "Detailed training manuals support each course and provide a useful reference after completion.",
    color: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
  },
  {
    icon: CheckCircle2,
    title: "Knowledge Assessments",
    description: "Chapter questions and final assessments help learners check and demonstrate their understanding.",
    color: "from-orange-500 to-amber-500",
    shadow: "shadow-orange-500/20",
  },
  {
    icon: Globe,
    title: "Flexible Online Access",
    description: "Learners can access their courses online and progress at a pace that fits around work and other responsibilities.",
    color: "from-indigo-500 to-blue-500",
    shadow: "shadow-indigo-500/20",
  },
  {
    icon: Award,
    title: "Certificates",
    description: "A certificate is available after the learner successfully completes the required course assessments.",
    color: "from-emerald-500 to-green-500",
    shadow: "shadow-emerald-500/20",
  },
];

const WhyChooseSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16 relative overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>
      
      <div className="container relative z-10 mx-auto px-6">
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
              Why Choose Medicare Training
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-mentora mb-4 tracking-tight">
              Why Choose <span className="text-gradient">Medicare Training?</span>
            </h2>
            <p className=" text-lg">
              Our training platform is built specifically for UK care workers and organisations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button className="hidden md:flex gap-2 rounded-full border-gray-300 hover:border-supperagent transition-all" onClick={() => navigate('/courses')}>
              View All Courses <LayoutGrid className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="group relative h-full bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:border-supperagent/30 hover:shadow-xl hover:shadow-gray-200/50"
              >
                <div className="absolute top-4 right-4 opacity-0 transform translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
                  <LayoutGrid className="w-5 h-5 text-supperagent" />
                </div>

                <div className="mb-6 relative">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-supperagent transition-colors duration-300 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 flex md:hidden justify-center">
          <Button className="w-full rounded-full border-gray-300" onClick={() => navigate('/courses')}>
            View All Courses <LayoutGrid className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;