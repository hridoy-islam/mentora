import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Clock,
  BookOpen,
  Play,
  Award,
  Target,
  AlertCircle,
  GraduationCap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

// Import your axios instance
import axiosInstance from '@/lib/axios';

// --- Types ---

interface Lesson {
  _id: string;
  title: string;
  duration: string;
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
  slug?: string; // Assuming slug exists for navigation
}

interface EnrolledCourseData {
  _id: string;
  studentId: string;
  courseId: CourseDetails;
  progress: number;
  completedLessons: string[];
  // Added based on your Mongoose Schema
  status: 'active' | 'completed' | 'dropped';
  startDate: string;

  // Derived properties
  derivedTotalLessons?: number;
  derivedTotalDurationMin?: number;
  derivedHoursLearned?: number;
}

export function StudentDashboard() {
  const navigate = useNavigate();
  // @ts-ignore
  const { user } = useSelector((state) => state.auth);

  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Helper Functions ---
  const parseDurationToMinutes = (durationStr?: string): number => {
    if (!durationStr) return 0;
    const parts = durationStr.toString().split(':').map(Number);
    if (parts.length === 2) return parts[0] + parts[1] / 60;
    if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
    return isNaN(Number(durationStr)) ? 0 : Number(durationStr);
  };

  const getCourseImage = (img?: string) => {
    return img && img.trim() !== '' ? img : '/placeholder.jpg';
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Enrolled Courses
        const response = await axiosInstance.get(
          `/enrolled-courses?studentId=${user?._id}`
        );
        const rawEnrollments: EnrolledCourseData[] = response.data.data.result;

        // 2. Deep Fetch for Lesson Counts & Duration
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
                  const lessonsRes = await axiosInstance.get(
                    '/course-lesson?fields=moduleId,title type',
                    {
                      params: { moduleId: mod._id }
                    }
                  );
                  return lessonsRes.data.data.result as Lesson[];
                })
              );

              const allLessons = modulesWithLessons.flat();

              const totalLessonsCount = allLessons.length;
              const totalDurationMin = allLessons.reduce(
                (acc, lesson) => acc + parseDurationToMinutes(lesson.duration),
                0
              );

              const completedDurationMin = allLessons
                .filter((lesson) =>
                  enrollment.completedLessons.includes(lesson._id)
                )
                .reduce(
                  (acc, lesson) =>
                    acc + parseDurationToMinutes(lesson.duration),
                  0
                );

              return {
                ...enrollment,
                derivedTotalLessons: totalLessonsCount,
                derivedTotalDurationMin: totalDurationMin,
                derivedHoursLearned: completedDurationMin / 60
              };
            } catch (err) {
              console.error(
                `Failed to fetch details for course ${courseId}`,
                err
              );
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
        setError(
          'Unable to load your dashboard. Please check your connection.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    if (!enrolledCourses.length) return { totalEnrolled: 0, completedCount: 0 };

    // Count completed courses based on Schema Status or 100% progress
    const completedCount = enrolledCourses.filter(
      (item) => item.status === 'completed' || item.progress === 100
    ).length;

    return {
      totalEnrolled: enrolledCourses.length,
      completedCount
    };
  }, [enrolledCourses]);

  // --- Active Course Logic ---
  const activeCourse = useMemo(() => {
    return (
      enrolledCourses.find(
        (c) => c.progress > 0 && c.progress < 100 && c.status !== 'completed'
      ) || enrolledCourses[0]
    );
  }, [enrolledCourses]);

  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Student'}!
          </h1>
          <p className="mt-2 text-slate-500">
            Track your progress and continue learning.
          </p>
        </div>

        {/* --- 2 MAIN STAT CARDS --- */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Total Courses */}
          <StatCard
            label="Total Courses Enrolled"
            value={stats.totalEnrolled}
            icon={BookOpen}
            color="text-blue-600"
            bg="bg-blue-50"
            borderColor="border-blue-100"
            loading={loading}
          />

          {/* Card 2: Courses Completed */}
          <StatCard
            label="Courses Completed"
            value={stats.completedCount}
            icon={Award}
            color="text-emerald-600"
            bg="bg-emerald-50"
            borderColor="border-emerald-100"
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
                <div className="mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-supperagent" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Pick up where you left off
                  </h2>
                </div>

                <Card className="group overflow-hidden border-0 bg-white shadow-lg ring-1 ring-slate-100">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="relative h-56 w-full shrink-0 overflow-hidden md:h-auto md:w-96">
                      <img
                        src={getCourseImage(activeCourse.courseId.image)}
                        alt={activeCourse.courseId.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                      <Badge className="absolute left-4 top-4 bg-white/90 text-slate-900 hover:bg-white">
                        {activeCourse.courseId?.categoryId?.name}
                      </Badge>
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
                      <div className="mb-6">
                        {activeCourse.courseId?.instructorId && (
                          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                            <GraduationCap className="h-4 w-4" />
                            <span>
                              By {activeCourse.courseId?.instructorId?.name}
                            </span>
                          </div>
                        )}

                        <h3 className="mb-2 text-2xl font-bold text-slate-900">
                          {activeCourse.courseId.title}
                        </h3>
                        <div className="line-clamp-2 text-sm text-slate-500">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: activeCourse.courseId.description
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span className="text-slate-900">
                            {activeCourse.progress}% Complete
                          </span>
                          <span className="text-slate-500">
                            {activeCourse.completedLessons.length} /{' '}
                            {activeCourse.derivedTotalLessons} Lessons
                          </span>
                        </div>
                        <Progress
                          value={activeCourse.progress}
                          className="h-2.5"
                        />

                        <div className="pt-2">
                          <Button
                            onClick={() =>
                              navigate(
                                `/student/courses/${activeCourse.courseId?.slug}`
                              )
                            }
                            size="lg"
                            className="w-full bg-supperagent font-semibold shadow-md hover:bg-supperagent/90 md:w-auto"
                          >
                            <Play className="mr-2 h-4 w-4 fill-current" />
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
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    My Courses
                  </h2>
                  <Badge variant="outline" className="px-3 py-1 text-slate-600">
                    {enrolledCourses.length} Enrolled
                  </Badge>
                </div>

                {/* --- SHOW ALL COURSES BUTTON --- */}
                <Button
                  size="sm"
                  onClick={() => navigate('/student/my-courses')}
                  className="group  rounded-full text-white transition-all duration-300 hover:border-supperagent hover:bg-supperagent/90"
                >
                  Show All Courses
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              {enrolledCourses.length === 0 ? (
                <EmptyState navigate={navigate} />
              ) : (
                // Only show first 3 or 6 courses in dashboard summary if you want limit,
                // otherwise it shows all here too. Currently shows all.
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.slice(0, 6).map((enrollment) => (
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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  borderColor,
  loading
}: any) {
  return (
    <Card
      className={`border shadow-sm transition-all duration-300 hover:shadow-md ${borderColor ? borderColor : 'border-slate-100'}`}
    >
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <div
              className={`h-16 w-16 ${bg} flex shrink-0 items-center justify-center rounded-2xl`}
            >
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-500">{label}</p>
              <h3 className="text-4xl font-bold text-slate-900">{value}</h3>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CourseCard({
  enrollment,
  navigate,
  getCourseImage
}: {
  enrollment: EnrolledCourseData;
  navigate: any;
  getCourseImage: any;
}) {
  const {
    courseId,
    progress,
    derivedTotalLessons,
    derivedTotalDurationMin,
    status
  } = enrollment;
  const totalHours = derivedTotalDurationMin
    ? (derivedTotalDurationMin / 60).toFixed(1)
    : '0';

  const isCompleted = status === 'completed' || progress === 100;

  return (
    <Card
      className="group flex h-full cursor-pointer flex-col overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:shadow-xl"
      onClick={() => navigate(`courses/${courseId?.slug}`)}
    >
      {/* Image Area */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={getCourseImage(courseId.image)}
          alt={courseId.title}
          className={`h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105 ${isCompleted ? 'grayscale-[50%]' : ''}`}
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="translate-y-4 transform rounded-full bg-white p-3 shadow-lg transition-transform duration-300 group-hover:translate-y-0">
            <Play className="ml-1 h-6 w-6 fill-supperagent text-supperagent" />
          </div>
        </div>

        {/* Category Badge */}
        <Badge
          className="absolute right-3 top-3 bg-white/95 text-slate-800 shadow-sm hover:bg-white"
          variant="secondary"
        >
          {courseId.categoryId?.name}
        </Badge>

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
            <CheckCircle className="h-3 w-3" /> Completed
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-snug text-slate-900">
          {courseId.title}
        </h3>

        {courseId.instructorId && (
          <p className="mb-4 text-sm text-slate-500">
            By {courseId.instructorId?.name}
          </p>
        )}

        <div className="mt-auto space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Progress</span>
              <span
                className={
                  isCompleted ? 'text-emerald-600' : 'text-supperagent'
                }
              >
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5 bg-slate-100" />
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
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
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Alert
        variant="destructive"
        className="max-w-lg border-red-100 bg-white shadow-lg"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Unable to load dashboard</AlertTitle>
        <AlertDescription>
          {message}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
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
    <div className="animate-pulse space-y-8">
      {/* 2 Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-32 rounded-xl bg-slate-200" />
        <div className="h-32 rounded-xl bg-slate-200" />
      </div>
      <div className="h-64 w-full rounded-xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ navigate }: { navigate: any }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
        <BookOpen className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">
        No active courses found
      </h3>
      <p className="mx-auto mb-8 max-w-md text-slate-500">
        It looks like you haven't enrolled in any courses yet. Browse our
        catalog to start your learning journey.
      </p>
      <Button
        onClick={() => navigate('/student/courses')}
        size="lg"
        className="bg-supperagent hover:bg-supperagent/90"
      >
        Browse Catalog
      </Button>
    </div>
  );
}
