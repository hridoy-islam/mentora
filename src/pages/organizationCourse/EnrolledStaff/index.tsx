import { useEffect, useState } from 'react';
import { MoveLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Progress } from '@/components/ui/progress';
import { PDFDownloadLink } from '@react-pdf/renderer';
import moment from 'moment';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { CertificatePDF } from '@/pages/studentCertificates/components/CertificatePDF';

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
  updatedAt?: string;
}

export default function StaffStudentCoursesPage() {
  const { sid: studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Student details (common)
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // Active courses state
  const [activeEnrollments, setActiveEnrollments] = useState<EnrolledCourse[]>(
    []
  );
  const [activeLoading, setActiveLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [activeLimit, setActiveLimit] = useState(100);

  // Completed courses state
  const [completedEnrollments, setCompletedEnrollments] = useState<
    EnrolledCourse[]
  >([]);
  const [completedLoading, setCompletedLoading] = useState(true);
  const [completedPage, setCompletedPage] = useState(1);
  const [completedTotalPages, setCompletedTotalPages] = useState(1);
  const [completedLimit, setCompletedLimit] = useState(100);

  // Fetch student details once
  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) {
        toast({
          title: 'Error',
          description: 'Student ID is missing in the URL.',
          variant: 'destructive',
        });
        navigate(-1);
        return;
      }
      try {
        const res = await axiosInstance.get(`/users/${studentId}`);
        const userData = res.data.data;
        setStudentName(userData.name);
        setStudentEmail(userData.email);
      } catch (error: any) {
        console.error('Error fetching student details:', error);
        toast({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to load student details.',
          variant: 'destructive',
        });
      }
    };
    fetchStudentDetails();
  }, [studentId, navigate, toast]);

  // Fetch active courses
  const fetchActiveCourses = async (page: number, limit: number) => {
    if (!studentId) return;
    setActiveLoading(true);
    try {
      const response = await axiosInstance.get(`/enrolled-courses`, {
        params: {
          studentId,
          status: 'active',
          page,
          limit,
        },
      });
      const data = response.data.data;
      setActiveEnrollments(data.result || []);
      setActiveTotalPages(data.meta?.totalPage || 1);
    } catch (error: any) {
      console.error('Error fetching active courses:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch active courses.',
        variant: 'destructive',
      });
    } finally {
      setActiveLoading(false);
    }
  };

  // Fetch completed courses
  const fetchCompletedCourses = async (page: number, limit: number) => {
    if (!studentId) return;
    setCompletedLoading(true);
    try {
      const response = await axiosInstance.get(`/enrolled-courses`, {
        params: {
          studentId,
          status: 'completed',
          page,
          limit,
        },
      });
      const data = response.data.data;
      setCompletedEnrollments(data.result || []);
      setCompletedTotalPages(data.meta?.totalPage || 1);
    } catch (error: any) {
      console.error('Error fetching completed courses:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch completed courses.',
        variant: 'destructive',
      });
    } finally {
      setCompletedLoading(false);
    }
  };

  // Load data when pagination or studentId changes
  useEffect(() => {
    if (studentId) {
      fetchActiveCourses(activePage, activeLimit);
    }
  }, [studentId, activePage, activeLimit]);

  useEffect(() => {
    if (studentId) {
      fetchCompletedCourses(completedPage, completedLimit);
    }
  }, [studentId, completedPage, completedLimit]);

  // Render loading for active tab
  if (activeLoading && activeEnrollments.length === 0 && completedLoading && completedEnrollments.length === 0) {
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
          <CardTitle>{studentName ? `${studentName}'s Courses` : 'Student Courses'}</CardTitle>
          <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            {/* Active Courses Tab */}
            <TabsContent value="active">
              {activeLoading ? (
                <div className="flex justify-center py-6">
                  <BlinkingDots size="medium" color="bg-supperagent" />
                </div>
              ) : (
                <>
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
                      {activeEnrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                            No active courses found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeEnrollments.map((enrollment) => (
                          <TableRow key={enrollment._id}>
                            <TableCell className="font-medium">
                              {enrollment.courseId.title}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium capitalize text-blue-600">
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
                                ? moment(enrollment.startDate).format('DD MMM, YYYY')
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {enrollment.completedDate
                                ? moment(enrollment.completedDate).format('DD MMM, YYYY')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {activeTotalPages > 1 && (
                    <div className="mt-4">
                      <DataTablePagination
                        pageSize={activeLimit}
                        setPageSize={setActiveLimit}
                        currentPage={activePage}
                        totalPages={activeTotalPages}
                        onPageChange={setActivePage}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Completed Courses Tab */}
            <TabsContent value="completed">
              {completedLoading ? (
                <div className="flex justify-center py-6">
                  <BlinkingDots size="medium" color="bg-supperagent" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Title</TableHead>
                        <TableHead className="w-[150px]">Status</TableHead>
                        <TableHead className="w-[150px]">Start Date</TableHead>
                        <TableHead className="w-[200px] text-right">
                          Completion Date
                        </TableHead>
                        <TableHead className="w-[200px] text-right">
                          Certificate
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedEnrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                            No completed courses found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        completedEnrollments.map((enrollment) => (
                          <TableRow key={enrollment._id}>
                            <TableCell className="font-medium">
                              {enrollment.courseId.title}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium capitalize text-green-600">
                                {enrollment.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {enrollment.startDate
                                ? moment(enrollment.startDate).format('DD MMM, YYYY')
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {enrollment.completedDate
                                ? moment(enrollment.completedDate).format('DD MMM, YYYY')
                                : enrollment.updatedAt
                                ? moment(enrollment.updatedAt).format('DD MMM, YYYY')
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <PDFDownloadLink
                                document={
                                  <CertificatePDF
                                    studentName={studentName}
                                    courseTitle={enrollment.courseId.title}
                                    date={
                                      enrollment.completedDate
                                        ? moment(enrollment.completedDate).format('LL')
                                        : moment(enrollment.updatedAt).format('LL')
                                    }
                                    certificateId={enrollment._id}
                                  />
                                }
                                fileName={`${enrollment.courseId.title}-Certificate.pdf`}
                              >
                                {({ loading }) => (
                                  <Button size="sm" disabled={loading}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    {loading ? 'Preparing...' : 'View Certificate'}
                                  </Button>
                                )}
                              </PDFDownloadLink>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {completedTotalPages > 1 && (
                    <div className="mt-4">
                      <DataTablePagination
                        pageSize={completedLimit}
                        setPageSize={setCompletedLimit}
                        currentPage={completedPage}
                        totalPages={completedTotalPages}
                        onPageChange={setCompletedPage}
                      />
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}