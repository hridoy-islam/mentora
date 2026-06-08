import { useEffect, useState } from 'react';
import { MoveLeft, BookOpen, User, Calendar, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

interface EnrolledCourse {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  startDate?: string;
  completedDate?: string;
}

export default function OrganizationStaffEnrollCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { lid } = useParams();

  const fetchEnrollments = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/enrolled-courses?licenseId=${lid}&status=active`,
        {
          params: {
            page,
            limit,
            ...(search ? { searchTerm: search } : {})
          }
        }
      );

      const enrolledCourses: EnrolledCourse[] = response.data.data.result;
      setEnrollments(enrolledCourses);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to fetch staff enrollments.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments(currentPage, entriesPerPage, searchTerm);
  }, [lid, currentPage, entriesPerPage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'dropped':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Enrolled Courses
          </CardTitle>
          <Button
            size="default"
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No staff members are currently enrolled in any courses.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((enrollment) => (
                  <Card
                    key={enrollment._id}
                    className="overflow-hidden shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="bg-muted/30 px-4 py-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {enrollment.courseId.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-3 space-y-3">
                      {/* Staff Name */}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {enrollment.studentId.name}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getStatusColor(
                            enrollment.status
                          )} capitalize`}
                          variant="outline"
                        >
                          {enrollment.status}
                        </Badge>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BarChart className="h-3 w-3" />
                            Progress
                          </span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress
                          value={enrollment.progress}
                          className="h-2"
                        />
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {enrollment.startDate
                              ? moment(enrollment.startDate).format(
                                  'DD MMM, YYYY'
                                )
                              : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <span>
                            {enrollment.completedDate
                              ? moment(enrollment.completedDate).format(
                                  'DD MMM, YYYY'
                                )
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4">
                  <DataTablePagination
                    pageSize={entriesPerPage}
                    setPageSize={setEntriesPerPage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}