import { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Pen,
  MoveLeft,
  Video,
  FileText,
  HelpCircle,
  Search,
  GripVertical,
  Trash,
  CheckCircle,
  File
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

import { useToast } from '@/components/ui/use-toast'; // 🔥 Toast import

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleName, setModuleName] = useState('');
  const navigate = useNavigate();
  const { cid, mid } = useParams();
  const [moduleId, setModuleId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast(); // 🔥 Toast hook

  useEffect(() => {
    if (mid) {
      setModuleId(mid);
      setCourseId(cid || '');
      fetchLessons(currentPage, entriesPerPage, searchTerm);
      fetchModule();
    }
  }, [currentPage, entriesPerPage, mid]);

  // Fetch Module
  const fetchModule = async () => {
    try {
      const response = await axiosInstance.get(`/course-modules/${mid}`);
      if (response.data?.success && response.data.data) {
        setModuleName(response.data.data.title);
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    }
  };

  // Fetch Lessons
  const fetchLessons = async (
    page: number,
    entriesPerPage: number,
    searchTerm = ''
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/course-lesson?moduleId=${mid}&fields=title,type,index`,
        {
          params: {
            page,
            limit: entriesPerPage,
            ...(searchTerm ? { searchTerm } : {})
          }
        }
      );

      if (response.data?.success) {
        const sorted = response.data.data.result.sort(
          (a: any, b: any) => a.index - b.index
        );
        setLessons(sorted);
        setTotalPages(response.data.data.meta.totalPage);
      } else {
        setLessons([]);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () =>
    fetchLessons(currentPage, entriesPerPage, searchTerm);

  // Delete Lesson
  const handleDeleteLesson = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/course-lesson/${id}`);
      if (res.data?.success) {
        setLessons((prev) => prev.filter((l) => l._id !== id));
        toast({
          title: 'Lesson deleted',
          description: 'The lesson has been successfully removed.'
        });
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to delete',
        description: 'Something went wrong. Try again later.'
      });
    }
  };

  // Drag and Drop
  const moveRow = (fromIndex: number, toIndex: number) => {
    const updated = [...lessons];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    const reIndexed = updated.map((lesson, i) => ({
      ...lesson,
      index: i + 1
    }));

    setLessons(reIndexed);
    saveNewOrder(reIndexed);
  };

  const saveNewOrder = async (updatedLessons: any[]) => {
    try {
      await axiosInstance.patch(`/course-lesson/reorder/${mid}`, {
        lessons: updatedLessons.map((l) => ({
          id: l._id,
          index: l.index
        }))
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const DraggableRow = ({ lesson, index }: any) => {
    const ref = useRef<any>(null);
    const ITEM_TYPE = 'lesson';

    const [, drop] = useDrop({
      accept: ITEM_TYPE,
      hover: (item: any) => {
        if (item.index !== index) {
          moveRow(item.index, index);
          item.index = index;
        }
      }
    });

    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: { id: lesson._id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    });

    drag(drop(ref));

    // Function to get icon based on type
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'video':
          return <Video className="h-4 w-4 text-blue-500" />;
        case 'doc':
          return <File className="h-4 w-4 text-green-500" />;
        case 'quiz':
          return <FileText className="h-4 w-4 text-yellow-500" />;
        default:
          return null;
      }
    };

    return (
      <TableRow
        ref={ref}
        style={{ opacity: isDragging ? 0.4 : 1, cursor: 'grab' }}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            {getTypeIcon(lesson.type)}
            {lesson.title}
          </div>
        </TableCell>

        <TableCell>
          <Badge>
            {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
          </Badge>
        </TableCell>

        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate(`edit/${lesson._id}`)}
            >
              <Pen className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Lesson "<b>{lesson.title}</b>"
                    will be deleted permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteLesson(lesson._id)}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex flex-row items-center gap-4">
                <CardTitle>Lessons</CardTitle>
                <div className="flex items-center space-x-4 ">
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search lesson..."
                    className="h-8 w-[200px]"
                  />
                  <Button
                    onClick={handleSearch}
                    className="h-8 bg-supperagent hover:bg-supperagent/90"
                  >
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>
              </div>
              <div>
                {moduleName && (
                  <p className="mt-2 text-sm text-gray-600">
                    Module: <b>{moduleName}</b>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <MoveLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                className="bg-supperagent hover:bg-supperagent/90"
                onClick={() => navigate(`create`)}
                disabled={!mid}
              >
                <Plus className="mr-2 h-4 w-4" /> New Lesson
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="flex justify-center py-6">
                <BlinkingDots size="large" color="bg-supperagent" />
              </div>
            ) : lessons.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <FileText className="mb-4 h-12 w-12 text-gray-400" />
                <p>No lessons found.</p>
                <Button
                  className="mt-4 bg-supperagent hover:bg-supperagent/90"
                  onClick={() =>
                    navigate(`create?module=${moduleId}&course=${courseId}`)
                  }
                >
                  Create your first lesson
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lessons.map((lesson, index) => (
                    <DraggableRow
                      key={lesson._id}
                      lesson={lesson}
                      index={index}
                    />
                  ))}
                </TableBody>
              </Table>
            )}

            {lessons.length > 40 && (
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  );
}
