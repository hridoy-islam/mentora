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
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificatePDF } from './components/CertificatePDF';
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
  
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Certificates List</CardTitle>
          <Button size="default" onClick={() => navigate(-1)} variant="outline">
          <MoveLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
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
              {courses.map((item) => {
                const isReady = item.progress === 100;

                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="font-medium">{item.courseId?.title}</div>
                      <div className="text-xs text-gray-400">
                        {isReady ? `Completed: ${moment(item.updatedAt).format('LL')}` : 'In Progress'}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant={isReady ? 'default' : 'secondary'}>
                        {isReady ? 'Completed' : 'Active'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <span className="text-sm font-medium">{item.progress}%</span>
                    </TableCell>

                    <TableCell className="text-right">
                      {isReady ? (
                        <PDFDownloadLink
                          document={
                            <CertificatePDF
                              studentName={user.name}
                              courseTitle={item.courseId.title}
                              date={moment(item.updatedAt).format('LL')}
                            />
                          }
                          fileName={`${item.courseId.title}-Certificate.pdf`}
                        >
                          {({ loading }) => (
                            <Button 
                              size="sm" 
                              className="bg-supperagent text-white"
                              disabled={loading}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {loading ? 'Preparing...' : 'Download Certificate'}
                            </Button>
                          )}
                        </PDFDownloadLink>
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="text-gray-400">
                          <Award className="mr-2 h-4 w-4" />
                          Complete Course to Unlock
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}