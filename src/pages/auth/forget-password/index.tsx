import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { requestOtp, resetError } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';

// --- Form Schema and Type ---
const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type UserFormValue = z.infer<typeof formSchema>;
// --- End Form Schema ---

export default function ForgotPasswordPage() {
  // --- Page Hooks ---
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // --- Form Hooks (from ForgotPasswordForm) ---
  const { loading, error } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const defaultValues = {
    email: ''
  };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });
  // --- End Form Hooks ---

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Reset error on component mount
  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  // --- OnSubmit Logic (from ForgotPasswordForm) ---
  const onSubmit = async (data: UserFormValue) => {
    const result: any = await dispatch(requestOtp(data));
    if (result?.payload?.success) {
      localStorage.setItem('tp_otp_email', data.email);
      router.push('/otp'); // Navigate to OTP page on success
    }
  };
  // --- End OnSubmit Logic ---

 return (
  <div className="flex w-full">
    {/* Left Column - Fixed Image */}
    <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 bg-gray-50 relative overflow-hidden">
      <img
        src="/auth.png"
        alt="Forgot Password Illustration"
        className="fixed top-1/2 left-1/4 z-10 w-full max-w-3xl rounded-lg transform -translate-y-1/2 -translate-x-1/2"
      />
      <div className="fixed -top-16 -left-16 w-48 h-48 rounded-full bg-purple-100 opacity-50"></div>
    </div>

    {/* Right Column - Form */}
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12">
      <div className="max-w-md w-full">
        {/* Header Text */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-600 mb-8">
          No worries! Just enter the email address you used to sign up, and we'll send you an OTP to reset it.
        </p>

        {/* --- Inlined Form JSX --- */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jhon@gmail.com"
                      disabled={loading}
                      {...field}
                      className="h-12 w-full"
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-supperagent text-base font-semibold hover:bg-supperagent/90 text-white"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
        </Form>

        {error && (
          <Badge
            variant="outline"
            className="mt-4 w-full justify-center border-red-500 py-2 text-red-500"
          >
            {error}
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
      </div>
    </div>
  </div>
);

}