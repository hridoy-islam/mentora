import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Eye, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { countries } from '@/types';

// --- Zod Schema Definition ---
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().optional(),
  // Address Fields
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(), // Full Address Textarea
});

type StaffFormInputs = z.infer<typeof formSchema>;



export default function MyStaffPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  
  // Loading States
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false); // Added to match your snippet

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  // --- FORM HOOK (Initialized with Zod) ---
  const form = useForm<StaffFormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      address: '',
    }
  });

  // --- FETCH DATA ---
  const fetchData = async (page: number, limit: number, search: string = '') => {
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
        description: error?.response?.data?.message || 'Failed to fetch students.',
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

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student._id === id ? { ...student, status: updatedStatus } : student
        )
      );
      toast({ title: 'Student status updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update status.',
        variant: 'destructive'
      });
    }
  };

  // --- DIALOG HANDLERS ---
  const handleAdd = () => {
    setEditingStudent(null);
    form.reset({
      name: '',
      email: '',
      phone: '',
      password: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      address: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = async (student: any) => {
    setEditingStudent(student);
    setDialogOpen(true);
    setDetailsLoading(true); // Simulate fetching details if needed

    // If your backend returns address fields in the user object, populate them here
    // Assuming structure: student.address might be a string or object. 
    // Adjust based on your actual API response.
    
    setTimeout(() => {
        form.reset({
          name: student.name,
          email: student.email.toLowerCase(),
          phone: student.phone,
          password: '', // Always reset password on edit
          country: student.country || '',
          state: student.state || '',
          city: student.city || '',
          zipCode: student.zipCode || '',
          address: student.address || '', 
        });
        setDetailsLoading(false);
    }, 100); 
  };

  // --- SUBMIT ---
  const onSubmit = async (data: StaffFormInputs) => {
    setSubmitLoading(true);
    try {
      // Base Payload
      const payload: any = {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        // Add new fields to payload
        country: data.country,
        state: data.state,
        city: data.city,
        zipCode: data.zipCode,
        address: data.address, 
      };

      if (editingStudent) {
        // --- UPDATE ---
        if (data.password && data.password.length > 0) {
          payload.password = data.password;
        }

        await axiosInstance.patch(`/users/${editingStudent._id}`, payload);
        
        setStudents((prev) =>
          prev.map((st) =>
            st._id === editingStudent._id ? { ...st, ...payload } : st
          )
        );
        toast({ title: 'Staff updated successfully' });

      } else {
        // --- CREATE ---
        payload.password = data.password; // Required for creation
        payload.role = 'student';
        payload.organizationId = user?._id;

        const res = await axiosInstance.post(`/auth/signup`, payload);
        setStudents((prev) => [res.data.data, ...prev]);
        toast({ title: 'Staff created successfully' });
      }

      setDialogOpen(false);
      setEditingStudent(null);
      form.reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Operation failed. Try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

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
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                <TableHead>Enroll Courses</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-supperagent text-white hover:bg-supperagent/90"
                        onClick={() => navigate(`/dashboard/enroll-courses/${student._id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-row items-center justify-center gap-2">
                        <Switch
                          checked={student.status === 'active'}
                          onCheckedChange={(checked) => handleStatusChange(student._id, checked)}
                        />
                        <span className={`text-sm font-medium ${student.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {student.status === 'active' ? 'Active' : 'Disable'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button size="icon" onClick={() => handleEdit(student)}>
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

      {/* --- NEW DIALOG IMPLEMENTATION --- */}
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Name & Email */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
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
                        <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="john@example.com" 
                            type="email" 
                            disabled={!!editingStudent} 
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
                            <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
                          ) : (
                            <span className="text-red-500">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="******" type="password" {...field} />
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
                        <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Fields - Row 1 (Country, State) */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a Country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[9999] max-h-[250px]">
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
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

                {/* Address Fields - Row 2 (City, Zip) */}
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

                {/* Full Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full Address" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dialog Footer */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
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