import { useEffect, useState } from 'react';
import Select from 'react-select'; // Import React Select
import {
  MoveLeft,
  Search,
  FileText,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

// Interface for User Options in Select
interface UserOption {
  value: string;
  label: string;
}

export default function ReportPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);

  // Search/Filter State
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<UserOption | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // 1. Fetch Users for the Dropdown on Mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        // Adjust response path based on your actual API structure (e.g. data.data.result)
        const users = response.data?.data?.result || response.data?.data || [];

        const options = users.map((user: any) => ({
          value: user._id, // This will be sent as buyerId
          label: user.name // Display name
        }));
        setUserOptions(options);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // 2. Fetch Reports when Page, Limit, or Selected Buyer changes
  useEffect(() => {
    fetchReports(currentPage, entriesPerPage, selectedBuyer?.value);
  }, [currentPage, entriesPerPage]); // Note: We trigger search manually via button, or you can add selectedBuyer here to auto-fetch

  const fetchReports = async (
    page: number,
    limit: number,
    buyerId: string | undefined = undefined
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/order', {
        params: {
          page,
          limit,
          // Send buyerId if it exists
          ...(buyerId ? { buyerId: buyerId } : {})
        }
      });

      if (response.data?.success || response.data?.data) {
        const resultData = response.data.data.result || [];
        setReports(resultData);
        setTotalPages(response.data.data.meta.totalPage || 1);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch reports.'
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReports(1, entriesPerPage, selectedBuyer?.value);
  };

  const handleClear = () => {
    setSelectedBuyer(null);
    setCurrentPage(1);
    fetchReports(1, entriesPerPage, undefined);
  };

  // Helper for Status Color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Helper for Role Color
  const getRoleBadge = (role: string) => {
    return role === 'company'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex flex-row items-center gap-4">
            <h1 className="text-2xl font-semibold">Reports</h1>

            {/* React Select Integration */}
            <div className="flex items-center space-x-2 ">
              <div className="w-[250px]">
                <Select
                  options={userOptions}
                  value={selectedBuyer}
                  onChange={(option) => setSelectedBuyer(option)}
                  placeholder="Select user..."
                  isClearable
                  className="text-sm"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: '32px',
                      height: '32px',
                      borderRadius: '8px', // fully rounded
                      padding: '0 6px',
                      boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : 'none'
                    }),

                    valueContainer: (base) => ({
                      ...base,
                      padding: '0 6px',
                      height: '32px'
                    }),

                    input: (base) => ({
                      ...base,
                      margin: 0,
                      padding: 0
                    }),

                    indicatorsContainer: (base) => ({
                      ...base,
                      height: '32px'
                    }),

                    dropdownIndicator: (base) => ({
                      ...base,
                      padding: '4px'
                    }),

                    clearIndicator: (base) => ({
                      ...base,
                      padding: '4px'
                    })
                  }}
                />
              </div>

              <Button
                onClick={handleSearch}
                size="sm"
                className="h-8 bg-supperagent hover:bg-supperagent/90"
              >
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <MoveLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <BlinkingDots size="large" color="bg-supperagent" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-500">
              <FileText className="mb-4 h-12 w-12 text-gray-400" />
              <p>No reports found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Buyer Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead >Course</TableHead>
                  <TableHead >Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Purchase Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    {/* Buyer Name */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {report.buyerId?.name || 'Unknown User'}
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getRoleBadge(report.role)}
                      >
                        {report.role
                          ? report.role.charAt(0).toUpperCase() +
                            report.role.slice(1)
                          : 'N/A'}
                      </Badge>
                    </TableCell>

                    {/* Items Details (Course Name & Quantity) */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {report.items && report.items.length > 0 ? (
                          report.items.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center  border-b border-gray-100 pb-1 text-sm last:border-0 last:pb-0"
                            >
                              <span
                                className="max-w-[200px] truncate text-gray-700"
                                title={item.courseId?.title}
                              >
                                {item.courseId?.title || 'Unknown Course'}
                              </span>
                              <Badge
                                variant="secondary"
                                className="ml-2 h-5 text-xs"
                              >
                                Qty: {item.quantity || 1}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">
                            No items
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell className="font-semibold text-gray-700">
                      <div className="flex items-center">
                        {report.totalAmount?.toLocaleString()}
                      </div>
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <Badge
                        className={`border-0 ${getStatusColor(report.paymentStatus)}`}
                      >
                        {report.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="mr-2 h-3 w-3" />
                       
{report.createdAt
  ? moment(report.createdAt).format("DD MMM YYYY")
  : "N/A"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {reports.length > 0 && (
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
