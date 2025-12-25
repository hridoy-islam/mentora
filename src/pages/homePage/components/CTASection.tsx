import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate()
  return (
    <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>
      
      {/* --- Ambient Blobs --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative " 
        >
          <div className="relative p-12 md:p-20 border-2 rounded-3xl overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-accent/20" />
            
            {/* Animated Background Elements */}
            <motion.div
              className="absolute top-0 right-0 w-96 h-96 bg-primary/30  blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-80 h-80 bg-accent/30  blur-3xl"
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

            {/* Glass Overlay */}
            <div className="absolute inset-0 glass" />

            {/* Content */}
           <div className="relative z-10 text-center max-w-3xl mx-auto">
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.1 }}
    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-mentora"
  >
    Have Questions or
    <br />
    <span className="text-gradient">Need Our Help?</span>
  </motion.h2>

  <motion.p
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="text-lg md:text-xl text-muted-foreground mb-10"
  >
    Our team is here to help you with courses, licenses, partnerships,
    or any questions you may have.
  </motion.p>

  {/* Contact Button */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: 0.3 }}
    className="flex justify-center"
  >
    <Button
      size="lg"
      className="bg-gradient-primary text-white font-semibold px-10 py-6 glow-sm hover:opacity-90 transition-opacity"
      onClick={() => navigate("/contact")} // or open modal
    >
      Contact Us
      <ArrowRight className="ml-2 w-5 h-5" />
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
