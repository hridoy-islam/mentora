import { useEffect, useState } from 'react';
import { Eye, Pen, Plus, Trash2 } from 'lucide-react';
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
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/shared/data-table-pagination';
import { CategoryDialog } from './components/category-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

interface Category {
  _id: string;
  name: string;
  status: 'block' | 'active';
  createdAt: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const fetchData = async (page: number, entriesPerPage: number, searchTerm = "") => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/category`, {
        params: {
          page,
          limit: entriesPerPage,
          ...(searchTerm ? { searchTerm } : {}),
        }
      });
      setCategories(response.data.data.result);
      setTotalPages(response.data.data.meta.totalPage);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Failed to fetch categories.',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: { name: string }) => {
    try {
      let response;
      if (editingCategory) {
        response = await axiosInstance.patch(`/category/${editingCategory._id}`, data);
      } else {
        response = await axiosInstance.post('/category', data);
      }

      if (response.data && response.data.success === true) {
        toast({
          title: editingCategory ? 'Category Updated successfully' : 'Category Created successfully',
          className: 'bg-supperagent border-none text-white'
        });

        if (editingCategory) {
          setCategories(prev => prev.map(cat =>
            cat._id === editingCategory._id
              ? { ...cat, name: data.name }
              : cat
          ));
        } else {
          fetchData(currentPage, entriesPerPage, searchTerm);
        }
      } else if (response.data && response.data.success === false) {
        toast({
          title: 'Operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      } else {
        toast({
          title: 'Unexpected response. Please try again.',
          className: 'bg-red-500 border-none text-white'
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await axiosInstance.delete(`/category/${categoryToDelete}`);

      if (response.data && response.data.success === true) {
        toast({
          title: 'Category Deleted successfully',
          className: 'bg-supperagent border-none text-white'
        });

        setCategories(prev => prev.filter(cat => cat._id !== categoryToDelete));
      } else {
        toast({
          title: 'Delete operation failed',
          className: 'bg-red-500 border-none text-white'
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred while deleting. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'active' | 'block') => {
    try {
      const response = await axiosInstance.patch(`/category/${id}`, { status: newStatus });

      if (response.data && response.data.success === true) {
        toast({
          title: 'Status updated successfully',
          className: 'bg-supperagent border-none text-white'
        });

        setCategories(prev => prev.map(cat =>
          cat._id === id
            ? { ...cat, status: newStatus }
            : cat
        ));
      } else {
        toast({
          title: 'Status update failed',
          className: 'bg-red-500 border-none text-white'
        });
      }
    } catch (error) {
      toast({
        title: 'An error occurred while updating status. Please try again.',
        className: 'bg-red-500 border-none text-white'
      });
    }
  };

  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage]);

  const handleSearch = () => {
    fetchData(1, entriesPerPage, searchTerm);
    setCurrentPage(1);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">All Categories List</h1>

        <div className="space-x-4">
          <Button
            className="bg-supperagent text-white hover:bg-supperagent/90"
            size={'sm'}
            onClick={() => {
              setEditingCategory(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Category Name"
          className="max-w-[400px] h-8"
        />
        <Button
          size='sm'
          onClick={handleSearch}
          className="border-none min-w-[100px] bg-supperagent text-white hover:bg-supperagent/90"
        >
          Search
        </Button>
      </div>
      <Card >
        <CardContent className='pt-4'>
          {initialLoading ? (
            <div className="flex justify-center py-6">
              <BlinkingDots size="large" color="bg-supperagent" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex justify-center py-6 text-gray-500">
              No categories found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <Link to={`${category._id}`}>{category?.name}</Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={category.status === 'active'}
                          onCheckedChange={(checked) =>
                            handleStatusChange(category._id, checked ? 'active' : 'block')
                          }
                        />
                        <span className={`text-sm font-medium ${category.status === 'active'
                          ? 'text-green-600'
                          : 'text-red-600'
                          }`}>
                          {category.status === 'active' ? 'Active' : 'Disable'}                      </span>
                      </div>
                    </TableCell>

                    <TableCell className="space-x-1 text-center">
                      <Button
                        variant="default"
                        size="icon"
                        onClick={() => handleEdit(category)}
                        className="mr-2"
                      >
                        <Pen className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(category._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}


          {
            categories.length > 40 && (
              <DataTablePagination
                pageSize={entriesPerPage}
                setPageSize={setEntriesPerPage}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )
          }

        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
          }
        }}
        onSubmit={handleSubmit}
        initialData={editingCategory}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}