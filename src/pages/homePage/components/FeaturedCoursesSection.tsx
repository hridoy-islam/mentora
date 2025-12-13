import { motion } from "framer-motion";
import { Star, Clock, ShoppingCart, ArrowRight, BookOpen, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

const courses = [
  {
    id: 1,
    title: "Paediatric First Aid Level 3 (VTQ)",
    instructor: "Dr. Sarah Mitchell",
    rating: 4.9,
    students: 12500,
    duration: "12 hours",
    price: 49.99,
    originalPrice: 99.99,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
    category: "Emergency Care",
    color: "bg-rose-100 text-rose-700",
  },
  {
    id: 2,
    title: "Advanced Dementia Care & Support",
    instructor: "James Wilson (RMN)",
    rating: 4.8,
    students: 8300,
    duration: "20 hours",
    price: 39.99,
    originalPrice: 79.99,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=60",
    category: "Social Care",
    color: "bg-teal-100 text-teal-700",
  },
  {
    id: 3,
    title: "Safe Handling of Medication",
    instructor: "Dr. Emily Chen",
    rating: 4.9,
    students: 15200,
    duration: "8 hours",
    price: 29.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60",
    category: "Clinical",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 4,
    title: "Safeguarding Adults & Children",
    instructor: "Emma Thompson",
    rating: 4.7,
    students: 9800,
    duration: "10 hours",
    price: 34.99,
    originalPrice: 69.99,
    image: "https://images.unsplash.com/photo-1551893478-d726eaf0442c?w=800&auto=format&fit=crop&q=60",
    category: "Compliance",
    color: "bg-indigo-100 text-indigo-700",
  },
];

const FeaturedCoursesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      
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
            <HeartPulse className="w-3.5 h-3.5" />
            Top Rated Training
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Master Essential <span className="text-transparent bg-clip-text bg-gradient-to-r from-supperagent to-teal-600">Care Skills</span>
          </h2>
          <p className="text-gray-500 text-lg">
            Explore our most popular CPD accredited courses, designed by medical professionals to advance your career.
          </p>
        </motion.div>

        {/* --- Course Grid --- */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm ${course.color}`}>
                      {course.category}
                    </span>
                  </div>
                  
                  {/* Image */}
                  <motion.img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-yellow-500" />
                        <span>{course.rating}</span>
                        <span className="text-gray-400 font-normal">({(course.students / 1000).toFixed(1)}k)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-supperagent transition-colors">
                    {course.title}
                  </h3>
                  
                  {/* Instructor */}
                  <p className="text-sm text-gray-500 mb-4">
                    by <span className="text-gray-800 font-medium">{course.instructor}</span>
                  </p>

                  {/* Footer: Price + Button */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900 leading-none">
                            ${course.price}
                        </span>
                        <span className="text-xs text-gray-400 line-through mt-0.5">
                            ${course.originalPrice}
                        </span>
                    </div>
                    
                    <Button 
                      size="sm"
                      className="rounded-full bg-supperagent hover:bg-supperagent/90 text-white font-medium px-4 shadow-md shadow-supperagent/20"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                      Enroll
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* --- View All Button --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-supperagent font-semibold px-8 h-12 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <BookOpen className="mr-2 w-4 h-4" />
            View All Courses
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

      </div>
    </section>
  );
};

export default FeaturedCoursesSection;