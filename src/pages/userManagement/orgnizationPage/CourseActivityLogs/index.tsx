import { useEffect, useState, useMemo } from 'react';
import { MoveLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import axiosInstance from '@/lib/axios';
import moment from 'moment';

interface LogEntry {
  _id?: string;
  message?: string;
  createdAt: string;
}

interface LicenseData {
  logs: Array<{
    _id?: string;
    message?: string;
    createdAt: string;
  }>;
  staffEnrollmentLogs: Array<{
    _id?: string;
    message?: string;
    createdAt: string;
  }>;
}

export default function OrganizationActivityLogs() {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { lid } = useParams();

  const fetchData = async () => {
    try {
      setInitialLoading(true);
      const response = await axiosInstance.get(`/course-license/${lid}`);
      setLicenseData(response.data.data);
    } catch (error: any) {
      console.error('Error fetching license:', error);
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to fetch activity logs.',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sortedLogs = useMemo((): LogEntry[] => {
    if (!licenseData) return [];

    const licenseLogs: LogEntry[] = (licenseData.logs || []).map((log) => ({
      message: log.message || 'No message',
      createdAt: log.createdAt
    }));

    const enrollmentLogs: LogEntry[] = (
      licenseData.staffEnrollmentLogs || []
    ).map((log) => ({
      message: log.message || 'No message',
      createdAt: log.createdAt
    }));

    return [...licenseLogs, ...enrollmentLogs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [licenseData]);

  if (initialLoading) {
    return (
      <div className="flex justify-center py-6">
        <BlinkingDots size="large" color="bg-supperagent" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Activity Logs
          </CardTitle>
          <Button
            size="default"
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent>
          {sortedLogs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No activity logs found.
            </p>
          ) : (
            <div className="space-y-1">
              {sortedLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted/50"
                >
                  <span className="flex-1">{log.message}</span>
                  <span className="ml-4 shrink-0 text-muted-foreground">
                    {moment(log.createdAt).format('DD MMM, YYYY')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}