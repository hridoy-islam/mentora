import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Loader2, 
  AlertCircle, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; 
import CourseCard, { EnrolledCourseData } from './components/course-card';
import { Loader } from '@/components/shared/MedicareLoader';

// --- Helper 1: Parse Duration ---
const parseDurationToMinutes = (durationStr?: string): number => {
  if (!durationStr) return 0;
  const parts = durationStr.toString().split(':').map(Number);
  // Handle MM:SS
  if (parts.length === 2) return parts[0] + parts[1] / 60; 
  // Handle HH:MM:SS
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60; 
  // Handle raw number strings "100"
  return isNaN(Number(durationStr)) ? 0 : Number(durationStr);
};

// --- Helper 2: Pagination Logic ---
const getPageNumbers = (totalPages: number, currentPage: number) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

// Type for API response
interface Lesson {
  _id: string;
  duration: string;
}

export function MyCourses() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  // Data States
  const [courses, setCourses] = useState<EnrolledCourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage] = useState(6);

  // Helper to handle images (passed to card)
  const getCourseImage = (img?: string) => {
    return img && img.trim() !== "" 
      ? img 
      : "/placeholder.jpg"; 
  };

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);
        setError('');

        // 1. Fetch Paginated Enrolled Courses List
        const res = await axiosInstance.get(`/enrolled-courses`, {
          params: {
            studentId: user._id, 
            page: currentPage,
            limit: entriesPerPage,
          },
        });

        const data = res.data.data;
        const rawEnrollments = data.result || [];

        // 2. Deep Fetch: Calculate Stats (Modules -> Lessons) for these specific courses
        const detailedEnrollments = await Promise.all(
          rawEnrollments.map(async (enrollment: any) => {
            const courseId = enrollment.courseId?._id;
            
            // Safeguard if courseId is missing
            if (!courseId) return enrollment;

            try {
              // A. Fetch Modules
              const modulesRes = await axiosInstance.get('/course-modules', {
                params: { courseId: courseId }
              });
              const modules = modulesRes.data.data.result;

              // B. Fetch Lessons for each module
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
              
              // Optional: Calculate Hours Learned based on completed IDs (if needed later)
              // const completedDurationMin = allLessons
              //   .filter(lesson => (enrollment.completedLessons || []).includes(lesson._id))
              //   .reduce((acc, lesson) => acc + parseDurationToMinutes(lesson.duration), 0);

              return {
                ...enrollment,
                derivedTotalLessons: totalLessonsCount,
                derivedTotalDurationMin: totalDurationMin,
                // derivedHoursLearned: completedDurationMin / 60 
              };

            } catch (err) {
              console.error(`Failed to fetch details for course ${courseId}`, err);
              // Fallback: return original enrollment without derived stats
              return {
                ...enrollment,
                derivedTotalLessons: 0,
                derivedTotalDurationMin: 0,
              };
            }
          })
        );
        
        setCourses(detailedEnrollments);
        
        // Handle pagination metadata
        if (data.meta && data.meta.totalPage) {
          setTotalPages(data.meta.totalPage);
        } else if (data.meta && data.meta.total) {
          setTotalPages(Math.ceil(data.meta.total / entriesPerPage));
        }

      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load your courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user?._id, currentPage, entriesPerPage]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Learning
          </h1>
          <p className="mt-2 text-slate-500">
            Manage your courses and track your progress.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <>
          <Loader/>
          </>
        ) : error ? (
          <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 text-center text-red-600">
            <AlertCircle className="mb-2 h-8 w-8" />
            <p>{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-slate-100 p-4">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No courses found</h3>
            <p className="mt-2 max-w-sm text-slate-500">
              You haven't enrolled in any courses yet.
            </p>
            <Button 
              onClick={() => navigate('/student/courses')} 
              className="mt-6 bg-supperagent text-white hover:bg-supperagent/90"
            >
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Course Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {courses.map((enrollment) => (
                <CourseCard 
                  key={enrollment._id} 
                  enrollment={enrollment} 
                  navigate={navigate}
                  getCourseImage={getCourseImage}
                />
              ))}
            </div>

            {/* Pagination UI (Pill Style) */}
            {totalPages > 1 && (
              <div className="mt-12 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
                
                {/* Mobile: Simple Text Info */}
                <p className="text-sm text-muted-foreground sm:hidden">
                  Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
                </p>

                {/* The Navigation Pill */}
                <div className="mx-auto flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                  {/* Previous Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-slate-100"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous</span>
                  </Button>

                  {/* Page Numbers (Desktop) */}
                  <div className="hidden items-center gap-1 sm:flex">
                    {getPageNumbers(totalPages, currentPage).map((page, i) =>
                      page === '...' ? (
                        <div key={i} className="flex h-9 w-9 items-center justify-center">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <Button
                          key={i}
                          variant={currentPage === page ? 'default' : 'ghost'}
                          size="icon"
                          className={cn(
                            'h-9 w-9 rounded-full transition-all',
                            currentPage === page
                              ? 'bg-supperagent text-white shadow-md hover:bg-supperagent/90'
                              : 'text-muted-foreground hover:bg-slate-100 hover:text-foreground'
                          )}
                          onClick={() => setCurrentPage(Number(page))}
                        >
                          {page}
                        </Button>
                      )
                    )}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-slate-100"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}