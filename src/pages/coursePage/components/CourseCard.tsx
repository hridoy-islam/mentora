import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, ShoppingCart } from 'lucide-react';

export default function CourseCard({ course, index = 0, onClick }) {
  return (
    <motion.div
      key={course.id || index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className="h-full"
    >
      <motion.div
        whileHover={{ y: -8 }}
        className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 h-full flex flex-col cursor-pointer"
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-20">
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm text-white ${
                course.color || 'bg-supperagent' // Fallback color if course.color is missing
              }`}
            >
              {course.categoryId?.name}
            </span>
          </div>

          {/* Image */}
          <motion.img
            src={course.image||'/placeholder.jpg'}
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
              <span className="text-gray-400 font-normal">
                ({(course.students / 1000).toFixed(1)}k)
              </span>
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
            by <span className="text-gray-800 font-medium">{course.instructorId.name}</span>
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

            <button className="flex items-center justify-center gap-2 rounded-full bg-supperagent hover:bg-supperagent/90 text-white font-medium text-sm px-4 py-2 shadow-md shadow-supperagent/20 transition-all">
              <ShoppingCart className="w-3.5 h-3.5" />
              Enroll
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}