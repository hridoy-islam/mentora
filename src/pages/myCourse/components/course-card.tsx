import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnrolledCourse } from '@/lib/courses';
import { BookOpen, Clock, Play, Star, Users, CalendarDays } from 'lucide-react';

interface CourseCardProps {
  course: EnrolledCourse;
  onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const progressPercentage = Math.round(course.progress);

  const formatLastAccessed = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-300 overflow-hidden group">
      
      {/* Image Section */}
      <div className="relative h-48 bg-supperagent overflow-hidden">
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Button size="sm" className="gap-2" onClick={onClick}>
            <Play className="h-4 w-4" />
            Continue
          </Button>
        </div>

        <Badge className="absolute top-3 right-3">{course.category}</Badge>
      </div>

      {/* Content Section */}
      <CardContent className="pt-5 pb-5 flex flex-col h-full">

        {/* Title + Instructor */}
        <div className="mb-4 ">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-black">
            {course.title}
          </h3>

          <p className="text-sm mb-3 text-black">
            by {course.instructor}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 text-sm mb-4 text-black">
            <div className="flex items-center gap-0.5">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-black">{course.rating}</span>
            </div>
            <span className="text-black">({course.reviews} reviews)</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4 pb-4 ">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-black">Progress</span>
            <span className="text-sm font-semibold text-primary">{progressPercentage}%</span>
          </div>

          {/* Custom Progress Bar */}
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-supperagent transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center gap-1 p-2 bg-supperagent rounded-lg">
            <BookOpen className="h-4 w-4 text-white" />
            <span className="text-xs font-medium text-white">{course.lessons}</span>
            <span className="text-xs text-white">Lessons</span>
          </div>

          <div className="flex flex-col items-center gap-1 p-2 bg-supperagent rounded-lg">
            <Clock className="h-4 w-4 text-white" />
            <span className="text-xs font-medium text-white">{course.duration}h</span>
            <span className="text-xs text-white">Hours</span>
          </div>

          <div className="flex flex-col items-center gap-1 p-2 bg-supperagent rounded-lg">
            <Users className="h-4 w-4 text-white" />
            <span className="text-xs font-medium text-white">{course.students}</span>
            <span className="text-xs text-white">Students</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-300 text-black">
          <span className="text-black">Last accessed: {formatLastAccessed(course.lastAccessed)}</span>
          <CalendarDays className="h-3.5 w-3.5" />
        </div>

      </CardContent>
    </Card>
  );
}
