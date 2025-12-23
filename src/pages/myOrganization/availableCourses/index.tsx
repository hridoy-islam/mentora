import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';

export default function OrganizationAvailableCoursesPage() {
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const { id } = useParams();
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();
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
  }, []);

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
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
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-gray-500"
                  >
                    {loading ? (
                      <>
                        <div className="flex justify-center py-6">
                          <BlinkingDots size="large" color="bg-supperagent" />
                        </div>
                      </>
                    ) : (
                      'No enrolled courses found.'
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((license) => (
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
                        <Button>
                            Enroll Course
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
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
