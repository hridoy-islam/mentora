import { useEffect, useState } from 'react';
import { MoveLeft, Archive } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useToast } from '@/components/ui/use-toast';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

export default function ArchivedCoursesPage() {
  const [courses, setCourses] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const { toast } = useToast();

  const fetchCourses = async (page, entriesPerPage, searchTerm = '') => {
    try {
      const response = await axiosInstance.get(`/courses/archived`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {})
        }
      });
      setCourses(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching archived courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(currentPage, entriesPerPage);
  }, []);

  const handleStatusChange = async (id: string, status: boolean) => {
    if (!status) return;
    try {
      const response = await axiosInstance.patch(`/courses/${id}`, {
        status: 'active'
      });

      if (response.data && response.data.success === true) {
        toast({
          title: 'Course restored successfully',
          className: 'bg-supperagent border-none text-white'
        });
        // Show the new status briefly, then remove it from the archive
        setCourses((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: 'active' } : c))
        );
        setTimeout(() => {
          setCourses((prev) => prev.filter((c) => c._id !== id));
        }, 1000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Status update failed'
        });
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred while updating status. Please try again.'
      });
      fetchCourses(currentPage, entriesPerPage, searchTerm);
    }
  };

  const handleSearch = () => {
    fetchCourses(currentPage, entriesPerPage, searchTerm);
  };

  return (
    <div className="space-y-3 ">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-4">
            <CardTitle>Archived Courses</CardTitle>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search archived courses..."
                className="h-8 w-[300px]"
              />
              <Button
                onClick={handleSearch}
                size="default"
                className="h-8 bg-supperagent px-4 hover:bg-supperagent/90"
              >
                Search
              </Button>
            </div>
          </div>
          <Button
            size="default"
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <BlinkingDots size="large" color="bg-supperagent" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Archive className="mb-4 h-12 w-12 text-gray-400" />
              <p className="text-lg">No archived courses.</p>
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
                      <div className="flex flex-row items-center justify-center gap-2">
                        <Switch
                          checked={course.status === 'active'}
                          onCheckedChange={(checked) =>
                            handleStatusChange(course._id, checked)
                          }
                        />
                        <span
                          className={`text-sm font-medium ${
                            course.status === 'active'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {course.status === 'active' ? 'Active' : 'Disable'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages> 1 && (
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
