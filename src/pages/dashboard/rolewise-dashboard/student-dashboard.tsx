import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Clock, BookOpen, Play, TrendingUp, Award, 
  Target, AlertCircle, Calendar, GraduationCap 
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Import your axios instance
import axiosInstance from '@/lib/axios';

// --- Types based on your Provided JSON ---

interface Lesson {
  _id: string;
  title: string;
  duration: string; // "MM:SS" or "HH:MM:SS"
  type: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Instructor {
  _id: string;
  name: string;
  email: string;
}

interface CourseDetails {
  _id: string;
  title: string;
  description: string;
  categoryId: Category;    
  instructorId: Instructor; 
  image: string;
  price: number;
}

interface EnrolledCourseData {
  _id: string; 
  studentId: string;
  courseId: CourseDetails; // Populated Course Object
  progress: number;
  completedLessons: string[]; // Array of Lesson IDs
  startDate: string;
  status: string;
  // Derived properties (added after fetching modules/lessons)
  derivedTotalLessons?: number;
  derivedTotalDurationMin?: number; 
  derivedHoursLearned?: number;
}

export function StudentDashboard() {
  const navigate = useNavigate();
  // @ts-ignore
  const { user } = useSelector((state) => state.auth);

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseDurationToMinutes = (durationStr?: string): number => {
    if (!durationStr) return 0;
    const parts = durationStr.toString().split(':').map(Number);
    if (parts.length === 2) return parts[0] + parts[1] / 60; // MM:SS
    if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60; // HH:MM:SS
    return isNaN(Number(durationStr)) ? 0 : Number(durationStr);
  };

  const getCourseImage = (img?: string) => {
    return img && img.trim() !== "" 
      ? img 
      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop"; 
  };

  // --- Main Data Fetching Logic ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Enrolled Courses List
        const response = await axiosInstance.get('/enrolled-courses');
        const rawEnrollments: EnrolledCourseData[] = response.data.data.result;

        // 2. Deep Fetch: Get Modules & Lessons for EACH course to calculate real stats
        const detailedEnrollments = await Promise.all(
          rawEnrollments.map(async (enrollment) => {
            const courseId = enrollment.courseId._id;
            
            try {
              const modulesRes = await axiosInstance.get('/course-modules', {
                params: { courseId: courseId }
              });
              const modules = modulesRes.data.data.result;

              const modulesWithLessons = await Promise.all(
                modules.map(async (mod: any) => {
                  const lessonsRes = await axiosInstance.get('/course-lesson', {
                    params: { moduleId: mod._id }
                  });
                  return lessonsRes.data.data.result as Lesson[];
                })
              );

              // Flatten to get all lessons in one array
              const allLessons = modulesWithLessons.flat();

              // C. Calculate Stats
              const totalLessonsCount = allLessons.length;
              
              const totalDurationMin = allLessons.reduce(
                (acc, lesson) => acc + parseDurationToMinutes(lesson.duration), 0
              );

              const completedDurationMin = allLessons
                .filter(lesson => enrollment.completedLessons.includes(lesson._id))
                .reduce((acc, lesson) => acc + parseDurationToMinutes(lesson.duration), 0);

              return {
                ...enrollment,
                derivedTotalLessons: totalLessonsCount,
                derivedTotalDurationMin: totalDurationMin,
                derivedHoursLearned: completedDurationMin / 60 // Hours
              };

            } catch (err) {
              console.error(`Failed to fetch details for course ${courseId}`, err);
              // Fallback if detail fetch fails
              return {
                ...enrollment,
                derivedTotalLessons: 0,
                derivedTotalDurationMin: 0,
                derivedHoursLearned: 0
              };
            }
          })
        );

        setEnrolledCourses(detailedEnrollments);

      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError('Unable to load your dashboard. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    if (!enrolledCourses.length) return { avgProgress: 0, totalHours: 0, completedCount: 0 };

    const totalProgress = enrolledCourses.reduce((sum, item) => sum + (item.progress || 0), 0);
    const totalHours = enrolledCourses.reduce((sum, item) => sum + (item.derivedHoursLearned || 0), 0);
    const completedCount = enrolledCourses.filter(item => item.progress === 100).length;

    return {
      avgProgress: Math.round(totalProgress / enrolledCourses.length),
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      completedCount
    };
  }, [enrolledCourses]);

  // --- Find "Active" Course (Continue Learning) ---
  const activeCourse = useMemo(() => {
    // Prioritize courses started but not finished
    return enrolledCourses.find(c => c.progress > 0 && c.progress < 100) || enrolledCourses[0];
  }, [enrolledCourses]);

  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}!
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            You've spent <span className="font-bold text-slate-900">{stats.totalHours} hours</span> learning on the platform.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            label="Average Progress" 
            value={`${stats.avgProgress}%`} 
            icon={TrendingUp} 
            color="text-blue-600" 
            bg="bg-blue-50" 
            loading={loading}
          />
          <StatCard 
            label="Hours Learned" 
            value={`${stats.totalHours}h`} 
            icon={Clock} 
            color="text-emerald-600" 
            bg="bg-emerald-50" 
            loading={loading}
          />
          <StatCard 
            label="Courses Completed" 
            value={`${stats.completedCount}/${enrolledCourses.length}`} 
            icon={Award} 
            color="text-amber-600" 
            bg="bg-amber-50" 
            loading={loading}
          />
        </div>

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Continue Learning Hero Section */}
            {activeCourse && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold text-slate-900">Pick up where you left off</h2>
                </div>
                
                <Card className="border-0 shadow-lg overflow-hidden bg-white ring-1 ring-slate-100 group">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="w-full md:w-96 h-56 md:h-auto shrink-0 relative overflow-hidden">
                      <img 
                        src={getCourseImage(activeCourse.courseId.image)}
                        alt={activeCourse.courseId.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 hover:bg-white">
                        {activeCourse.courseId.categoryId.name}
                      </Badge>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2 text-sm text-slate-500">
                          <GraduationCap className="h-4 w-4" />
                          <span>By {activeCourse.courseId.instructorId.name}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">
                          {activeCourse.courseId.title}
                        </h3>
                        {/* Render HTML description safely or use a plain text fallback */}
                        <div className="text-slate-500 line-clamp-2 text-sm">
                           <div dangerouslySetInnerHTML={{ __html: activeCourse.courseId.description }} />
                        </div>
                      </div>

                      <div className="space-y-4 mt-auto">
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span className="text-slate-900">{activeCourse.progress}% Complete</span>
                          <span className="text-slate-500">
                            {activeCourse.completedLessons.length} / {activeCourse.derivedTotalLessons} Lessons
                          </span>
                        </div>
                        <Progress value={activeCourse.progress} className="h-2.5" />
                        
                        <div className="pt-2">
                          <Button 
                            onClick={() => navigate(`/student/course/${activeCourse.courseId._id}`)} 
                            size="lg"
                            className="w-full md:w-auto font-semibold shadow-md"
                          >
                            <Play className="h-4 w-4 mr-2 fill-current" />
                            Continue Learning
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* All Courses Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">My Courses</h2>
                <Badge variant="outline" className="px-3 py-1 text-slate-600">
                  {enrolledCourses.length} Enrolled
                </Badge>
              </div>

              {enrolledCourses.length === 0 ? (
                <EmptyState navigate={navigate} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((enrollment) => (
                    <CourseCard 
                      key={enrollment._id} 
                      enrollment={enrollment} 
                      navigate={navigate}
                      getCourseImage={getCourseImage}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-Components ---

function StatCard({ label, value, icon: Icon, color, bg, loading }: any) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
              <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            </div>
            <div className={`h-12 w-12 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CourseCard({ enrollment, navigate, getCourseImage }: { enrollment: EnrolledCourseData, navigate: any, getCourseImage: any }) {
  const { courseId, progress, derivedTotalLessons, derivedTotalDurationMin, startDate } = enrollment;
  const totalHours = derivedTotalDurationMin ? (derivedTotalDurationMin / 60).toFixed(1) : "0";

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 overflow-hidden flex flex-col h-full bg-white"
      onClick={() => navigate(`courses/${courseId._id}`)}
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
            <Play className="h-6 w-6 text-primary ml-1 fill-primary" />
          </div>
        </div>
        <Badge className="absolute top-3 right-3 shadow-sm bg-white/95 text-slate-800 hover:bg-white" variant="secondary">
          {courseId.categoryId.name}
        </Badge>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col">
        {/* Title & Instructor */}
        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-2 min-h-[3.5rem] leading-snug">
          {courseId.title}
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          By {courseId.instructorId.name}
        </p>
        
        <div className="mt-auto space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Progress</span>
              <span className={progress === 100 ? "text-emerald-600" : "text-primary"}>
                {progress}%
              </span>
            </div>
            {/* Custom Progress styling */}
            <Progress value={progress} className="h-1.5 bg-slate-100" />
          </div>

          {/* Metadata Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{derivedTotalLessons} Lessons</span>
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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-lg bg-white shadow-lg border-red-100">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to load dashboard</AlertTitle>
        <AlertDescription>
          {message}
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="w-full h-64 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-slate-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ navigate }: { navigate: any }) {
  return (
    <div className="text-center py-20 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">No active courses found</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        It looks like you haven't enrolled in any courses yet. Browse our catalog to start your learning journey.
      </p>
      <Button onClick={() => navigate('/courses')} size="lg">
        Browse Catalog
      </Button>
    </div>
  );
}