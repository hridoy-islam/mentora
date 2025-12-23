import { useEffect, useState } from 'react';
import { MoveLeft, Eye } from 'lucide-react';
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
import { useSelector } from 'react-redux';

// Define the shape of your Member data
interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function MyOrganizationPage() {
  const [company, setCompany] = useState<Member[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10); // Defaulted to 10 for better UI, change to 100 if needed
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  // Assuming your auth slice has the user object with organizationId
  const { user } = useSelector((state: any) => state.auth);

  // --- FETCH DATA ---
  const fetchData = async (
    page: number,
    limit: number,
    search: string = ''
  ) => {
    try {
      setInitialLoading(true);
      // Ensure we have an organization ID before fetching
      if (!user?.organizationId) return;

      const response = await axiosInstance.get(
        `/users?_id=${user.organizationId}`,
        {
          params: {
            page,
            limit,
            searchTerm: search || undefined // Only send if not empty
          }
        }
      );

      // Adjust these paths based on your actual API response structure
      setCompany(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error: any) {
      console.error('Error fetching organization members:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message ||
          'Failed to fetch organization members.',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, entriesPerPage, searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewCourses = (id: string) => {
    // Navigate to a details page for this specific user
    navigate(`${id}/available-course`);
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, entriesPerPage, user?.organizationId]);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 container mx-auto py-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold">My Organization</h1>

          {/* Search Bar */}
          {/* <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search Name or Email..."
              className="h-9 min-w-[200px] lg:min-w-[300px]"
            />
            <Button
              onClick={handleSearch}
              size="sm"
              className="bg-supperagent text-white hover:bg-supperagent/90"
            >
              Search
            </Button>
          </div> */}
        </div>

        <div className="flex items-center gap-2">
          <Button size="default" onClick={() => navigate(-1)} variant="outline">
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* TABLE CARD */}
      <Card>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {company.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-gray-500"
                  >
                    No members found in this organization.
                  </TableCell>
                </TableRow>
              ) : (
                company.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c?.phone || '-'}</TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => handleViewCourses(c._id)}
                        title="View Courses"
                      >
                        <Eye className="h-4 w-4 mr-2" /> View Courses
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {company.length > 6 && (
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
