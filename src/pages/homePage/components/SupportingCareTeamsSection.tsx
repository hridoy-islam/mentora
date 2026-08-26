import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, UserPlus, Building2, Sparkles, ArrowRight } from "lucide-react";

const targetAudience = [
  {
    id: "individual",
    icon: UserCheck,
    title: "Individual Care Workers",
    description: "Developing or refreshing their knowledge.",
    badge: "Knowledge Refresh",
    image: "/support1.jpeg",
  },
  {
    id: "new-workers",
    icon: UserPlus,
    title: "New Workers",
    description: "Preparing for care roles.",
    badge: "Role Onboarding",
    image: "/support2.jpeg",
  },
  {
    id: "organisations",
    icon: Building2,
    title: "Organisations",
    description: "Arranging structured learning for their teams.",
    badge: "Team Learning",
    image: "/support3.jpeg",
  },
];

const SupportingCareTeamsSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-16 relative overflow-hidden bg-white">
      {/* Background Subtle Gradient Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto ">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Target Audience
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-mentora mb-4 tracking-tight">
              Supporting <span className="text-supperagent">Individuals and Care Teams</span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 font-medium">
              Medicare Training is suitable for:
            </p>

            {/* Interactive Cards List */}
            <div className="space-y-4">
              {targetAudience.map((item, index) => {
                const isActive = activeTab === index;
                const IconComponent = item.icon;

                return (
                  <motion.div
                    key={item.id}
                    onClick={() => setActiveTab(index)}
                    onMouseEnter={() => setActiveTab(index)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                      isActive
                        ? "bg-gradient-to-r from-slate-50 to-white border-supperagent shadow-lg shadow-supperagent/10 -translate-x-1"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Active Accent Bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1.5 bg-supperagent rounded-r"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-supperagent text-white shadow-md shadow-supperagent/30"
                          : "bg-supperagent/10 text-supperagent"
                      }`}
                    >
                      <IconComponent size={24} strokeWidth={2} />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {item.title}
                        </h3>
                        {isActive && (
                          <ArrowRight className="w-4 h-4 text-supperagent" />
                        )}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Interactive Dynamic Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-xl aspect-[4/3] sm:aspect-[1/1] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              
              {/* Dynamic Image Crossfade */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeTab}
                  src={targetAudience[activeTab].image}
                  alt={targetAudience[activeTab].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover absolute inset-0"
                />
              </AnimatePresence>

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

              {/* Floating Dynamic Badge */}
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-supperagent uppercase tracking-wider block mb-0.5">
                        {targetAudience[activeTab].badge}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base">
                        {targetAudience[activeTab].title}
                      </h4>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  </motion.div>
                </AnimatePresence>
              </div>

              
            </div>

            {/* Decorative Offset Glow Panels */}
            <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-supperagent/15 rounded-3xl -z-10 blur-xl" />
            <div className="absolute -top-4 -right-4 w-48 h-48 bg-mentora/15 rounded-3xl -z-10 blur-xl" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default SupportingCareTeamsSection;