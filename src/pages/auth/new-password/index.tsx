import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

// --- UI Components ---
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

import { changePassword, resetError } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';

// --- Form Schema ---
const formSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type UserFormValue = z.infer<typeof formSchema>;

export default function NewPasswordPage() {
  const { loading, error: reduxError } = useSelector((state: any) => state.auth);
  const { user } = useSelector((state: any) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Added separate toggle
  const [dialogOpen, setDialogOpen] = useState(false);
  
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
    dispatch(resetError());
  }, [dispatch]);

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
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-white overflow-hidden">
      
      {/* Left Column - Brand & Visuals */}
      <div className="hidden lg:flex w-[45%] flex-col items-center justify-center p-8 text-white bg-gradient-to-tr from-supperagent to-supperagent/70 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')]"></div>
        
        <div className="relative z-10 max-w-md text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src="/auth.png"
            alt="Reset Password Illustration"
            className="w-full max-w-sm mx-auto drop-shadow-2xl mb-8 rounded-xl"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-3">Secure Your Account</h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Create a strong new password to keep your educational journey safe.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
        <div className="w-full max-w-md">
          <AnimatePresence mode='wait'>
            {dialogOpen ? (
              // --- Success State ---
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Password Changed!</h2>
                    <p className="text-gray-500 mt-2">
                    Your password has been updated successfully. You can now log in with your new credentials.
                    </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/login')}
                  className="w-full h-10 bg-supperagent text-white font-semibold text-sm rounded-lg shadow-md hover:bg-supperagent/90 transition-all"
                >
                  Back to Sign In
                </motion.button>
              </motion.div>
            ) : (
              // --- Form State ---
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6 text-center lg:text-left">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Set New Password
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                    Your new password must be different from previous used passwords.
                    </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    
                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold text-gray-700">New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                disabled={loading}
                                {...field}
                                className="h-10 text-sm border-gray-300 pr-9 focus:border-supperagent focus:ring-supperagent rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-3 text-gray-400 hover:text-supperagent transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password Field */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-semibold text-gray-700">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                disabled={loading}
                                {...field}
                                className="h-10 text-sm border-gray-300 pr-9 focus:border-supperagent focus:ring-supperagent rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-3 text-gray-400 hover:text-supperagent transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
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
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </motion.button>
                  </form>
                </Form>

                {reduxError && (
                  <Badge
                    variant="outline"
                    className="mt-4 w-full justify-center border-red-200 bg-red-50 py-2 text-red-600"
                  >
                    {reduxError}
                  </Badge>
                )}

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 hover:text-supperagent transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}