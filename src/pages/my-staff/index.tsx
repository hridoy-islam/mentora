import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Loader } from 'lucide-react'; // Added Loader
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'; // Added Dialog components
import { Label } from '@/components/ui/label'; // Added Label
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form'; // Added react-hook-form

// Define form inputs type
type StaffFormInputs = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  dateOfBirth?: string;
};

export default function MyStaffPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false); // New state for form submission

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  // --- FORM HOOK ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<StaffFormInputs>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      dateOfBirth: ''
    }
  });

  // --- FETCH DATA ---
  const fetchData = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(
        `/users?organizationId=${user?._id}`,
        {
          params: {
            role: 'student',
            page,
            limit,
            ...(search ? { searchTerm: search } : {})
          }
        }
      );
      setStudents(response.data.data.result);
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

  // --- HANDLERS ---

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/users/${id}`, { status: updatedStatus }); // Fixed: was user?._id, changed to id (the student's id)

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === id ? { ...student, status: updatedStatus } : student
        )
      );

      toast({ title: 'Student status updated successfully' });
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

  // Open Dialog for Adding
  const handleAdd = () => {
    setEditingStudent(null);
    reset({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setDialogOpen(true);
  };

  // Open Dialog for Editing
  const handleEdit = (student: any) => {
    setEditingStudent(student);
    reset({
      name: student.name,
      email: student.email.toLowerCase(),
      phone: student.phone,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      password: '' 
    });
    setDialogOpen(true);
  };

  // Submit Form (Create or Update)
  const onSubmit = async (data: StaffFormInputs) => {
    setSubmitLoading(true);
    try {
      if (editingStudent) {
        // UPDATE Logic
        const payload: any = {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          dateOfBirth: data.dateOfBirth
        };
        if (data.password) {
          payload.password = data.password;
        }
        
        await axiosInstance.patch(`/users/${editingStudent._id}`, payload);
        setStudents((prev) =>
           prev.map((st) =>
             st._id === editingStudent._id ? { ...st, ...payload } : st
           )
         );
        toast({
          title: 'Staff updated successfully',
        });
      } else {
        // CREATE Logic
        const payload = {
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          password: data.password!,
          dateOfBirth: data.dateOfBirth,
          role: 'student',
          organizationId: user?._id
        };

      const res = await axiosInstance.post(`/auth/signup`, payload);
              setStudents((prev) => [res.data.data, ...prev]);

        toast({
          title: 'Staff created successfully',
        });
      }

 
      setDialogOpen(false);
      setEditingStudent(null);
      reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Operation failed. Try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Search Logic
  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold">All Staff</h1>

          {/* Search Bar */}
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by Name, Email"
              className="h-9 min-w-[200px] lg:min-w-[300px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="bg-supperagent text-white hover:bg-supperagent/90"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ADD BUTTON */}

          <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-supperagent text-white hover:bg-supperagent/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Staff
          </Button>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card>
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
                        size="icon"
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

          {students.length > 0 && (
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

      {/* DIALOG FOR ADD/EDIT */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? 'Edit Staff Member' : 'Add New Staff'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                disabled={!!editingStudent}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone', { required: 'Phone is required' })}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
            </div>

           

            <div>
              <Label htmlFor="password">
                {editingStudent
                  ? 'New Password (leave empty to keep current)'
                  : 'Password *'}
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: !editingStudent ? 'Password is required' : false,
                  minLength: { value: 6, message: 'Min 6 characters' }
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitLoading}
                className="bg-supperagent text-white hover:bg-supperagent/90"
              >
                {submitLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    {editingStudent ? 'Updating...' : 'Creating...'}
                  </>
                ) : editingStudent ? (
                  'Update Staff'
                ) : (
                  'Create Staff'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
