import React from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Users, 
  Package, 
  UserCog, 
  Award, 
  FileCheck,
  Building2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const orgFeatures = [
  {
    icon: BookOpen,
    title: "Course Selection",
    description: "The courses required for your staff roles and service requirements",
  },
  {
    icon: Users,
    title: "Learner Numbers",
    description: "The number of learners needing training across your organisation",
  },
  {
    icon: Package,
    title: "Training Packages",
    description: "Suitable training packages tailored to your organisational priorities",
  },
  {
    icon: UserCog,
    title: "Account Setup",
    description: "Account and learner arrangements for smooth onboarding",
  },
  {
    icon: Award,
    title: "Certification",
    description: "Certification and completion requirements tracking",
  },
  {
    icon: FileCheck,
    title: "Compliance",
    description: "Meet regulatory and organisational training obligations",
  },
];

const TrainingForOrganisationsSection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-10 sm:py-16 relative overflow-hidden bg-white">
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

      <div className="container relative z-10 mx-auto ">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
          
          {/* Left Text Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-4">
              <Building2 className="w-3.5 h-3.5" />
              For Organisations
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-mentora mb-4 tracking-tight">
              Training for <span className="text-supperagent">Care Organisations</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-800 mb-6 sm:mb-8 max-w-lg">
              Provide your workforce with flexible online learning across essential
              areas of health and social care.
            </p>
            <p className="text-gray-800 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              We can help care providers identify suitable courses based on staff
              roles, service requirements and organisational training priorities.
            </p>
            <p className="text-gray-800 mb-6 sm:mb-8 font-medium text-sm sm:text-base">Contact us to discuss:</p>
            
            <div className="space-y-4 sm:space-y-5 mb-8">
              {orgFeatures.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-supperagent/10 flex items-center justify-center text-supperagent">
                      <feature.icon size={18} strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm sm:text-md mb-0.5">{feature.title}</h4>
                    <p className="text-sm sm:text-md text-gray-800">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-supperagent hover:bg-supperagent/90 text-white font-semibold rounded-full px-6 sm:px-8 h-12 text-sm sm:text-base shadow-lg shadow-supperagent/20 transition-all hover:scale-105 flex items-center justify-center"
              onClick={() => navigate('/contact')}
            >
              Enquire About Organisational Training
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </Button>
          </motion.div>

          {/* Right Image Section (Modern Floating Overlay Style) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-xl">
              
              {/* Offset Decorative Background Card */}
              <div className="absolute inset-0 bg-gradient-to-tr from-supperagent/20 to-mentora/20 rounded-3xl transform rotate-3 scale-105 -z-10 blur-sm" />

              {/* Primary Image Frame */}
              <div className="relative overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="/certificate.png"
                  alt="Certificate"
                  className="w-full h-[260px] sm:h-[340px] md:h-[380px] object-cover"
                />
                {/* <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" /> */}
              </div>

              {/* Floating Glassmorphism Badge (Bottom Left) */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20 hidden sm:flex"
              >
                <div className="w-12 h-12 rounded-xl bg-supperagent/10 flex items-center justify-center text-supperagent">
                  <Award size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">CPD Accredited</h5>
                  <p className="text-xs text-gray-800">Certified Care Training</p>
                </div>
              </motion.div> */}

              {/* Floating Chip Badge (Top Right) */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 bg-mentora text-white px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-1.5 sm:gap-2.5 z-20 max-w-[calc(100%-1.5rem)]"
              >
                <ShieldCheck size={16} className="text-supperagent shrink-0 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">Compliance Ready</span>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default TrainingForOrganisationsSection;