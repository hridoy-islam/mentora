import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/shared/error-message';
import { useEffect } from 'react';

interface CategoryFormData {
    name: string;
}

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CategoryFormData) => void;
    initialData: CategoryFormData | null;
}

export function CategoryDialog({ open, onOpenChange, onSubmit, initialData }: CategoryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
    }
  });

  useEffect(() => {
    if (open) {
      reset();
      if (initialData) {
        reset(initialData);
      }
    }
  }, [open, reset, initialData]);

  const onSubmitForm = (data: CategoryFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Category Name *</label>
              <Input
                {...register('name', { required: 'Category Name is required' })}
                placeholder="Category Name"
              />
              <ErrorMessage message={errors.name?.message?.toString()} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-supperagent text-white hover:bg-supperagent/90"
            >
              {initialData ? 'Save Changes' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}