import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, MessageCircle } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Senior Care Assistant",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60",
    content: "The Dementia Care Level 3 course completely changed how I approach my work. The practical examples were incredibly relevant, and having a CPD accredited certificate helped me get my recent promotion.",
    rating: 5,
    course: "Dementia Care & Support",
  },
  {
    id: 2,
    name: "David Ross",
    role: "NHS Administrator",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60",
    content: "We used Mentora to train our administrative staff on Data Protection and Safeguarding. The platform is user-friendly, and the ability to track team progress made compliance management so much easier.",
    rating: 5,
    course: "Safeguarding Adults",
  },
  {
    id: 3,
    name: "Dr. Emily Chen",
    role: "Clinical Lead",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=60",
    content: "I recommend these clinical updates to all my nursing staff. The Medication Administration module is thorough, up-to-date with current guidelines, and very engaging to learn.",
    rating: 5,
    course: "Safe Handling of Meds",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-50/50">
       
       {/* --- Background Texture --- */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
          backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }}>
      </div>
      
      {/* --- Ambient Blobs --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        
        {/* --- Section Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-supperagent/10 text-supperagent text-xs font-bold uppercase tracking-wider mb-4">
            <MessageCircle className="w-3.5 h-3.5" />
            Student Success Stories
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-supperagent to-purple-600">Care Professionals</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Join thousands of successful graduates who have transformed their careers and improved care standards.
          </p>
        </motion.div>

        {/* --- Testimonials Grid --- */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className="relative p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full flex flex-col"
              >
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-supperagent/10" />

                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 mb-6 leading-relaxed flex-grow italic">
                  "{testimonial.content}"
                </p>

                {/* Course Tag */}
                <div className="mb-6">
                    <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wide bg-gray-50 text-gray-600 rounded-full border border-gray-200">
                    {testimonial.course}
                    </span>
                </div>

                {/* Separator */}
                <div className="w-full h-px bg-gray-100 mb-6"></div>

                {/* Author Profile */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-supperagent font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;