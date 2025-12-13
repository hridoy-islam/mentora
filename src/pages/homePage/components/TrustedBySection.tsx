import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  HeartHandshake, 
  Stethoscope, 
  Cross, 
  Activity, 
  GraduationCap 
} from "lucide-react";

// Updated to match the "Health & Social Care" theme
const partners = [
  { name: "NHS Trusts", icon: <Activity className="w-8 h-8" /> },
  { name: "Care Quality", icon: <HeartHandshake className="w-8 h-8" /> },
  { name: "MediGroup", icon: <Cross className="w-8 h-8 rotate-45" /> }, // Simulating a medical cross
  { name: "HealthFirst", icon: <Stethoscope className="w-8 h-8" /> },
  { name: "SocialCare UK", icon: <Building2 className="w-8 h-8" /> },
  { name: "EduMed", icon: <GraduationCap className="w-8 h-8" /> },
];

const TrustedBySection = () => {
  return (
    <section className="py-12 border-b border-gray-100 bg-white relative overflow-hidden">
      
      {/* --- Subtle Background Texture --- */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
          backgroundSize: '32px 32px' 
        }}>
      </div>
<div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-10">
            Trusted by leading Care Organizations & Partners
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col items-center justify-center gap-2 cursor-default"
              >
                {/* Logo Icon / Representation */}
                <div className="text-gray-400 transition-all duration-300 group-hover:text-supperagent group-hover:scale-110">
                  {partner.icon}
                </div>
                
                {/* Company Name (Simulating Logo Text) */}
                <span className="text-lg font-bold text-gray-400 transition-colors duration-300 group-hover:text-gray-800">
                  {partner.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBySection;