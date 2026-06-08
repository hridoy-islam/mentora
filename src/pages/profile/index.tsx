
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { countries } from '@/types';
import axiosInstance from '@/lib/axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  User,
  MapPin,
  Lock,
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  Building2,
  Hash,
  Layers,
  Home,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type NavSection = 'general' | 'billing' | 'password' | 'deactivate';

interface FormErrors {
  [key: string]: string;
}

// ─── Sidebar Nav ─────────────────────────────────────────────────────────────

const navItems: { id: NavSection; label: string; icon: React.ReactNode; danger?: boolean }[] = [
  { id: 'general',    label: 'General Information', icon: <User size={16} /> },
  { id: 'billing',    label: 'Billing Address',     icon: <MapPin size={16} /> },
  { id: 'password',   label: 'Reset Password',      icon: <Lock size={16} /> },
  { id: 'deactivate', label: 'Deactivate Account',  icon: <AlertTriangle size={16} />, danger: true },
];

// ─── Reusable Field ───────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <AlertTriangle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (error?: string) =>
  `h-[50px] w-full rounded-xl border bg-gray-50/50 py-3.5 pl-10 pr-4 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 ${
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useSelector((state: any) => state.auth);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [active, setActive] = useState<NavSection>('general');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [showOldPw, setShowOldPw]       = useState(false);
  const [showNewPw, setShowNewPw]       = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // General
  const [general, setGeneral] = useState({
    name:  user?.name  ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    image: user?.image ?? '',
  });

  // Billing
  const [billing, setBilling] = useState({
    country: user?.country  ?? '',
    city:    user?.city     ?? '',
    zipCode: user?.zipCode  ?? '',
    state:   user?.state    ?? '',
    address: user?.address  ?? '',
  });

  // Password
  const [passwords, setPasswords] = useState({
    oldPassword:     '',
    newPassword:     '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // ── Fetch Profile Data from DB ─────────────────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?._id) return;
      try {
        setFetchLoading(true);
        const res = await axiosInstance.get(`/users/${user._id}`);
        const dbUser = res.data?.data;

        if (dbUser) {
          setGeneral({
            name: dbUser.name ?? '',
            email: dbUser.email ?? '',
            phone: dbUser.phone ?? '',
            image: dbUser.image ?? '',
          });
          setBilling({
            country: dbUser.country ?? '',
            city: dbUser.city ?? '',
            zipCode: dbUser.zipCode ?? '',
            state: dbUser.state ?? '',
            address: dbUser.address ?? '',
          });
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to sync live profile data.',
          variant: 'destructive',
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?._id, toast]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const handleGeneral = (k: keyof typeof general, v: string) => {
    setGeneral((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const handleBilling = (k: keyof typeof billing, v: string) => {
    setBilling((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const handlePasswords = (k: keyof typeof passwords, v: string) => {
    setPasswords((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  // ── Upload Image Handlers ──────────────────────────────────────────────────
  const triggerFileInput = (index: number) => {
    setUploadingIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || uploadingIndex === null) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Validation Error',
        description: 'File must be less than 5MB.',
        variant: 'destructive',
      });
      setUploadingIndex(null);
      return;
    }

    const uploadData = new FormData();
    if (user?._id) uploadData.append('entityId', user._id);
    uploadData.append('file_type', 'userProfile');
    uploadData.append('file', file);

    try {
      const res = await axiosInstance.post('/documents', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const fileUrl = res.data?.data?.fileUrl;
      if (!fileUrl) throw new Error('No file URL returned');

      handleGeneral('image', fileUrl);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully.',
      });
    } catch (err) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image.',
        variant: 'destructive',
      });
    } finally {
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────

  const validateGeneral = () => {
    const e: FormErrors = {};
    if (!general.name.trim())  e.name  = 'Name is required.';
    if (!general.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(general.email)) e.email = 'Invalid email.';
    return e;
  };

  const validateBilling = () => {
    const e: FormErrors = {};
    if (!billing.country) e.country = 'Country is required.';
    if (!billing.city.trim()) e.city = 'City is required.';
    return e;
  };

  const validatePasswords = () => {
    const e: FormErrors = {};
    if (!passwords.oldPassword)     e.oldPassword     = 'Current password is required.';
    if (!passwords.newPassword)     e.newPassword     = 'New password is required.';
    else if (passwords.newPassword.length < 8)
      e.newPassword = 'At least 8 characters.';
    if (passwords.newPassword !== passwords.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  // ── Submit handlers ───────────────────────────────────────────────────────

  const saveGeneral = async () => {
    const e = validateGeneral();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await axiosInstance.patch(`/users/${user._id}`, general);
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveBilling = async () => {
    const e = validateBilling();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await axiosInstance.patch(`/users/${user._id}`, billing);
      toast({
        title: 'Success',
        description: 'Billing address updated.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update billing address.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    const e = validatePasswords();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await axiosInstance.patch(`/users/${user._id}`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast({
        title: 'Success',
        description: 'Password changed successfully.',
      });
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast({
        title: 'Authentication Error',
        description: 'Failed to change password. Check your current password.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deactivateAccount = async () => {
    setDeactivateLoading(true);
    try {
      await axiosInstance.patch(`/users/${user._id}`, { isActive: false });
      toast({
        title: 'Account Status',
        description: 'Account deactivated.',
      });
      setShowDeactivateDialog(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to deactivate account.',
        variant: 'destructive',
      });
    } finally {
      setDeactivateLoading(false);
    }
  };

  // ── Sections ──────────────────────────────────────────────────────────────

  const renderGeneral = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">General Information</h2>
        <p className="mt-1 text-sm text-gray-500">Update your name, email, and contact details.</p>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-5">
        <div className="relative group h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-md ring-2 ring-blue-100">
          {general.image ? (
            <img src={general.image} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white">
              {general.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
          
          {/* File Upload Trigger Overlay */}
          <button
            type="button"
            onClick={() => triggerFileInput(0)}
            disabled={uploadingIndex !== null}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white"
          >
            {uploadingIndex === 0 ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Camera size={16} />
                <span className="text-[10px] mt-0.5 font-medium">Edit</span>
              </>
            )}
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-700">{general.name || 'Your Name'}</p>
            <Button 
              type="button" 
              size="sm" 
              className="h-7 rounded-lg px-2.5 text-xs"
              onClick={() => triggerFileInput(0)}
              disabled={uploadingIndex !== null}
            >
              {uploadingIndex === 0 && <Loader2 size={12} className="mr-1 animate-spin" />}
              Update Image
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{general.email || 'No email attached'}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" icon={<User size={15} />} error={errors.name}>
          <input
            className={inputCls(errors.name)}
            placeholder="John Doe"
            value={general.name}
            onChange={(e) => handleGeneral('name', e.target.value)}
          />
        </Field>

        <Field label="Email Address" icon={<Mail size={15} />} error={errors.email}>
          <input
            className={inputCls(errors.email)}
            type="email"
            placeholder="john@example.com"
            value={general.email}
            onChange={(e) => handleGeneral('email', e.target.value)}
          />
        </Field>

        <Field label="Phone Number" icon={<Phone size={15} />} error={errors.phone}>
          <input
            className={inputCls(errors.phone)}
            placeholder="+1 555 000 0000"
            value={general.phone}
            onChange={(e) => handleGeneral('phone', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveGeneral}
          disabled={loading || uploadingIndex !== null}
          className="h-11 rounded-xl  px-8 text-sm font-semibold text-white shadow-sm "
        >
          {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Billing Address</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your billing and shipping address.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Country */}
        <Field label="Country" icon={<Globe size={15} />} error={errors.country}>
          <Select
            value={billing.country}
            onValueChange={(value) => handleBilling('country', value)}
          >
            <SelectTrigger
              className={`h-[50px] w-full rounded-xl border bg-gray-50/50 py-3.5 pl-10 text-sm font-medium text-gray-900 shadow-sm transition-all duration-300 ease-out focus:bg-white focus:ring-4 ${
                errors.country
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'
              }`}
            >
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {(countries || ['United States', 'United Kingdom', 'Canada']).map(
                (country: string) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </Field>

        {/* State */}
        <Field label="State / Province" icon={<Layers size={15} />} error={errors.state}>
          <input
            className={inputCls(errors.state)}
            placeholder="California"
            value={billing.state}
            onChange={(e) => handleBilling('state', e.target.value)}
          />
        </Field>

        {/* City */}
        <Field label="City" icon={<Building2 size={15} />} error={errors.city}>
          <input
            className={inputCls(errors.city)}
            placeholder="San Francisco"
            value={billing.city}
            onChange={(e) => handleBilling('city', e.target.value)}
          />
        </Field>

        {/* Zip */}
        <Field label="Zip / Postal Code" icon={<Hash size={15} />} error={errors.zipCode}>
          <input
            className={inputCls(errors.zipCode)}
            placeholder="94102"
            value={billing.zipCode}
            onChange={(e) => handleBilling('zipCode', e.target.value)}
          />
        </Field>

        {/* Address — full width */}
        <div className="sm:col-span-2">
          <Field label="Street Address" icon={<Home size={15} />} error={errors.address}>
            <input
              className={inputCls(errors.address)}
              placeholder="123 Market St, Suite 400"
              value={billing.address}
              onChange={(e) => handleBilling('address', e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={saveBilling}
          disabled={loading}
          className="h-11 rounded-xl  px-8 text-sm font-semibold text-white shadow-sm "
        >
          {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <CheckCircle2 size={16} className="mr-2" />}
          Save Address
        </Button>
      </div>
    </div>
  );

  const renderPassword = () => {
    const pwInput = (
      key: keyof typeof passwords,
      label: string,
      placeholder: string,
      show: boolean,
      toggle: () => void
    ) => (
      <Field label={label} icon={<Lock size={15} />} error={errors[key]}>
        <input
          type={show ? 'text' : 'password'}
          className={inputCls(errors[key]) + ' pr-10'}
          placeholder={placeholder}
          value={passwords[key]}
          onChange={(e) => handlePasswords(key, e.target.value)}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </Field>
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose a strong password with at least 8 characters.
          </p>
        </div>

        <div className="grid gap-5">
          {pwInput('oldPassword', 'Current Password', '••••••••', showOldPw, () => setShowOldPw((v) => !v))}
          {pwInput('newPassword', 'New Password', '••••••••', showNewPw, () => setShowNewPw((v) => !v))}
          {pwInput('confirmPassword', 'Confirm New Password', '••••••••', showConfirmPw, () => setShowConfirmPw((v) => !v))}
        </div>

        {/* Strength hint */}
        {passwords.newPassword && (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  passwords.newPassword.length >= i * 3
                    ? i <= 1
                      ? 'bg-red-400'
                      : i === 2
                      ? 'bg-yellow-400'
                      : i === 3
                      ? 'bg-blue-400'
                      : 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="text-xs text-gray-400">
              {passwords.newPassword.length < 4
                ? 'Weak'
                : passwords.newPassword.length < 7
                ? 'Fair'
                : passwords.newPassword.length < 10
                ? 'Good'
                : 'Strong'}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={savePassword}
            disabled={loading}
            className="h-11 rounded-xl  px-8 text-sm font-semibold text-white shadow-sm "
          >
            {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Lock size={16} className="mr-2" />}
            Update Password
          </Button>
        </div>
      </div>
    );
  };

  const renderDeactivate = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Deactivate Account</h2>
        <p className="mt-1 text-sm text-gray-500">
          Once deactivated, your account will be suspended and you'll lose access.
        </p>
      </div>

      <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Warning — this action is irreversible</p>
            <ul className="mt-2 space-y-1 text-xs text-red-700">
              <li>• All your course progress will be suspended.</li>
              <li>• Your certificates and achievements remain stored.</li>
              <li>• You can contact support to reactivate within 30 days.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={() => setShowDeactivateDialog(true)}
          className="h-11 rounded-xl px-8 text-sm font-semibold"
        >
          <AlertTriangle size={15} className="mr-2" />
          Deactivate My Account
        </Button>
      </div>
    </div>
  );

  const sectionMap: Record<NavSection, React.ReactNode> = {
    general:    renderGeneral(),
    billing:    renderBilling(),
    password:   renderPassword(),
    deactivate: renderDeactivate(),
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (fetchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-xs font-medium text-gray-500">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto container py-5">
        
        {/* Hidden Global Native File Input for Avatar */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="image/*"
        />

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row">
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="w-full shrink-0 sm:w-56">
            <nav className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              {navItems.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setActive(item.id); setErrors({}); }}
                  className={`flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-all duration-150 ${
                    idx !== 0 ? 'border-t border-gray-100' : ''
                  } ${
                    active === item.id
                      ? item.danger
                        ? 'bg-red-50 text-red-600'
                        : 'bg-blue-50 text-blue-600'
                      : item.danger
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {active === item.id && <ChevronRight size={14} />}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ─────────────────────────────────────────────────── */}
          <main className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {sectionMap[active]}
          </main>
        </div>
      </div>

      {/* ── Deactivate Confirmation Dialog ──────────────────────────────── */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <DialogTitle className="text-center text-lg font-semibold text-gray-900">
              Deactivate Account?
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-500">
              Your account will be suspended immediately. You can contact support within
              <strong className="text-gray-700"> 30 days</strong> to reactivate it.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setShowDeactivateDialog(false)}
              disabled={deactivateLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={deactivateAccount}
              disabled={deactivateLoading}
            >
              {deactivateLoading ? (
                <Loader2 size={15} className="mr-2 animate-spin" />
              ) : (
                <AlertTriangle size={15} className="mr-2" />
              )}
              Yes, Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}