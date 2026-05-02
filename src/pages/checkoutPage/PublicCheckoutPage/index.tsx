import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink as RouterNavLink } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import {
  ArrowRight,
  CheckCircle,
  Loader2,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Lock,
  User,
  Mail,
  Phone,
  Globe,
  Building,
  Navigation,
  LocateFixed,
  MapPin,
  AlertCircle,
  CreditCard
} from 'lucide-react';

// Redux & Utils
import { clearCart } from '@/redux/features/cartSlice';
import axiosInstance from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast';

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { countries } from '@/types';

// Components
import { AuthDialog } from './components/auth-dialog';
import { Loader } from '@/components/shared/MedicareLoader';

// ─── Helper: FormInput ────────────────────────────────────────────────────────
const FormInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text'
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-900">
      {label}
    </label>
    <div className="group relative">
      <div className="absolute left-0 top-0 flex h-11 w-10 items-center justify-center text-gray-400 transition-colors group-focus-within:text-supperagent">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  </div>
);

// ─── Cart Item (Read Only) ─────────────────────────────────────────────────────
function CartItemCompact({ item }: { item: any }) {
  return (
    <div className="group -mx-2 flex items-center justify-between gap-4 rounded-lg border-b border-dashed border-gray-200 px-2 py-4 transition-colors last:border-0 hover:bg-gray-50/50">
      <h3 className="line-clamp-1 flex-1 text-sm font-bold text-gray-900">
        {item.title}
      </h3>
      <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1">
        <span className="text-xs font-medium text-gray-500">Qty</span>
        <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
      </div>
      <div className="text-sm font-bold text-gray-900">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}

// ─── Main Checkout Page ────────────────────────────────────────────────────────
export function CheckoutPage() {
  const { cartItems } = useSelector((state: any) => state.cart);
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Billing / contact form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    state: '',
    zipCode: '',
    address: ''
  });

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplied, setIsApplied] = useState(false);
  const [showPartyEffect, setShowPartyEffect] = useState(false);
  const [couponError, setCouponError] = useState('');

  // UI state
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [loadingUserData] = useState(false);

  const couponRef = useRef<HTMLDivElement>(null);
  const [couponBoxSize, setCouponBoxSize] = useState({ width: 0, height: 0 });

  // Pre-fill form from logged-in user profile
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        address: user.address || '',
        state: user.state || '',
        zipCode: user.zipCode || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (couponRef.current) {
      const { offsetWidth, offsetHeight } = couponRef.current;
      setCouponBoxSize({ width: offsetWidth, height: offsetHeight });
    }
  }, [showPartyEffect]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const cartSubtotal = cartItems.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0
  );

  const totalAmount = cartSubtotal * (1 - discount);
  const accentColorClass = 'bg-supperagent';

  // ─── Coupon ────────────────────────────────────────────────────────────────
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    if (couponCode.toUpperCase() === 'SAVE10') {
      setDiscount(0.1);
      setIsApplied(true);
      setCouponError('');
      setShowPartyEffect(true);
      setTimeout(() => setShowPartyEffect(false), 2500);
    } else {
      setCouponError('Invalid coupon code!');
      setIsApplied(false);
      setDiscount(0);
    }
  };

  // ─── Checkout ──────────────────────────────────────────────────────────────
  /**
   * Calls the backend to create a pending order and get a Worldpay redirect URL.
   * Then redirects the browser to Worldpay's Hosted Payment Page.
   * After payment, Worldpay redirects back to /payment/success?orderId=...
   */
  const handleCheckout = async () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }

    if (cartItems.length === 0) return;

    setIsProcessingOrder(true);
    setPaymentError('');

    try {
      const orderData = {
        items: cartItems.map((item: any) => ({
          courseId: item?.id,
          quantity: item.quantity,
          unitPrice: item.price,
          subTotal: item.price * item.quantity
        })),
        totalAmount,
        buyerId: user?._id,
        discount,
        role: user?.role,
        couponCode: isApplied ? couponCode : null,
        shippingDetails: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        }
      };

      // Ask backend to create a pending order + Worldpay payment session
      const response = await axiosInstance.post('/order/initiate-payment', orderData);
      const { redirectUrl } = response.data.data;

      if (!redirectUrl) {
        throw new Error('No redirect URL returned from server.');
      }

      // Clear cart before redirecting so it's empty when user comes back
      dispatch(clearCart());

      // ✅ Redirect user to Worldpay's Hosted Payment Page
      window.location.href = redirectUrl;

    } catch (error: any) {
      console.error('Checkout error:', error);
      const msg =
        error?.response?.data?.message || error?.message || 'Could not initiate payment. Please try again.';
      setPaymentError(msg);
      toast({
        title: 'Checkout Failed',
        description: msg,
        variant: 'destructive'
      });
      setIsProcessingOrder(false);
    }
  };

  // ─── Empty cart ────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50/50 px-4 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-100 opacity-50 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-gray-100">
            <ShoppingBag size={40} className="text-blue-500" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Your cart is empty
        </h2>
        <p className="mt-4 max-w-sm leading-relaxed text-gray-500">
          Looks like you haven't discovered our courses yet. Start learning today!
        </p>
        <RouterNavLink
          to="/courses"
          className={`mt-10 inline-flex items-center justify-center rounded-full ${accentColorClass} px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95`}
        >
          Explore Courses
          <ArrowRight size={18} className="ml-2" />
        </RouterNavLink>
      </div>
    );
  }

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto py-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-mentora">
              Secure Checkout
            </h1>
          </div>
        </div>

        <div className="container mx-auto py-8">
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">

            {/* ── LEFT: Billing Details ──────────────────────────────────── */}
            <div className="space-y-8 lg:col-span-7">
              <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] sm:p-8">

                {/* Login prompt for guests */}
                {!user && (
                  <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <p className="flex items-center gap-2 text-sm text-gray-900">
                      <Lock size={16} className="text-supperagent" />
                      <span>Already have an account?</span>
                      <span
                        onClick={() => setAuthDialogOpen(true)}
                        className="cursor-pointer font-bold text-supperagent hover:underline"
                      >
                        Login
                      </span>
                    </p>
                  </div>
                )}

                {loadingUserData && <Loader />}

                <div className="grid gap-6">
                  <FormInput
                    label="Full Name"
                    icon={User}
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="John Doe"
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormInput
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                    <FormInput
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="border-b border-gray-100 pb-2 pt-4">
                    <h3 className="text-sm font-bold text-gray-800">
                      Billing Address
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Used to pre-fill Worldpay's payment form
                    </p>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Country / Region
                    </label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-supperagent">
                        <Globe size={18} strokeWidth={2} />
                      </div>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleInputChange('country', value)}
                      >
                        <SelectTrigger className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-10 text-sm font-medium text-gray-900 shadow-sm transition-all duration-300 ease-out focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
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
                    </div>
                  </div>

                  {/* City / State / Zip */}
                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormInput
                      label="City"
                      icon={Building}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="New York"
                    />
                    <FormInput
                      label="State / Province"
                      icon={Navigation}
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="NY"
                    />
                    <FormInput
                      label="Zip Code"
                      icon={LocateFixed}
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="10001"
                    />
                  </div>

                  {/* Street Address */}
                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Street Address
                    </label>
                    <div className="group relative transition-all duration-300">
                      <div className="absolute left-3 top-4 text-gray-400 transition-colors duration-300 group-focus-within:text-supperagent">
                        <MapPin size={18} strokeWidth={2} />
                      </div>
                      <Textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main St, Apt 4B"
                        className="min-h-[100px] w-full resize-y rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 shadow-sm transition-all duration-300 ease-out placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Worldpay info banner */}
                <div className="mt-8 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <CreditCard size={20} className="mt-0.5 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Secure payment via Worldpay
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-blue-700">
                      After clicking "Proceed to Payment", you'll be taken to Worldpay's
                      secure hosted page to enter your card details. You'll be redirected
                      back here once your payment is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Order Summary ───────────────────────────────────── */}
            <div className="mt-8 lg:col-span-5 lg:mt-0">
              <div className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">

                {/* Header */}
                <div className="bg-supperagent px-8 py-6 text-white">
                  <h2 className="text-lg font-bold">Order Summary</h2>
                  <p className="mt-1 text-xs text-gray-100">
                    Review your items before payment
                  </p>
                </div>

                {/* Cart Items */}
                <div className="custom-scrollbar max-h-[350px] overflow-y-auto bg-white px-8 py-4">
                  {cartItems.map((item: any) => (
                    <CartItemCompact key={item.id} item={item} />
                  ))}
                </div>

                <div className="bg-gray-50/50 px-8 pb-8 pt-4">

                  {/* Coupon */}
                  <div className="relative mb-6" ref={couponRef}>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                      Promo Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Tag size={16} />
                        </div>
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setCouponError('');
                          }}
                          placeholder="Try SAVE10"
                          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplied}
                        className={`rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all ${
                          isApplied
                            ? 'cursor-not-allowed bg-gray-400'
                            : 'bg-gray-900 hover:bg-gray-800 active:scale-95'
                        }`}
                      >
                        Apply
                      </button>
                    </div>

                    {couponError && (
                      <p className="mt-2 flex items-center text-xs font-semibold text-red-500 animate-in fade-in slide-in-from-top-1">
                        <span className="mr-1">●</span> {couponError}
                      </p>
                    )}

                    {isApplied && !showPartyEffect && (
                      <div className="mt-3 flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 p-3">
                        <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-600" />
                        <div>
                          <p className="text-xs font-bold text-green-700">Coupon Applied!</p>
                          <p className="text-[10px] text-green-600">You saved 10% on your order.</p>
                        </div>
                      </div>
                    )}

                    {showPartyEffect && (
                      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-lg">
                        <ReactConfetti
                          width={couponBoxSize.width}
                          height={200}
                          numberOfPieces={100}
                          recycle={false}
                          gravity={0.3}
                        />
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="mb-6 space-y-3 border-t border-gray-200">
                    <div className="mt-4 flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium text-gray-900">
                        ${cartSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {isApplied && (
                      <div className="flex justify-between text-sm font-medium text-green-600">
                        <span>Discount (10%)</span>
                        <span>-${(cartSubtotal * 0.1).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="block text-2xl font-extrabold tracking-tight text-gray-900">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment error */}
                  {paymentError && (
                    <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={!user || cartItems.length === 0 || isProcessingOrder}
                    className={`group relative mt-2 w-full overflow-hidden rounded-xl ${accentColorClass} py-4 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none`}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isProcessingOrder ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Redirecting to Worldpay...</span>
                        </>
                      ) : !user ? (
                        <span className="flex items-center gap-2">
                          <Lock size={16} /> Login Required to Pay
                        </span>
                      ) : (
                        <>
                          <span>Proceed to Payment · ${totalAmount.toFixed(2)}</span>
                          <ArrowRight
                            size={18}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </div>
                    {/* Shimmer effect */}
                    {user && !isProcessingOrder && (
                      <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    )}
                  </button>

                  {/* Trust badge */}
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-green-700">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">
                        SSL Secure Payment via Worldpay
                      </span>
                    </div>
                    <p className="text-center text-[10px] text-gray-400">
                      You will be redirected to Worldpay's secure hosted payment page
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}