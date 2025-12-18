import React from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  ArrowRight, 
  Award, 
  FileCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Industry Recognition",
    description: "Our certifications hold value and recognition within their respective fields, enhancing your professional profile."
  },
  {
    title: "Skill Enhancement",
    description: "Gain in-depth knowledge and practical skills through our comprehensive certification."
  },
  {
    title: "Flexible Learning",
    description: "Our programs offer flexibility, allowing you to learn at your own pace and convenience, fitting into your busy schedule."
  }
];

const GetCertifiedSection = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      
      {/* --- Background Texture --- */}
     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>

      {/* --- Ambient Blobs for Depth --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto ">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* --- Left Side: Text Content --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Heading */}
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Get <span className="text-supperagent">Certified</span>
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-lg">
              Explore our diverse certified courses, advancing career expertise with recognised certification.
            </p>

            {/* Sub-Section */}
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Certification</h3>

            {/* Feature List */}
            <div className="space-y-6 mb-10">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-supperagent flex items-center justify-center text-white">
                        <CheckCircle size={14} strokeWidth={3} />
                    </div>
                  </div>
                  {/* Text */}
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
                size="lg" 
                className="bg-supperagent hover:bg-supperagent/90 text-white font-semibold rounded-lg px-8 h-12 shadow-lg shadow-supperagent/20 transition-all hover:scale-105"
            >
              Explore Courses <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* --- Right Side: Certificate Visual --- */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Certificate Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative w-full max-w-xl aspect-[1.4/1] bg-white rounded-xl shadow-2xl border border-gray-100 p-8 md:p-10 flex flex-col justify-between"
            >
                {/* Certificate Background Pattern */}
  

                {/* Header */}
                <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Certificate of</h4>
                    <h3 className="text-xl md:text-2xl font-light text-gray-800 uppercase tracking-widest">Successful Completion</h3>
                </div>

                {/* Middle Section: Name & Course */}
                <div className="my-6">
                    <h2 className="text-4xl md:text-5xl font-cursive text-supperagent mb-4">Carl Randle</h2>
                    <p className="text-sm text-gray-500 max-w-sm mb-2">
                        has successfully completed an in-house training with Medicare Training for a CPD certified course in
                    </p>
                    <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 inline-block pb-1">
                        Advanced Dementia Care Level 3
                    </h4>
                </div>

                {/* Footer: Signatures & Seal */}
                <div className="flex items-end justify-between mt-auto">
                    {/* Signature */}
                    <div>
                        <div className="h-10 w-24 mb-2">
                             {/* SVG Signature Mockup */}
                             <svg viewBox="0 0 100 40" className="stroke-gray-800 stroke-2 fill-none">
                                 <path d="M10,30 Q30,10 50,30 T90,20" />
                             </svg>
                        </div>
                        <div className="h-px w-32 bg-gray-300 mb-1" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Justin Redrup, Director</p>
                    </div>

                    {/* Seal / Badge */}
                    <div className="relative flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-supperagent to-orange-500 shadow-lg flex items-center justify-center text-white border-4 border-white">
                             <Award size={36} />
                        </div>
                        <div className="absolute -bottom-2 w-10 h-10 bg-orange-600 rotate-45 -z-10 rounded-sm"></div>
                    </div>
                </div>

                {/* CPD Logo Mockup (Bottom Right Corner) */}
                <div className="absolute bottom-6 right-6 flex flex-col items-center opacity-80">
                     <div className="text-[10px] font-bold text-supperagent">CPD</div>
                     <div className="text-[8px] text-gray-400 uppercase">Certified</div>
                </div>

            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GetCertifiedSection;