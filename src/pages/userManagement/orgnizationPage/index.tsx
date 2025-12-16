import { useEffect, useState } from 'react';
import { Plus, Pen, Settings, MoveLeft, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Form Validation Imports
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- 1. Updated Zod Schema (Added Password) ---
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional(), // Optional password
  phone: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  address: z.string().optional(),
});

// Mock countries list
const countries = ["USA", "UK", "Canada", "Australia", "India", "Bangladesh"];

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  
  // Dialog & Form States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<any>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Pagination & Data States
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- 2. Initialize Form (Added password default) ---
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '', // Default empty
      phone: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
      address: '',
    },
  });

  const fetchData = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get('/users', {
        params: {
          role: 'company',
          page,
          limit,
          ...(search ? { searchTerm: search } : {}),
        },
      });
      setOrganizations(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch organizations.',
        variant: 'destructive',
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // --- 3. Handle Edit Click (Reset Password to empty) ---
  const handleEditClick = (org: any) => {
    setEditingOrganization(org);
    // Reset form with organization details
    form.reset({
      name: org.name || '',
      email: org.email || '',
      password: '', // Always reset password to empty on edit
      phone: org.phone || '',
      country: org.country || '',
      state: org.state || '',
      city: org.city || '',
      zipCode: org.zipCode || '', 
      address: org.address || '',
    });
    setDialogOpen(true);
  };

  // --- 4. Handle Form Submission (Filter empty password) ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!editingOrganization) return;

    try {
      setSubmitLoading(true);

      // Create a payload copy
      const payload = { ...values };

      // Remove password from payload if it's empty (so we don't overwrite with "")
      if (!payload.password || payload.password.trim() === '') {
        delete payload.password;
      }
      
      const response = await axiosInstance.patch(`/users/${editingOrganization._id}`, payload);

      // Update local state
      setOrganizations((prev) =>
        prev.map((item) =>
          item._id === editingOrganization._id ? { ...item, ...payload } : item
        )
      );

      toast({
        title: 'Success',
        description: 'Organization details updated successfully.',
      });

      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update organization.',
        variant: 'destructive',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const updatedStatus = status ? 'active' : 'block';
      await axiosInstance.patch(`/users/${id}`, { status: updatedStatus });

      setOrganizations((prev) =>
        prev.map((org) =>
          org._id === id ? { ...org, status: updatedStatus } : org
        )
      );

      toast({ title: 'Organization status updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header and Search Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <h1 className="text-2xl font-semibold">All Organizations</h1>
          <div className="flex items-center space-x-4">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

      <Card>
        <CardHeader>
          <CardTitle>Organizations List</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead className="w-32 text-center">Status</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-gray-500"
                  >
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org._id}>
                    <TableCell>{org.name}</TableCell>
                    <TableCell>{org.email}</TableCell>
                    <TableCell>{org.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-supperagent text-white hover:bg-supperagent/90"
                        onClick={() => navigate(`${org._id}/staffs`)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className='flex flex-row items-center justify-center gap-2'>
                        <Switch
                          checked={org.status === 'active'}
                          onCheckedChange={(checked) =>
                            handleStatusChange(org._id, checked)
                          }
                        />
                        <span
                          className={`text-sm font-medium ${
                            org.status === 'active'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {org.status === 'active' ? 'Active' : 'Disable'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="space-x-1 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-supperagent text-white hover:bg-supperagent/90"
                        onClick={() => handleEditClick(org)}
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {organizations.length > 40 && (
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

      {/* --- EDIT ORGANIZATION DIALOG --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Organization Details</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <Input placeholder="Company Name" {...field} />
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
                        <Input placeholder="company@example.com" type="email" disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password & Phone */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                
                {/* --- Password Field (Added) --- */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Password
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          (Optional)
                        </span>
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

              {/* Full Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Full Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Footer */}
              <DialogFooter className="gap-2 pt-4">
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
                  Update Organization
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}