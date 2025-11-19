import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, Video, FileText, HelpCircle } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [moduleName, setModuleName] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    if (moduleId) {
      fetchLessons();
    }
  }, [moduleId]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setModuleName('Sample Module');
      setLessons([]);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'doc':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getLessonTypeBadge = (type: string) => {
    const variants: any = {
      video: 'default',
      doc: 'secondary',
      quiz: 'outline'
    };
    return (
      <Badge variant={variants[type] || 'default'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          {moduleName && (
            <p className="mt-2 text-sm text-gray-600">
              Module: <span className="font-semibold">{moduleName}</span>
            </p>
          )}
        </div>
        <div className="flex flex-row items-center gap-4">
          <Button
            size="default"
            onClick={() => navigate(-1)}
            variant="outline"
          >
            <MoveLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            size="default"
            onClick={() =>
              navigate(
                `/dashboard/lessons/create?moduleId=${moduleId}&courseId=${courseId}`
              )
            }
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!moduleId}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Lesson
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="mb-4 h-12 w-12 text-gray-400" />
              <p className="text-lg">No lessons found.</p>
              <Button
                onClick={() =>
                  navigate(
                    `/course-lesson/new?moduleId=${moduleId}&courseId=${courseId}`
                  )
                }
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                disabled={!moduleId}
              >
                Create your first lesson
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Lesson Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson: any, index: number) => (
                  <TableRow key={lesson._id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getLessonIcon(lesson.type)}
                        {lesson.title}
                      </div>
                    </TableCell>
                    <TableCell>{getLessonTypeBadge(lesson.type)}</TableCell>
                    <TableCell>{lesson.duration || '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-green-100 text-green-600 hover:bg-green-200"
                                onClick={() =>
                                  navigate(
                                    `/course-lesson/edit/${lesson._id}?moduleId=${moduleId}&courseId=${courseId}`
                                  )
                                }
                              >
                                <Pen className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Lesson</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
