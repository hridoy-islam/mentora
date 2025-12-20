import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, BookOpen, Clock } from 'lucide-react';

// Define the interface for your enrollment data
export interface EnrolledCourseData {
  _id: string;
  progress: number;
  derivedTotalLessons?: number;
  derivedTotalDurationMin?: number;
  startDate?: string;
  courseId: {
    _id: string;
    title: string;
    slug: string;
    image: string;
    instructorId?: {
      name: string;
    };
    categoryId?: {
      name: string;
    };
  };
}

interface CourseCardProps {
  enrollment: EnrolledCourseData;
  navigate: (path: string) => void;
  getCourseImage: (imagePath?: string) => string;
}

export default function CourseCard({ enrollment, navigate, getCourseImage }: CourseCardProps) {
  const { courseId, progress, derivedTotalLessons, derivedTotalDurationMin } = enrollment;
  const totalHours = derivedTotalDurationMin ? (derivedTotalDurationMin / 60).toFixed(1) : "0";

  // Safeguard: if courseId is missing (deleted course), don't render
  if (!courseId) return null;

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 overflow-hidden flex flex-col h-full bg-white"
      onClick={() => navigate(`/student/courses/${courseId.slug}`)}
    >
      {/* Image Area */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={getCourseImage(courseId.image)}
          alt={courseId.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Play className="h-6 w-6 text-supperagent ml-1 fill-supperagent" />
          </div>
        </div>
        {courseId.categoryId?.name && (
          <Badge className="absolute top-3 right-3 shadow-sm bg-white/95 text-slate-800 hover:bg-white" variant="secondary">
            {courseId.categoryId.name}
          </Badge>
        )}
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Title & Instructor */}
        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2 min-h-[3.5rem] leading-snug">
          {courseId.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          By {courseId.instructorId?.name || 'Unknown Instructor'}
        </p>
        
        <div className="mt-auto space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Progress</span>
              <span className={progress === 100 ? "text-emerald-600" : "text-supperagent"}>
                {progress || 0}%
              </span>
            </div>
            {/* Custom Progress styling */}
            <Progress value={progress || 0} className="h-1.5 bg-slate-100" />
          </div>

          {/* Metadata Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{derivedTotalLessons || 0} Lessons</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalHours}h</span>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}