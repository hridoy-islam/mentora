import { useEffect, useState } from 'react';
import { Plus, Pen, MoveLeft, BookOpen, X, Save, Trash2, Search } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios';
import { BlinkingDots } from '@/components/shared/blinking-dots';

export default function CourseModulesPage() {
  const [modules, setModules] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '' });
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (courseId) {
      fetchData(currentPage, entriesPerPage, searchTerm);
    }
  }, [currentPage, entriesPerPage, courseId]);

  const fetchData = async (page: number, entriesPerPage: number, searchTerm = "") => {
    setLoading(true);
    try {
      // Fetch course name
      const courseResponse = await axiosInstance.get(`/courses/${courseId}`);
      setCourseName(courseResponse.data.data?.title || 'Course');

      const modulesResponse = await axiosInstance.get(`/course-modules?courseId=${courseId}`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {}),
        }
      });
      setTotalPages(modulesResponse.data.data.meta.totalPage);

      setModules(modulesResponse.data.data?.result || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  };

  const handleCreateModule = async () => {
    try {
      const response = await axiosInstance.post('/course-modules', {
        title: formData.title,
        courseId
      });
      setModules(prev => [...prev, response.data.data]);
      setFormData({ title: '' });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

  const handleUpdateModule = async () => {
    if (!currentModule) return;
    try {
      const response = await axiosInstance.patch(`/course-modules/${currentModule._id}`, {
        title: formData.title
      });
      setModules(prev =>
        prev.map(module =>
          module._id === currentModule._id ? response.data.data : module
        )
      );
      setFormData({ title: '' });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const handleDeleteModule = async () => {
    if (!deletingModuleId) return;
    try {
      await axiosInstance.delete(`/course-modules/${deletingModuleId}`);
      setModules(prev => prev.filter(module => module._id !== deletingModuleId));
      setDeletingModuleId(null);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const handleDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialogMode === 'create') {
      handleCreateModule();
    } else {
      handleUpdateModule();
    }
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setFormData({ title: '' });
    setCurrentModule(null);
    setOpenDialog(true);
  };

  const openEditDialog = (module: any) => {
    setDialogMode('edit');
    setFormData({ title: module.title });
    setCurrentModule(module);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className='flex flex-row items-center gap-4'>

            <h1 className="text-3xl font-bold tracking-tight">Course Modules</h1>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search modules..."
                className="h-8 w-[200px]"
              />
              <Button
                onClick={handleSearch}
                size="default"
                className="bg-supperagent hover:bg-supperagent/90 h-8 px-4"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
          {courseName && (
            <p className="mt-2 text-sm text-gray-600">
              Course: <span className="font-semibold">{courseName}</span>
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
            onClick={openCreateDialog}
            className="bg-supperagent hover:bg-supperagent/90"
            disabled={!courseId}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Module
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-6">
              <BlinkingDots size="large" color="bg-supperagent" />
            </div>
          ) : modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
              <p className="text-lg">No modules found.</p>
              <Button
                onClick={openCreateDialog}
                className="mt-4 bg-supperagent hover:bg-supperagent/90"
                disabled={!courseId}
              >
                Create your first module
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module: any, index: number) => (
                  <TableRow key={module?._id}>

                    <TableCell className="font-medium">{module?.title}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/lessons?moduleId=${module?._id}&courseId=${courseId}`
                                  )
                                }
                              >
                                <BookOpen className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Lessons</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 "
                                onClick={() => openEditDialog(module)}
                              >
                                <Pen className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Module</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setDeletingModuleId(module._id);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Module</p>
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

      {/* Create/Edit Module Dialog */}
   <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="sm:max-w-3xl p-6 rounded-xl shadow-lg border">
    <DialogHeader className="space-y-2 text-center">
      <DialogTitle className="text-2xl font-semibold">
        {dialogMode === "create" ? "Create New Module" : "Edit Module"}
      </DialogTitle>
      <DialogDescription className="text-base text-muted-foreground">
        {dialogMode === "create"
          ? "Provide the necessary information to add a new module."
          : "Modify the details of the selected module."}
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleDialogSubmit} className="mt-4 space-y-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title" className="text-lg font-medium">
          Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter module title"
          required
          className="h-12 text-lg"
        />
      </div>

      <DialogFooter className="pt-4 flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpenDialog(false)}
          className="h-12 px-6 text-lg"
        >
          Cancel
        </Button>
        <Button type="submit" className="h-12 px-6 text-lg bg-supperagent hover:bg-supperagent/90">
          <Save className="mr-2 h-5 w-5" />
          {dialogMode === "create" ? "Create Module" : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>


      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this module? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeletingModuleId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteModule}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}