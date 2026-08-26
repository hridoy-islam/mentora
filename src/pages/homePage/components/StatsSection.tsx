import React from "react";
import { motion } from "framer-motion";

const SaferCareSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Direct Text Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-mentora tracking-tight"
            >
              Training That Supports <span className="text-supperagent">Safer Care</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-black text-lg leading-relaxed"
            >
              Medicare Training helps care workers understand their responsibilities
              and apply safer, more person-centred practices.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-black text-lg leading-relaxed"
            >
              Our courses focus on real situations encountered in care homes,
              domiciliary care, supported living and other adult social care settings.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-black text-lg leading-relaxed"
            >
              Content is presented in clear UK English and developed with reference to
              relevant legislation, national guidance and recognised good practice.
            </motion.p>
          </motion.div>

          {/* Dual Image Professional Composition Layout */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative pt-4 pr-4 pb-10 pl-2 max-w-md mx-auto lg:max-w-none w-full"
          >
     
            {/* Top Primary Image: Care Training Room */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white w-4/5 ml-auto">
              <img
                src="/home3.jpeg"
                alt="Professional care training session"
                className="w-full h-52 sm:h-72 object-cover"
              />
            </div>

            {/* Overlapping Secondary Image: Direct Person-Centred Care */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white w-3/4 -mt-20 z-20">
              <img
                src="/home4.jpeg"
                alt="Hands-on care worker assisting elder"
                className="w-full h-44 sm:h-72 object-cover"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default SaferCareSection;