import { useEffect, useState } from 'react';
import { Plus, Pen, Settings, MoveLeft } from 'lucide-react';
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
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function OrganizationStaffPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast(); // Initialize toast hook
    const navigate = useNavigate()
    const {id} = useParams()
  const fetchData = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/users?organizationId=${id}`, {
        params: {
          role: 'student',
          page,
          limit,
          ...(search ? { searchTerm: search } : {}) // Send searchTerm if it exists
        }
      });
      setStudents(response.data.data.result); // Set the correct state variable
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to fetch students.',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';

      await axiosInstance.patch(`/users/${id}`, { status: updatedStatus });

      // Update state locally 👇
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === id ? { ...student, status: updatedStatus } : student
        )
      );

      toast({
        title: 'Student status updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to update status.',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]); // Added searchTerm to dependency array

  useEffect(() => {
    if (!dialogOpen) {
      setEditingStudent(null);
    }
  }, [dialogOpen]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchData(1, entriesPerPage, searchTerm);
  };

  // Handle Enter key press in search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-3 ">
      <div className="flex items-center justify-between">
        <div className='flex flex-row items-center gap-4'>
          <h1 className="text-2xl font-semibold">All Staff</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown} // Trigger search on Enter
              placeholder="Search by Name, Email"
              className="h-8 min-w-[300px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="min-w-[100px] border-none bg-supperagent text-white hover:bg-supperagent/90"
            >
              Search
            </Button>
          </div>
        </div>

         <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
      </div>
      <Card className="">
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-gray-500"
                  >
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={student.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleStatusChange(student._id, checked)
                        }
                        className="mx-auto"
                      />
                    </TableCell>
                    <TableCell className="space-x-1 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-supperagent text-white hover:bg-supperagent/90"
                        onClick={() => handleEdit(student)}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {students.length > 40 && (
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
