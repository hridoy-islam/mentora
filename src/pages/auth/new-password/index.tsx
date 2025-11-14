import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react'; // Import icons

// --- UI Components ---
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';


import { changePassword, resetError } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';

import { useRouter } from '@/routes/hooks';

const formSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Error will be shown on this field
});

type UserFormValue = z.infer<typeof formSchema>;

export default function NewPasswordPage() {

  const { loading, error: reduxError } = useSelector((state: any) => state.auth);
  const { user } = useSelector((state: any) => state.auth); // For redirect
  const [showPassword, setShowPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false); // Controls success state
  const router = useRouter();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();


  const defaultValues = {
    password: '',
    confirmPassword: ''
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const userData = localStorage.getItem('tp_user_data');
    if (!userData) {
      router.push('/forgot-password');
    }
   
    dispatch(resetError());
  }, [router, dispatch]);

  const onSubmit = async (data: UserFormValue) => {
    const userData = JSON.parse(localStorage.getItem('tp_user_data') || '{}');

    if (!userData._id) {
       router.push('/forgot-password');
       return;
    }

    const result: any = await dispatch(
      changePassword({
        password: data.password,
        userId: userData._id
      })
    );
    if (result?.payload?.success) {
      localStorage.removeItem('tp_user_data');
      localStorage.removeItem('tp_otp_email');
      setDialogOpen(true); // Show success message
    }
  };

  return (
   <div className="flex w-full">
  {/* Left Column - Fixed Image */}
  <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gray-50 relative overflow-hidden">
    <img
      src="/auth.png"
      alt="New Password Illustration"
      className="fixed top-1/2 left-1/4 z-10 w-full max-w-2xl rounded-lg transform -translate-y-1/2 -translate-x-1/2"
    />
    <div className="fixed -top-16 -left-16 w-48 h-48 rounded-full bg-purple-100 opacity-50"></div>
  </div>

  {/* Right Column - Form */}
  <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
    <div className="max-w-md w-full">
      {dialogOpen ? (
        // --- Success State ---
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Password Changed!
          </h1>
          <p className="text-gray-600">
            Your password has been updated successfully. You can now log in
            with your new password.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="h-12 w-full bg-supperagent text-base font-semibold text-white hover:bg-supperagent/90"
          >
            Back to Sign In
          </Button>
        </div>
      ) : (
        // --- Form State ---
        <>
          {/* Header Text */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set New Password
          </h1>
          <p className="text-gray-600 mb-8">
            Create a new, strong password for your account. Make sure it's at
            least 6 characters long.
          </p>

          {/* --- Inlined Form --- */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-4"
            >
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      New Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          disabled={loading}
                          {...field}
                          className="h-12 w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>
                      Confirm New Password <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          disabled={loading}
                          {...field}
                          className="h-12 w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full bg-supperagent text-base font-semibold text-white hover:bg-supperagent/90"
              >
                {loading ? 'Updating Password...' : 'Set New Password'}
              </Button>
            </form>
          </Form>

          {/* Error Display */}
          {reduxError && (
            <Badge
              variant="outline"
              className="mt-4 w-full justify-center border-red-500 py-2 text-red-500"
            >
              {reduxError}
            </Badge>
          )}

          {/* Back to Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="font-medium text-purple-600 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  </div>
</div>

  );
}