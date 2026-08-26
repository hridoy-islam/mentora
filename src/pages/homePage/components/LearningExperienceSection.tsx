import React from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Lightbulb, 
  CheckCircle2, 
  BarChart2 
} from "lucide-react";

const learningFeatures = [
  {
    icon: BookOpen,
    title: "Manageable Chapters",
    description: "Each course is divided into clearly structured chapters covering one subject at a time.",
  },
  {
    icon: Lightbulb,
    title: "Practical Explanations",
    description: "Realistic examples connect course content with situations learners may encounter at work.",
  },
  {
    icon: CheckCircle2,
    title: "Immediate Knowledge Checks",
    description: "Questions at the end of each chapter help learners confirm their understanding before continuing.",
  },
  {
    icon: BarChart2,
    title: "Progress and Completion",
    description: "Learners can follow their progress and complete each course through their online account.",
  },
];

const LearningExperienceSection = () => {
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}
      />

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-mentora mb-4 tracking-tight">
              A Learning Experience Built Around <span className="text-supperagent">Care Work</span>
            </h2>
            <p className="text-lg text-gray-800 mb-10 max-w-lg">
              Care workers are often busy, so training should be focused, manageable and relevant.
            </p>

            <div className="space-y-6">
              {learningFeatures.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-supperagent/10 flex items-center justify-center text-supperagent">
                      <feature.icon size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-800 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg">
              {/* Decorative Accent Layers */}
              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-supperagent/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-48 h-48 bg-mentora/10 rounded-2xl -z-10" />

              {/* Main Image Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="/home5.jpeg"
                  alt="A learning experience built around care work"
                  className="w-full h-[420px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LearningExperienceSection;