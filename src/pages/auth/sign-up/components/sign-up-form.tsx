import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, GraduationCap, Building2, UserCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HTMLAttributes } from 'react';

import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from '@/routes/hooks';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface SignUpFormProps extends HTMLAttributes<HTMLDivElement> {
  user?: any;
}

const ROLES = ['student', 'company', 'instructor'] as const;

const signUpSchema = z
  .object({
    role: z.enum(ROLES, { required_error: 'Required' }),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(7, 'Phone required'),
    country: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    address: z.string().optional(),
    expertise: z.string().optional(),
    dateOfBirth: z.string().optional(),
    password: z.string().min(6, 'Min 6 chars'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mismatch",
    path: ['confirmPassword']
  })
  .refine(
    (data) =>
      data.role === 'student' || data.role === 'instructor'
        ? !!data.dateOfBirth
        : true,
    {
      message: 'DOB required',
      path: ['dateOfBirth']
    }
  );

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm({ className, user = {}, ...props }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'student',
      name: '',
      email:  '',
      phone:'',
      country: '',
      city:'',
      state:  '',
      address:  '',
      expertise: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: ''
    }
  });

  const selectedRole = useWatch({ control: form.control, name: 'role' });

  const onSubmit = async (data: SignUpFormValues) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/signup', data);
      if (response?.data?.success) {
        toast({ title: 'Success', description: 'Account created.', className: "bg-supperagent text-white" });
        router.push('/login');
      } else {
        toast({ title: 'Failed', description: response.data.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Compact Role Selection */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Role</FormLabel>
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
                {[
                  { value: 'student', label: 'Student', icon: GraduationCap },
                  { value: 'instructor', label: 'Instructor', icon: UserCheck },
                  { value: 'company', label: 'Organization', icon: Building2 },
                ].map((role) => (
                  <div
                    key={role.value}
                    onClick={() => field.onChange(role.value)}
                    className={cn(
                      "cursor-pointer flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-all",
                      field.value === role.value 
                        ? "bg-white text-supperagent shadow-sm ring-1 ring-gray-200" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                    )}
                  >
                    <role.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{role.label}</span>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dense Grid Layout */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Name - Full Width */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700">{selectedRole === 'company' ? 'Company Name' : 'Full Name'}</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Email & Phone - Side by Side */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@doe.com" {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700">Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567" {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

        

          {/* Location Details - Very Compact Grid */}
          <div className="col-span-2 grid grid-cols-3 gap-3">
             <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700">Country</FormLabel>
                    <FormControl><Input placeholder="Country" {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" /></FormControl>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700">State</FormLabel>
                    <FormControl><Input placeholder="State" {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" /></FormControl>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold text-gray-700">City</FormLabel>
                    <FormControl><Input placeholder="City" {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" /></FormControl>
                </FormItem>
                )}
            />
          </div>

          {/* Address - Full Width */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2 space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700">Address</FormLabel>
                <FormControl>
                  <Input placeholder="Full Address" {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Conditional Instructor Expertise */}
          <AnimatePresence>
            {selectedRole === 'instructor' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="col-span-2"
              >
                <FormField
                  control={form.control}
                  name="expertise"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-semibold text-gray-700">Expertise</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Bio..." {...field} className="min-h-[60px] text-sm border-gray-300 resize-none focus:border-supperagent focus:ring-supperagent" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Passwords - Side by Side */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700">Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type={showPassword ? 'text' : 'password'} {...field} className="h-10 text-sm border-gray-300 pr-8 focus:border-supperagent focus:ring-supperagent" />
                  </FormControl>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-3 text-gray-400 hover:text-supperagent">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-700">Confirm</FormLabel>
                <FormControl>
                  <Input type={showPassword ? 'text' : 'password'} {...field} className="h-10 text-sm border-gray-300 focus:border-supperagent focus:ring-supperagent" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full h-10 mt-2 bg-supperagent text-white font-semibold text-sm rounded-lg shadow-md hover:bg-supperagent/90 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Creating...' : 'Sign Up'}
        </motion.button>
      </form>
    </Form>
  );
}