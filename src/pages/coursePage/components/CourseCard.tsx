import React from 'react';
import { Star, Users, Clock } from 'lucide-react';

export default function CourseCard({ course, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Course Image */}
      <div className="relative h-40 bg-supperagent overflow-hidden">
        <img 
          src={course.image || "/placeholder.svg"} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Course Info */}
      <div className="p-4">
        {/* Lessons & Students */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
          <span className="flex items-center gap-1">
            <span>📚</span>
            {course.lessons} Lessons
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            {course.students}
          </span>
          <span className="flex items-center gap-1">
           <Clock size={14} />
          {course.duration} hours
          </span>
        </div>

       

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 h-14">
          {course.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                className={i < Math.floor(course.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-900">{course.rating}</span>
          <span className="text-xs text-gray-600">({course.reviews})</span>
        </div>

        {/* Instructor */}
        <div className="text-xs text-gray-600 mb-4">By {course.instructor}</div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-supperagent">${course.price}</span>
            <span className="text-xs text-gray-500 line-through">${course.originalPrice}</span>
          </div>
          <button className="text-supperagent hover:text-supperagent/90 font-semibold text-sm">
            Enroll →
          </button>
        </div>
      </div>
    </div>
  );
}
