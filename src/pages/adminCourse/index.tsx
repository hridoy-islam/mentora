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
import { useNavigate } from 'react-router-dom';
import axiosInstance from "@/lib/axios"
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast()
  const fetchCourses = async (page, entriesPerPage, searchTerm = '') => {
    try {
      if (loading) setLoading(true);
      const response = await axiosInstance.get(`/courses`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setCourses(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchCourses(currentPage, entriesPerPage);
  }, []);

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const newStatus = status ? 'active' : 'block';
      const response = await axiosInstance.patch(`/courses/${id}`, { status: newStatus });

      if (response.data && response.data.success === true) {
        toast({
          title: 'Status updated successfully',
          className: 'bg-supperagent border-none text-white'
        });

        setCourses(prev => prev.map(c =>
          c._id === id
            ? { ...c, status: newStatus }
            : c
        ));
      } else {
        toast({
          variant: "destructive",
          title: 'Status update failed',
        });
      }

    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        variant: "destructive",

        title: 'An error occurred while updating status. Please try again.',
      }); fetchCourses(currentPage, entriesPerPage, searchTerm);
    }
  };

  const handleSearch = () => {
    fetchCourses(currentPage, entriesPerPage, searchTerm);
  };

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              className="h-8 w-[300px]"
            />
            <Button
              onClick={handleSearch}
              size="default"
              className="bg-supperagent hover:bg-supperagent/90 h-8 px-4"
            >
              Search
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            size="default"
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            size="default"
            onClick={() => navigate('create')}
            className="bg-supperagent hover:bg-supperagent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <BlinkingDots size="large" color="bg-supperagent" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="mb-4 h-12 w-12 text-gray-400" />
              <p className="text-lg">No courses found.</p>
              <Button
                onClick={() => navigate('create')}
                className="mt-4 bg-supperagent hover:bg-supperagent/90"
              >
                Create your first course
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course: any) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.categoryId?.name}</TableCell>
                    <TableCell>{course.instructorId?.name}</TableCell>
                    <TableCell>${course.price}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={course.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleStatusChange(course._id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 "
                                onClick={() =>
                                  navigate(`${course._id}/course-modules`)
                                }
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modules</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 "
                                onClick={() => navigate(`edit/${course._id}`)}
                              >
                                <Pen className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}


           {courses.length > 40 && (
                      <DataTablePagination
                        pageSize={entriesPerPage}
                        setPageSize={setEntriesPerPage}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    )}
        </CardContent>
      </Card>
    </div>
  );
}