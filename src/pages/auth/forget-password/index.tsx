import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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

// --- Form Schema ---
const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // --- Form Hooks ---
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

  const onSubmit = async (data: UserFormValue) => {
    const result: any = await dispatch(requestOtp(data));
    if (result?.payload?.success) {
      localStorage.setItem('tp_otp_email', data.email);
      router.push('/otp'); 
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-white overflow-hidden">
      
      {/* Left Column - Brand & Visuals (Fixed width 45%) */}
      <div className="hidden lg:flex w-[45%] flex-col items-center justify-center p-8 text-white bg-gradient-to-tr from-supperagent to-supperagent/70 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src="/auth.png"
            alt="Forgot Password Illustration"
            className="w-full max-w-sm mx-auto drop-shadow-2xl mb-8 rounded-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-3">Forgot Password?</h1>
            <p className="text-white/80 text-lg leading-relaxed">
              It happens to the best of us. We'll help you get back into your account in no time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Reset Password
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your email to receive a One-Time Password (OTP).
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        disabled={loading}
                        {...field}
                        className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent rounded-lg"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-supperagent text-white font-semibold text-sm rounded-lg shadow-md hover:bg-supperagent/90 disabled:opacity-70 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending...' : 'Send OTP'}
              </motion.button>
            </form>
          </Form>

          {error && (
            <Badge
              variant="outline"
              className="mt-4 w-full justify-center border-red-200 bg-red-50 py-2 text-red-600"
            >
              {error}
            </Badge>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-supperagent transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}