import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  HeartHandshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
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
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 sm:py-20 lg:py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[1000px] -translate-x-1/2 rounded-full bg-supperagent/10 blur-[140px]" />
        <motion.div
          className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl"
          animate={{ scale: [1, 1.25, 1], x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10"
        >
          {/* Left column: content */}
          <div className="space-y-7 text-left lg:col-span-6 xl:col-span-7">
            <motion.h1
              variants={itemVariants}
              className="max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-mentora sm:text-5xl md:text-6xl"
            >
              Training That{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-supperagent to-teal-600 bg-clip-text text-transparent">
                  Respects
                </span>
                <svg
                  className="absolute -bottom-2 left-0 z-0 h-3 w-full text-supperagent/30"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C50 3 150 3 198 9"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              the Work You Do
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
              className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center"
            >
              <Button
                size="lg"
                className="group h-14 rounded-full bg-supperagent px-8 text-base font-semibold text-white shadow-lg shadow-supperagent/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-supperagent/90 hover:shadow-supperagent/40 sm:text-lg"
                onClick={() => navigate("/courses")}
              >
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Button>

              <Button
                size="lg"
                className="group h-14 rounded-full border border-gray-200 bg-white px-8 text-base font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 hover:text-supperagent sm:text-lg"
                onClick={() => navigate("/contact")}
              >
                <Building2 className="mr-2 h-5 w-5 text-gray-800 transition-colors group-hover:text-supperagent" />
                Training for Organisations
              </Button>
            </motion.div>
          </div>

          {/* Right column: layered image collage */}
          <motion.div
            variants={itemVariants}
            className="relative mx-auto w-full max-w-md px-4 pb-10 pt-4 sm:max-w-lg sm:px-8 lg:col-span-6 lg:max-w-none xl:col-span-5"
          >
            {/* Glow */}
            <div className="absolute inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-supperagent/30 via-teal-300/30 to-blue-400/20 blur-3xl" />

            {/* Dot pattern accent */}
            <div
              className="absolute -right-1 top-0 h-28 w-28 opacity-60 sm:right-2"
              style={{
                backgroundImage:
                  "radial-gradient(hsl(var(--supperagent)) 1.5px, transparent 1.5px)",
                backgroundSize: "14px 14px",
              }}
              aria-hidden="true"
            />

            {/* Outline frame accent */}
            <div
              className="absolute bottom-4 left-0 h-2/3 w-2/3 rounded-[2rem] border-2 border-supperagent/25"
              aria-hidden="true"
            />

            {/* Main image */}
            <div className="relative ml-auto w-[88%] overflow-hidden rounded-[2rem] border-[6px] border-white shadow-2xl shadow-slate-900/15">
              <img
                src="/home4.jpeg"
                alt="Care worker helping an older man walk in a bright care home lounge"
                className="aspect-[4/5] w-full object-cover object-[35%_center]"
              />
            </div>

            {/* Secondary image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="absolute bottom-0 left-0 w-[46%] overflow-hidden rounded-3xl border-[6px] border-white shadow-xl shadow-slate-900/20"
            >
              <img
                src="/home1.jpeg"
                alt="Carer holding hands with an older man during a home visit"
                className="aspect-square w-full object-cover object-[30%_center]"
              />
            </motion.div>

            {/* Icon accent */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[8%] top-[10%] flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-supperagent shadow-xl sm:h-16 sm:w-16"
              aria-hidden="true"
            >
              <HeartHandshake className="h-7 w-7 sm:h-8 sm:w-8" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
