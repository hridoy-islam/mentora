import { useEffect, useState } from 'react';
import { MoveLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Progress } from '@/components/ui/progress'; // Assuming you have a Progress component
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

export default function StaffEnrollCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffDetails, setStaffDetails] = useState({ name: '', email: '' });
  // --- Pagination & Search ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const {sid: studentId } = useParams();

  const fetchEnrollments = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    if (!studentId) {
      toast({
        title: 'Error',
        description: 'Staff ID is missing in the URL.',
        variant: 'destructive'
      });
      navigate(-1); // Go back if ID is missing
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/enrolled-courses?studentId=${studentId}`,
        {
          params: {
            
            page,
            limit,
            ...(search ? { searchTerm: search } : {})
          }
        }
      );
      const res = await axiosInstance.get(`/users/${studentId}`);

      let userData = res.data.data;

      const enrolledCourses: EnrolledCourse[] = response.data.data.result;
      setEnrollments(enrolledCourses);
      setTotalPages(response.data.data.meta.totalPage);

      setStaffDetails({
        name: userData.name,
        email: userData.email
      });
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message ||
          'Failed to fetch staff enrollments.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments(currentPage, entriesPerPage, searchTerm);
  }, [studentId, currentPage, entriesPerPage]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff: {staffDetails.name}</h1>
        <Button size="default" onClick={() => navigate(-1)} variant="outline">
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main Enrollments Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead className="w-[200px]">Progress</TableHead>
                <TableHead className="w-[150px]">Start Date</TableHead>
                <TableHead className="w-[200px] text-right">
                  Completion Date
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {enrollments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    This staff member is not currently enrolled in any courses.
                  </TableCell>
                </TableRow>
              ) : (
                enrollments.map((enrollment) => (
                  <TableRow key={enrollment._id}>
                    <TableCell className="font-medium">
                      {enrollment.courseId.title}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium capitalize ${
                          enrollment.status === 'active'
                            ? 'text-blue-600'
                            : enrollment.status === 'completed'
                              ? 'text-green-600'
                              : 'text-red-600'
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={enrollment.progress} className="h-2" />
                        <span>{enrollment.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.startDate
                        ? moment(enrollment.startDate).format('DD MMM,YYYY')
                        : '-'}
                    </TableCell>

                    <TableCell className="text-right">
                      {enrollment.completedDate
                        ? moment(enrollment.completedDate).format('DD MMM,YYYY')
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {enrollments.length > 10 && (
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
        </CardContent>
      </Card>
    </div>
  );
}
