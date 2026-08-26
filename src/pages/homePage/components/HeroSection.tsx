import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-50/80">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-supperagent/10 blur-[140px] rounded-full mix-blend-multiply" />
        <motion.div
          className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.25, 1], x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <div className="container relative z-10 mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Column: Content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-supperagent/20 shadow-sm transition-transform duration-300 hover:scale-105 cursor-default">
                <span className="flex h-2 w-2 rounded-full bg-supperagent animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-supperagent tracking-wide uppercase">
                  UK Care Training Platform
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl max-w-2xl font-extrabold tracking-tight text-mentora leading-[1.1]"
            >
              Practical Online Training for Better Care
            </motion.h1>

            <motion.div variants={itemVariants} className="space-y-4 max-w-2xl">
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                Develop essential knowledge through clear, engaging online courses
                designed for UK care workers and health and social care organisations.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                Learn through structured chapters, short videos, downloadable manuals
                and knowledge assessments—all in one accessible platform.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-supperagent text-white font-semibold h-14 px-8 text-lg shadow-lg shadow-supperagent/25 hover:bg-supperagent/90 hover:shadow-supperagent/40 hover:-translate-y-0.5 transition-all duration-300 rounded-full"
                onClick={() => navigate('/courses')}
              >
                <span className="relative z-10 flex items-center justify-center">
                  Explore Courses
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              </Button>

              <Button
                size="lg"
                className="bg-white text-gray-700 font-semibold h-14 px-8 text-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-supperagent hover:-translate-y-0.5 transition-all duration-300 rounded-full shadow-sm group"
                onClick={() => navigate('/contact')}
              >
                <Building2 className="mr-2 w-5 h-5 text-gray-800 group-hover:text-supperagent transition-colors" />
                Training for Organisations
              </Button>
            </motion.div>
          </div>

          {/* Right Column: reserves horizontal space on lg */}
          <div className="hidden lg:block lg:col-span-5" aria-hidden="true" />
        </motion.div>
      </div>

      {/* Image + floating badges */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex absolute bottom-0 right-0 justify-end w-full lg:w-[60%] px-4"
      >
        <div className="relative w-full max-w-[640px] flex justify-end">
          {/* Backlight Ambient Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-supperagent/30 via-teal-300/30 to-blue-400/20 rounded-full blur-3xl -z-10" />

          {/* Hero Image */}
          <img
            src="/hero.png"
            alt="UK Healthcare Professionals"
            className="block relative z-10 w-full h-auto object-contain object-bottom transition-transform duration-500 pointer-events-none"
          />

          {/* Floating Badge 1 (Top Right): Compliance Certification */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -top-5 -right-2 sm:right-2 z-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-white/90 flex items-center gap-3 cursor-default"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-black">Certified</p>
                <p className="text-xs sm:text-sm font-bold text-gray-800">UK Standard Compliant</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating Badge 2 (Bottom Left): Trusted Community */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="absolute bottom-20 -left-2 sm:-left-24 z-20"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-white/90 flex items-center gap-3 cursor-default"
            >
              <div className="p-2.5 rounded-xl bg-supperagent/10 text-supperagent">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-black">Trusted By</p>
                <p className="text-xs sm:text-sm font-bold text-gray-800">Care Workers & Teams</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;