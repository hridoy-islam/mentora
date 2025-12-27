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
import {
  authWithFbORGoogle,
  loginUser,
  resetError
} from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import {
  useSignInWithFacebook,
  useSignInWithGoogle
} from 'react-firebase-hooks/auth';
import { firebaseAuth } from '@/firebaseConfig';
import { Eye, EyeOff, Loader2, Facebook, Chrome } from 'lucide-react'; 
import { motion } from 'framer-motion';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

type socialUserSchema = {
  name: string | null;
  email: string | null;
  googleUid: string;
  image: string | undefined;
  phone: string | undefined;
  password?: string;
};

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const [signInWithGoogle, googleUser, gLoading] = useSignInWithGoogle(firebaseAuth);
  const [signInWithFacebook, facebookUser, fLoading] = useSignInWithFacebook(firebaseAuth);
  
  const router = useRouter();
  const { loading, error } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const defaultValues = {
    email: '',
    password: ''
  };
  
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    await dispatch(loginUser(data));
  };

  useEffect(() => {
    if (user?.role) {
      if (user.role === 'student') router.push('/student');
      else if (['admin', 'instructor', 'company'].includes(user.role)) router.push('/dashboard');
    }
  }, [user, router]);

  const loginWithFbOrGoogle = async (data: socialUserSchema) => {
    const result: any = await dispatch(authWithFbORGoogle(data));
    if (result?.payload?.success) {
      router.push('/dashboard');
    }
  };

  // Google/FB Effects
  // useEffect(() => {
  //   if (googleUser) {
  //     const { email, displayName, uid, photoURL, phoneNumber } = googleUser.user;
  //     loginWithFbOrGoogle({
  //       name: displayName,
  //       email,
  //       password: '123456', 
  //       googleUid: uid,
  //       image: photoURL || undefined,
  //       phone: phoneNumber || undefined
  //     });
  //   }
  // }, [googleUser]);

  // useEffect(() => {
  //   if (facebookUser) {
  //     const { email, displayName, uid, photoURL, phoneNumber } = facebookUser.user;
  //     loginWithFbOrGoogle({
  //       name: displayName,
  //       email,
  //       password: '123456',
  //       googleUid: uid,
  //       image: photoURL || undefined,
  //       phone: phoneNumber || undefined
  //     });
  //   }
  // }, [facebookUser]);

  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  const isSocialLoading = gLoading || fLoading;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    disabled={loading || isSocialLoading}
                    {...field}
                    className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent rounded-lg"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-semibold text-gray-700">Password</FormLabel>
                    <Link to="/forgot-password" className="text-xs font-medium text-supperagent hover:text-mentora hover:underline">
                        Forgot?
                    </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={loading || isSocialLoading}
                      {...field}
                      className="h-10 text-sm border-gray-300 pr-9 focus:border-supperagent focus:ring-supperagent rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2.5 text-gray-400 hover:text-supperagent transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || isSocialLoading}
            className="w-full h-10 bg-supperagent text-white font-semibold text-sm rounded-lg shadow-md hover:bg-supperagent/90 disabled:opacity-70 flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
          </motion.button>
        </form>
      </Form>

      {/* Social Login Section */}
      {/* <div className="mt-6">
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={loading || isSocialLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 hover:text-supperagent transition-colors"
            >
                {gLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Chrome className="w-4 h-4" />}
                Google
            </button>
            <button
                type="button"
                onClick={() => signInWithFacebook()}
                disabled={loading || isSocialLoading}
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-200 bg-white text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
                {fLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Facebook className="w-4 h-4" />}
                Facebook
            </button>
        </div>
      </div> */}

      {/* Error Message */}
      {error && (
        <Badge
          variant="outline"
          className="mt-4 w-full justify-center border-red-200 bg-red-50 py-2 text-red-600"
        >
          {error}
        </Badge>
      )}
    </>
  );
}