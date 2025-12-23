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
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50"
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          {/* Category Badge */}
          <div className="absolute left-3 top-3 z-20">
            <span
              className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
                course.color || 'bg-supperagent' // Fallback color if course.color is missing
              }`}
            >
              {course.categoryId?.name}
            </span>
          </div>

          {/* Image */}
          <motion.img
            src={course.image || '/placeholder.jpg'}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        {/* Content Section */}
        <div className="flex flex-grow flex-col p-5">
          {/* Meta Info */}
          <div className="mb-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-bold text-yellow-500">
              <Star className="h-3.5 w-3.5 fill-yellow-500" />
              <span>{course.rating}</span>
              <span className="font-normal text-gray-400">
                ({(course.students / 1000).toFixed(1)}k)
              </span>
            </div>
            <div className="flex items-center gap-1 font-medium text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              {course.duration}
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-supperagent">
            {course.title}
          </h3>

          {/* Instructor */}
          {course.instructorId && (
            <p className="mb-4 text-sm text-gray-500">
              by{' '}
              <span className="font-medium text-gray-800">
                {course.instructorId?.name}
              </span>
            </p>
          )}

          {/* Footer: Price + Button */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none text-gray-900">
                ${course.price}
              </span>
              {
                course.originalPrice && 
              <span className="mt-0.5 text-xs text-gray-400 line-through">
                ${course.originalPrice}
              </span>
              }
            </div>

            <button className="flex items-center justify-center gap-2 rounded-full bg-supperagent px-4 py-2 text-sm font-medium text-white shadow-md shadow-supperagent/20 transition-all hover:bg-supperagent/90">
              <ShoppingCart className="h-3.5 w-3.5" />
              Enroll
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
