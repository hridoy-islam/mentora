import { useEffect, useState } from 'react';
import { 
  MoveLeft, 
  Eye, 
  User, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils'; // Ensure you have this utility for the pagination classes

// --- TYPES ---
interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImg?: string;
}

export default function MyOrganizationPage() {
  const [company, setCompany] = useState<Member[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage] = useState(12); 
  const [searchTerm] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  // --- HELPER: Pagination Logic ---
  const getPageNumbers = (total: number, current: number) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  // --- HELPER: Get Initials for Avatar ---
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // --- FETCH DATA ---
  const fetchData = async (page: number, limit: number, search: string = '') => {
    try {
      setInitialLoading(true);
      if (!user?.organizationId) return;

      const response = await axiosInstance.get(
        `/users?_id=${user.organizationId}`,
        {
          params: {
            page,
            limit,
            searchTerm: search || undefined
          }
        }
      );

      setCompany(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error: any) {
      console.error('Error fetching organization members:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to fetch members.',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, entriesPerPage, user?.organizationId]);

  const handleViewCourses = (id: string) => {
    navigate(`${id}/available-course`);
  };

  if (initialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 container mx-auto py-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Organization</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view members within your organization.
          </p>
        </div>

        <Button size="default" onClick={() => navigate(-1)} variant="outline" className="self-start sm:self-center">
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* CONTENT: EMPTY STATE or GRID */}
      {company.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold">No members found</h3>
          <p className="text-muted-foreground max-w-sm mt-2">
            It looks like there are no members associated with this organization yet.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {company.map((member) => (
            <Card 
              key={member._id} 
              className="group relative flex flex-col overflow-hidden border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl"
            >
              {/* Decorative Header Background */}
              <div className="h-24 bg-gradient-to-r from-supperagent to-mentora group-hover:from-supperagent/90 group-hover:to-mentora transition-colors duration-300 relative">
                 {/* Optional: Add a subtle pattern overlay here if desired */}
              </div>

              {/* Avatar Section */}
              <div className="absolute top-12 left-0 right-0 flex justify-center">
                <div className="relative h-24 w-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                  {member.profileImg ? (
                    <img 
                      src={member?.image} 
                      alt={member.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xl font-bold text-gray-500">
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <CardContent className="mt-14 pt-0 text-center flex-grow px-6">
                <h3 className="font-bold text-lg text-gray-900 truncate" title={member.name}>
                  {member.name}
                </h3>
                
                <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2 w-full justify-center px-2 py-1 rounded-md bg-gray-50/50">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate max-w-full" title={member.email}>{member.email}</span>
                  </div>
                  
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              {/* Footer Actions */}
              <CardFooter className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                <Button 
                  className="w-full bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-100 hover:text-gray-900 group-hover:border-gray-300" 
                  variant="ghost"
                  onClick={() => handleViewCourses(member._id)}
                >
                  <Eye className="h-4 w-4 mr-2 text-supperagent" /> 
                  View Courses
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {company.length > 5 && (
        <div className="mt-12 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Mobile: Simple Text Info */}
          <p className="text-sm text-muted-foreground sm:hidden">
            Page{' '}
            <span className="font-medium text-foreground">{currentPage}</span>{' '}
            of{' '}
            <span className="font-medium text-foreground">{totalPages}</span>
          </p>

          {/* The Navigation Pill */}
          <div className="mx-auto flex items-center gap-1 rounded-full border bg-background/95 p-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Previous Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous</span>
            </Button>

            {/* Page Numbers (Desktop + Tablet) */}
            <div className="hidden items-center gap-1 sm:flex">
              {getPageNumbers(totalPages, currentPage).map((page, i) =>
                page === '...' ? (
                  <div
                    key={i}
                    className="flex h-9 w-9 items-center justify-center"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <Button
                    key={i}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-9 w-9 rounded-full transition-all',
                      currentPage === page
                        ? 'shadow-md bg-supperagent hover:bg-supperagent/90 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            {/* Mobile: Current Page Indicator */}
            <div className="flex h-9 min-w-[3rem] items-center justify-center rounded-full bg-secondary px-3 text-sm font-medium sm:hidden">
              {currentPage} / {totalPages}
            </div>

            {/* Next Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}