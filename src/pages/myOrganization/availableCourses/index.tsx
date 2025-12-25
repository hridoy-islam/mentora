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
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';

export default function OrganizationAvailableCoursesPage() {
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Kept if you plan to use it later
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const { toast } = useToast();

  const { user } = useSelector((state: any) => state.auth);

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
      setCourses(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch course list.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage);
  }, []);

  const handleEnroll = async (license: any) => {
    if (!user?._id) {
        toast({
            title: "User not found. Please log in again.",
            variant: "destructive"
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
        startDate: new Date(license.createdAt), 
      };

      await axiosInstance.post('/enrolled-courses', payload);

      toast({
        title: 'Success',
        description: 'Successfully enrolled in the course',
        className: 'bg-green-600 text-white border-none'
      });

      fetchData(currentPage, entriesPerPage, searchTerm);

    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: 'Enrollment Failed',
        description: error?.response?.data?.message || 'Could not enroll in course.',
        variant: 'destructive'
      });
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead className="text-center">Total Available</TableHead>
                <TableHead className="text-center">Available Seats</TableHead>
                <TableHead className="text-center">Remaining</TableHead>
                <TableHead className="text-center">Purchase Date</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    {loading ? (
                      <div className="flex justify-center py-6">
                        <BlinkingDots size="large" color="bg-supperagent" />
                      </div>
                    ) : (
                      'No enrolled courses found.'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((license: any) => {
                  const seatsFull = license.usedSeats >= license.totalSeats;
                  const isProcessing = enrollingId === license._id;
                  const isDisabled = !license.isActive || seatsFull || isProcessing;

                  return (
                    <TableRow key={license._id}>
                      <TableCell className="font-medium">
                        {license.courseId?.title || 'Unknown Course'}
                      </TableCell>
                      <TableCell className="text-center">
                        {license.totalSeats}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {license.usedSeats}
                      </TableCell>
                      <TableCell className="text-center text-gray-500">
                        {license.totalSeats - license.usedSeats}
                      </TableCell>
                      <TableCell className="text-center">
                        {moment(license.createdAt).format('L')}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={license.isActive ? 'default' : 'secondary'}
                          className={
                            license.isActive
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-400'
                          }
                        >
                          {license.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        
                        {/* --- ALERT DIALOG WRAPPER --- */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              disabled={isDisabled}
                              className={seatsFull ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : seatsFull ? (
                                "Full"
                              ) : (
                                "Enroll Course"
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          
                          {/* Only render content if button is clickable (though disabled button above prevents click anyway) */}
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Enrollment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to enroll in <strong>{license.courseId?.title}</strong>? 
                                
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              {/* The action triggers the actual enroll function */}
                              <AlertDialogAction 
                                onClick={() => handleEnroll(license)}
                                className="bg-supperagent hover:bg-supperagent/90"
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {courses.length > 0 && (
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