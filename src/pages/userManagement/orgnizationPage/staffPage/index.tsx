import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Loader2, Eye } from 'lucide-react';
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
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux'; // Assuming Redux is used for auth state
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { countries } from '@/types';

// --- Zod Schema ---
const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional()
});

type StaffFormInputs = z.infer<typeof staffSchema>;

export default function OrganizationStaffPage() {
  // --- State ---
  const [students, setStudents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false); // Loading for fetching specific user details
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- Pagination & Search ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Hooks ---
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  // Assuming auth state shape, adjust selector as needed
  const { user } = useSelector((state: any) => state.auth);

  // --- Form Definition ---
  const form = useForm<StaffFormInputs>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      country: '',
      city: '',
      state: '',
      zipCode: '',
      address: ''
    }
  });

  // --- Fetch List Data ---
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
          ...(search ? { searchTerm: search } : {})
        }
      });
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

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  // --- Handlers ---

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/users/${id}`, { status: updatedStatus });
      setStudents((prev) =>
        prev.map((student) =>
          student._id === id ? { ...student, status: updatedStatus } : student
        )
      );
      toast({ title: 'Status updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to update status.',
        variant: 'destructive'
      });
    }
  };

  // --- Add / Edit Logic ---

  const handleAddNew = () => {
    setEditingStudent(null);
    form.reset({
      name: '',
      email: '',
      password: '',
      phone: '',
      
      country: '',
      city: '',
      state: '',
      zipCode: '',
      address: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = async (student: any) => {
    setEditingStudent(student);
    setDialogOpen(true);
    setDetailsLoading(true);

    try {
      // Fetch specific user details
      const res = await axiosInstance.get(`/users/${student._id}`);
      const userData = res.data.data;

      // Reset form with fetched data
      form.reset({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
       
        country: userData.country || '',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zipCode || '',
        address: userData.address || '',
        password: '' // Don't fill password on edit
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user details.',
        variant: 'destructive'
      });
      setDialogOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const onSubmit = async (data: StaffFormInputs) => {
    setSubmitLoading(true);
    try {
      const basePayload = {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        country: data.country,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        address: data.address,
        organizationId: id
      };

      if (editingStudent) {
        const updatePayload: any = { ...basePayload };
        if (data.password && data.password.trim() !== '') {
          updatePayload.password = data.password;
        }

        const res = await axiosInstance.patch(
          `/users/${editingStudent._id}`,
          updatePayload
        );
        const updatedUser = res.data.data;

        // Update local state
        setStudents((prev) =>
          prev.map((st) =>
            st._id === editingStudent._id ? { ...st, ...updatedUser } : st
          )
        );

        toast({ title: 'Staff updated successfully' });
      } else {
        // --- CREATE Logic ---
        if (!data.password) {
          toast({
            title: 'Password is required for new users',
            variant: 'destructive'
          });
          setSubmitLoading(false);
          return;
        }

        const createPayload = {
          ...basePayload,
          password: data.password,
          role: 'student',
          organizationId: id,

        };

        const res = await axiosInstance.post(`/auth/signup`, createPayload);

        // Add new user to top of list
        setStudents((prev) => [res.data.data, ...prev]);

        toast({ title: 'Staff created successfully' });
      }

      setDialogOpen(false);
      setEditingStudent(null);
      form.reset();
    } catch (error: any) {
      console.error(error);
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

  // --- Render ---

  if (initialLoading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">All Staff</h1>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
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

        <div className="flex gap-2">
          <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            size="default"
            onClick={handleAddNew} // Opens Dialog for Create
            className="bg-supperagent text-white hover:bg-supperagent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
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
                <TableHead>Enroll Course</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-right">Actions</TableHead>
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
                    <TableCell> <div className="flex flex-row items-center ">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="bg-supperagent text-white hover:bg-supperagent/90"
                          onClick={() => navigate(`${student._id}/enroll-courses`)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View
                        </Button>
                      </div></TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-row items-center">
                        <Switch
                          checked={student.status === 'active'}
                          onCheckedChange={(checked) =>
                            handleStatusChange(student._id, checked)
                          }
                          className="mx-auto"
                        />
                        <span
                          className={`text-sm font-medium ${
                            student.status === 'active'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {student.status === 'active' ? 'Active' : 'Disable'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="space-x-1 text-center">
                      <div className="flex flex-row items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-supperagent text-white hover:bg-supperagent/90"
                          onClick={() => handleEdit(student)}
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* --- ADD / EDIT DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editingStudent ? 'Edit Staff' : 'Add New Staff'}
      </DialogTitle>
    </DialogHeader>

    {detailsLoading ? (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    ) : (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Name & Email */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Password & Phone */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password
                    {editingStudent ? (
                      <span className="ml-1 text-xs font-normal text-gray-500">
                        (Optional)
                      </span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="******"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
         

          {/* Address Fields - Row 1 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[9999] max-h-[250px]">
                      {countries.map((country) => (
                        <SelectItem
                          key={country}
                          value={country}
                        >
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address Fields - Row 2 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Zip Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Full Address (Updated to Textarea) */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  {/* Using Textarea component */}
                  <Textarea placeholder="Full Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dialog Footer with CANCEL Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)} // Close the dialog
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-supperagent hover:bg-supperagent/90"
              disabled={submitLoading}
            >
              {submitLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingStudent ? 'Update Staff' : 'Create Staff'}
            </Button>
          </div>
        </form>
      </Form>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}
