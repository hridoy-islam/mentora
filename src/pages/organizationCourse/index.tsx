import { useEffect, useState } from 'react';
import { MoveLeft, Search, BookOpen } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';

export default function OrganizationCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100); // Default to 10 for courses
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  // --- FETCH DATA ---
  const fetchData = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setInitialLoading(true);
      
      const response = await axiosInstance.get(
        `/course-license`, 
        {
          params: {
            companyId: user?._id, 
            page,
            limit,
            ...(search ? { searchTerm: search } : {})
          }
        }
      );

      // Assuming standard response structure based on your previous file
      // Adjust .data.data.result / .data.result based on your actual API wrapper
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
      setInitialLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
  
      

      {/* TABLE CARD */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
             <BookOpen className="h-5 w-5" /> Enrolled Course List
          </CardTitle>
           <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead className="text-center">Total Available</TableHead>
                <TableHead className="text-center">Available Seats</TableHead>
                <TableHead className="text-center">Remaining</TableHead>
                <TableHead className="text-center">Purchase Date</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-gray-500"
                  >
                    No enrolled courses found.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((license) => (
                  <TableRow key={license._id}>
                    <TableCell className="font-medium">
                      {/* Using optional chaining as requested */}
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
                       {new Date(license.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={license.isActive ? "default" : "secondary"}
                        className={license.isActive ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}
                      >
                        {license.isActive ? 'Active' : 'Inactive'}
                      </Badge>
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