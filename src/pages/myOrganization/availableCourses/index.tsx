import { useEffect, useState } from 'react';
import {
  MoveLeft,
  Loader2,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Ensure this path is correct for your project

// --- INTERFACES ---
interface Course {
  _id: string;
  title: string;
  image?: string;
  categoryId?: { name: string };
  instructorId?: { name: string };
  rating?: number;
  students?: number;
}

interface License {
  _id: string;
  courseId: Course;
  totalSeats: number;
  usedSeats: number;
  isActive: boolean;
  companyId: string;
  createdAt: string;
}

// --- HELPER FOR PAGINATION ---
const getPageNumbers = (totalPages: number, currentPage: number) => {
  // If total pages are few, show all
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If near the start
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // If near the end
  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages
    ];
  }

  // If in the middle
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages
  ];
};

export default function OrganizationAvailableCoursesPage() {
  const [courses, setCourses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const navigate = useNavigate();
const{id} = useParams()
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage] = useState(12); // Grid friendly number
  const [userData, setUserData] = useState()
  const { toast } = useToast();
  const { user } = useSelector((state: any) => state.auth);

  // --- FETCH DATA ---
  const fetchData = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/course-license`, {
        params: {
          page,
          limit,
          ...(search ? { searchTerm: search } : {})
        }
      });

       const res = await axiosInstance.get(`/users/${id}`);

       setUserData(res.data.data)
      setCourses(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to fetch course list.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, [currentPage, entriesPerPage]);

  // --- HANDLE ENROLL ---
  const handleEnroll = async (license: License) => {
    if (!user?._id) {
      toast({
        title: 'User not found. Please log in again.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setEnrollingId(license._id);

      const payload = {
        studentId: user._id,
        courseId: license.courseId._id,
        purchasedBy: license.companyId,
        licenseId: license._id,
        startDate: new Date(license.createdAt)
      };

      await axiosInstance.post('/enrolled-courses', payload);

      toast({
        title: 'Success',
        description: 'Successfully enrolled in the course',
        className: 'bg-green-600 text-white border-none'
      });

     
      fetchData(currentPage, entriesPerPage);
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: 'Enrollment Failed',
        description:
          error?.response?.data?.message || 'Could not enroll in course.',
        variant: 'destructive'
      });
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 sm:px-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
           {userData? <>{userData?.name}'s Courses</>:<>Available Courses</>} 
          </h1>
          <p className="mt-1 text-muted-foreground">
            Browse and enroll in courses provided by your organization.
          </p>
        </div>
        <Button size="default" onClick={() => navigate(-1)} variant="outline">
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* --- GRID CONTENT --- */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-6">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            No Courses Available
          </h3>
          <p className="mt-2 text-gray-500">
            Your organization hasn't purchased any courses yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((license, index) => {
            const seatsFull = license.usedSeats >= license.totalSeats;
            const isProcessing = enrollingId === license._id;
            const isDisabled = !license.isActive || seatsFull || isProcessing;
            const course = license.courseId;

            return (
              <motion.div
                key={license._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="h-full"
              >
                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    !license.isActive ? 'opacity-75 grayscale' : ''
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <motion.img
                      src={course.image || 'placeholder.jpg'}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Content Section */}
                  <div className="flex flex-grow flex-col p-5">
                    {/* Title */}
                    <h3
                      className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-supperagent"
                      title={course?.title}
                    >
                      {course?.title || 'Untitled Course'}
                    </h3>

                    {/* Instructor */}
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {course?.instructorId?.name ||
                          'Organization Instructor'}
                      </span>
                    </div>

                    {/* Footer: Seats + Enroll Button */}
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      {/* Enrollment Action with Dialog */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            disabled={isDisabled}
                            className={`w-full rounded-xl px-4 font-medium shadow-md transition-all 
                                    ${
                                      seatsFull
                                        ? 'bg-gray-100 text-gray-400 shadow-none hover:bg-gray-100'
                                        : 'bg-supperagent text-white shadow-supperagent/20 hover:bg-supperagent/90'
                                    }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Enroll Now'
                            )}
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Confirm Enrollment
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to enroll in{' '}
                              <strong>{course?.title}</strong>?
                              <br />
                              <span className="mt-2 block text-xs text-gray-500">
                                This will use one of the organization's
                                available licenses.
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleEnroll(license)}
                              className="bg-supperagent hover:bg-supperagent/90"
                            >
                              Confirm Enrollment
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* --- PAGINATION --- */}
      {courses.length > 6 && (
        <div className="mt-12 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Mobile: Simple Text Info (Hidden on Desktop) */}
          <p className="text-sm text-muted-foreground sm:hidden">
            Page{' '}
            <span className="font-medium text-foreground">{currentPage}</span>{' '}
            of <span className="font-medium text-foreground">{totalPages}</span>
          </p>

          {/* The Navigation Pill */}
          <div className="mx-auto flex items-center gap-1 rounded-full border bg-background/95 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>

            {/* Page Numbers (Desktop + Tablet) */}
            <div className="hidden items-center gap-1 sm:flex">
              {getPageNumbers(totalPages, currentPage).map((page, i) =>
                page === '...' ? (
                  <div
                    key={i}
                    className="flex h-9 w-9 items-center justify-center"
                  >
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
                        ? 'shadow-md hover:bg-supperagent/90'
                        : 'text-muted-foreground hover:text-white'
                    )}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            {/* Mobile: Current Page Indicator (Hidden on Desktop) */}
            <div className="flex h-9 min-w-[3rem] items-center justify-center rounded-full bg-secondary px-3 text-sm font-medium sm:hidden">
              {currentPage} / {totalPages}
            </div>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}