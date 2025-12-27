import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoveLeft, Loader2, Award, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import moment from 'moment';
import { useSelector } from 'react-redux';

// Interface matching the provided Mongoose model structure (frontend view)
interface EnrolledCourse {
  _id: string;
  courseId: {
    _id: string;
    title: string; // Assuming the populated course has a title
    thumbnail?: string;
  };
  studentId: string;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  completedDate?: string;
  createdAt: string;
}

export default function StudentCertificatePage() {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Enrolled Courses for the specific student
  useEffect(() => {
    const fetchStudentCourses = async () => {
      if (!user._id) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get('/enrolled-courses', {
          params: {
            studentId: user._id,
            limit: 100, 
          }
        });

        setCourses(response.data.data.result);
      } catch (error: any) {
        console.error('Error fetching certificates:', error);
        toast({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to fetch courses.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentCourses();
  }, [user, toast]);

  const handleViewCertificate = (course: EnrolledCourse) => {
    if (course.status !== 'completed') {
      toast({
        title: 'Not Available',
        description: 'Certificate is only available for completed courses.',
      
      });
      return;
    }
    
    // Example: Navigate to a certificate generation route or open a PDF
    console.log("Viewing certificate for:", course.courseId.title);
    toast({
        title: "Opening Certificate",
        description: `Loading certificate for ${course.courseId.title}...`
    })
    // navigate(`/certificates/${course._id}`); 
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto  py-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Student Certificates
          </h1>
        
        </div>

        <Button size="default" onClick={() => navigate(-1)} variant="outline">
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Course Name</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-right">Certificate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                    No enrolled courses found for this student.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((item) => (
                  <TableRow key={item._id}>
                    {/* Course Name & Issue Date */}
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium text-base">
                          {item.courseId?.title || 'Unknown Course'}
                        </span>
                        
                        {item.completedDate ? (
                          <div className="flex items-center text-xs text-green-600">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>
                              Issued: {moment(item.completedDate).format('LL')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-gray-400">
                            <Calendar className="mr-1 h-3 w-3" />
                            <span>Not yet issued</span>
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge 
                        variant={item.status === 'completed' ? 'default' : 'secondary'}
                        className={
                            item.status === 'completed' 
                            ? "bg-green-100 text-green-700 hover:bg-green-100" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                        }
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>

                    {/* Progress Bar/Text */}
                    <TableCell className="text-center">
                        <span className="text-sm font-medium">{item.progress}%</span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant={item.status === 'completed' ? 'default' : 'ghost'}
                        size="sm"
                        disabled={item.status !== 'completed'}
                        onClick={() => handleViewCertificate(item)}
                        className={`
                            ${item.status === 'completed' 
                                ? 'bg-supperagent text-white hover:bg-supperagent/90' 
                                : 'text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Certificate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}