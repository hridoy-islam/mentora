import { motion, useInView } from "framer-motion";
import { Award, BookOpen, Users, Activity, FileCheck, Star, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";

// --- CountUp Component (Unchanged logic, styled output) ---
const CountUp = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const [suffix, setSuffix] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    // Remove non-numeric characters for calculation
    const sanitized = value.toString().replace(/,/g, "");
    const match = sanitized.match(/^(\d+)(.*)$/);
    
    if (!match) {
      setCount(0);
      setSuffix(value);
      return;
    }

    const numericValue = parseInt(match[1], 10);
    const suffixPart = match[2] || "";
    setSuffix(suffixPart);

    const startTime = performance.now();
    const endTime = startTime + duration * 1000;

    const animateCount = (currentTime) => {
      if (currentTime < endTime) {
        const progress = (currentTime - startTime) / (duration * 1000);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easedProgress * numericValue);
        setCount(currentValue);
        requestAnimationFrame(animateCount);
      } else {
        setCount(numericValue);
      }
    };

    requestAnimationFrame(animateCount);
  }, [value, duration, isInView]);

  return (
    <span ref={ref} className="flex items-baseline">
      {count.toLocaleString()}
      <span className="text-supperagent ml-1">{suffix}</span>
    </span>
  );
};

// --- Updated Stats Data for Health & Care ---
const stats = [
  {
    icon: Users,
    value: "50,000+",
    label: "Care Pros Trained",
    description: "Empowering the healthcare workforce",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: FileCheck,
    value: "350+",
    label: "CPD Courses",
    description: "Fully accredited & recognized",
    color: "bg-teal-50 text-teal-600 border-teal-200",
  },
  {
    icon: Activity,
    value: "98%",
    label: "Pass Rate",
    description: "Our students succeed first time",
    color: "bg-rose-50 text-rose-600 border-rose-200",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Tutor Support",
    description: "Expert guidance whenever needed",
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
];

// --- StatsSection Component ---
const StatsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-white">
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>

      {/* --- Ambient Blobs for Depth --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto  relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-mentora mb-4"
            >
                Making a Real Impact in <span className="text-supperagent">Healthcare</span>
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 text-lg"
            >
                We are dedicated to providing high-quality training that translates directly to better care standards.
            </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div 
                className={`
                  relative p-6 rounded-xl bg-white border border-gray-100 shadow-sm 
                  hover:shadow-lg hover:-translate-y-1 transition-all duration-300 
                  group h-full flex flex-col items-center text-center
                `}
              >
                {/* Icon Bubble */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${stat.color} bg-opacity-50`}>
                  <stat.icon className="w-7 h-7" strokeWidth={2} />
                </div>

                {/* Number */}
                <div className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    <CountUp value={stat.value} duration={2.5} />
                </div>

                {/* Label */}
                <h3 className="text-lg font-bold text-gray-800 mb-2">{stat.label}</h3>
                
                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;