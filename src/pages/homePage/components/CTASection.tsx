import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, UserPlus, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden bg-white">
      {/* Background Micro Dots & Ambient Glows */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#4F46E5 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/80 shadow-xl bg-gradient-to-br from-supperagent/10 via-white to-teal-50/80 p-5 sm:p-8 lg:p-14"
        >
          {/* Animated Background Fluid Light Blobs */}
          <motion.div
            className="absolute -top-24 -right-24 w-96 h-96 bg-supperagent/20 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Asymmetric Split Layout */}
          <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Column: Primary Call to Action */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-supperagent" />
                Get Started Today
              </div>

              <h2 className="text-[1.75rem] leading-[1.2] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-mentora tracking-tight md:leading-[1.1] mb-3 sm:mb-5">
                Start Learning <br />
                <span className="text-supperagent">With Confidence</span>
              </h2>

              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg">
                Build the knowledge and confidence needed to support people safely,
                respectfully and professionally across all adult care settings.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-supperagent text-white font-semibold h-11 sm:h-14 px-4 sm:px-8 text-sm sm:text-base shadow-lg shadow-supperagent/30 hover:bg-supperagent/90 hover:scale-105 transition-all duration-300 rounded-full flex items-center justify-center gap-1.5 sm:gap-2"
                  onClick={() => navigate("/courses")}
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>

                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-gray-700 font-semibold h-11 sm:h-14 px-4 sm:px-8 text-sm sm:text-base border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-supperagent transition-all duration-300 rounded-full shadow-sm flex items-center justify-center gap-1.5 sm:gap-2"
                  onClick={() => navigate("/signup")}
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create an Account
                </Button>
              </div>
            </div>

            {/* Right Column: Embedded Light Support Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-supperagent/10 flex items-center justify-center text-supperagent">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-mentora">Need Help Choosing?</h3>
                    <p className="text-xs text-gray-600">We are here to assist you</p>
                  </div>
                </div>

                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5">
                  Contact our dedicated team for assistance with individual courses,
                  organisational training packages, or account setup.
                </p>

                {/* Direct Contact Links */}
                <div className="space-y-2.5 mb-4 sm:mb-5">
                  <a
                    href="tel:07914829155"
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-gray-600">Phone</span>
                      <span className="text-sm font-semibold text-gray-900">07914 829155</span>
                    </div>
                  </a>

                  <a
                    href="mailto:support@medicaretraining.co.uk"
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 border border-gray-100 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] uppercase tracking-wide text-gray-600">Email</span>
                      <span className="text-sm font-semibold text-gray-900 truncate block">
                        support@medicaretraining.co.uk
                      </span>
                    </div>
                  </a>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-supperagent text-white hover:bg-supperagent/90 font-semibold h-11 rounded-full transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-supperagent/20"
                  onClick={() => navigate("/contact")}
                >
                  Contact Support Team
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
