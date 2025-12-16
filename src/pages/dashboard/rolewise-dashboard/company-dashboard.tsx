import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import moment from 'moment';


export function CompanyDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const[totalCourse,setTotalCourse] = useState(0);
  const[totalAmount,setTotalAmount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');

  // Get user from Redux
  const { user } = useSelector((state: any) => state.auth);
  
  const fetchData = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setInitialLoading(true);
      
      const response = await axiosInstance.get(`/course-license`, {
        params: {
          companyId: user?._id,
          page,
          limit,
          ...(search ? { searchTerm: search } : {})
        }
      });

      setTotalCourse(response.data.data.meta.total||0)
      setCourses(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
      setTotalAmount(response.data.data.totalOrderAmount||0)
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


  const companyStats = [
    { title: 'Purchase Amount', value: `£${totalAmount}` },
    { title: 'Total Course', value: totalCourse }
  ];

  useEffect(() => {
    if (user?._id) {
      fetchData(currentPage, entriesPerPage);
    }
  }, [currentPage, entriesPerPage, user?._id]);

  return (
    <div className="flex-1 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || 'User'} 👋
        </h2>
      </div>

      {/* Section 1: Profile & Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Stats Grid */}
        <div className="lg:col-span-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {companyStats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Course List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Enrolled Course List
          </CardTitle>
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
                    {initialLoading
                      ? 'Loading...'
                      : 'No enrolled courses found.'}
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
