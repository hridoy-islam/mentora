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
  CreditCard,
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
  Calendar,
  AlertCircle
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
import { OrderSuccess } from './components/order-success';
import { AuthDialog } from './components/auth-dialog';
import { Loader } from '@/components/shared/MedicareLoader';

// --- WORLDPAY CONSTANTS ---
const WORLDPAY_CHECKOUT_ID = 'your-checkout-id'; // <--- REPLACE WITH YOUR ID
const WORLDPAY_SCRIPT_URL = 'https://try.access.worldpay.com/access-checkout/v2/checkout.js';

// --- Helper Component: FormInput ---
const FormInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'text'
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

// --- Compact Cart Item (Read Only) ---
function CartItemCompact({ item }) {
  return (
    <div className="group -mx-2 flex gap-4 rounded-lg border-b border-dashed border-gray-200 px-2 py-5 transition-colors last:border-0 hover:bg-gray-50/50">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <img
          src={item.image || '/placeholder.jpg'}
          alt={item.title}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div className="flex justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">
            {item.title}
          </h3>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            {item.quantity > 1 && (
              <span className="text-xs font-medium text-gray-400">
                (${item.price.toFixed(2)} ea)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1">
            <span className="text-xs font-medium text-gray-500">Qty:</span>
            <span className="text-sm font-bold text-gray-900">
              {item.quantity}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export function CheckoutPage() {
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Form State
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

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplied, setIsApplied] = useState(false);
  const [showPartyEffect, setShowPartyEffect] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  
  // Payment Logic States
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Worldpay Ref
  const checkoutRef = useRef(null);

  const [loadingUserData, setLoadingUserData] = useState(false);
  const couponRef = useRef(null);
  const [couponBoxSize, setCouponBoxSize] = useState({ width: 0, height: 0 });

  // --- Worldpay Integration Logic ---
  useEffect(() => {
    // 1. Helper to load script dynamically
    const loadCheckoutScript = (src) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    // 2. Initialize Worldpay SDK
    const initWorldpay = () => {
      return new Promise((resolve, reject) => {
        if (!window.Worldpay) {
            reject("Worldpay SDK not found.");
            return;
        }

        window.Worldpay.checkout.init({
            id: WORLDPAY_CHECKOUT_ID,
            form: '#payment-section-container', // Must match the container ID in JSX
            fields: {
                pan: {
                    selector: '#card-pan',
                },
                expiry: {
                    selector: '#card-expiry',
                },
                cvv: {
                    selector: '#card-cvc', 
                },
            },
            styles: {
                // Style the iframes to match the site look
                'input': { 
                    'color': '#111827', 
                    'font-size': '14px', 
                    'font-family': 'ui-sans-serif, system-ui, sans-serif',
                    'letter-spacing': '0.025em'
                },
                'input.is-valid': { 'color': '#10B981' },
                'input.is-invalid': { 'color': '#EF4444' },
                'input.is-focus': { 'color': '#111827' }
            },
            enablePanFormatting: true,
        }, (error, checkoutInstance) => {
            if (error) {
                reject(error);
            } else {
                resolve(checkoutInstance);
            }
        });
      });
    };

    // 3. Execution Flow
    loadCheckoutScript(WORLDPAY_SCRIPT_URL)
        .then(() => initWorldpay())
        .then((instance) => {
            checkoutRef.current = instance;
            setIsSdkReady(true);
            console.log("Worldpay SDK Ready");
        })
        .catch((err) => {
            console.error("Worldpay init failed:", err);
            setPaymentError("Payment system failed to load. Please refresh.");
        });

    // 4. Cleanup
    return () => {
        if (checkoutRef.current) {
            checkoutRef.current.remove(); // Uncomment if SDK supports remove() to clean DOM
        }
    };
  }, []);

  // Prefill form data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        address: user.address || '',
        state: user.state || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (couponRef.current) {
      const { offsetWidth, offsetHeight } = couponRef.current;
      setCouponBoxSize({ width: offsetWidth, height: offsetHeight });
    }
  }, [showPartyEffect]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

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

  const totalAmount = cartSubtotal * (1 - discount);
  const accentColorClass = 'bg-supperagent bg-supperagent';

  // --- Payment Execution ---
  const handleCheckout = async () => {
    if (!user) return;

    setPaymentError('');
    setIsProcessingOrder(true);

    // 1. Validate Worldpay is loaded
    if (!checkoutRef.current) {
        setPaymentError("Payment system not initialized. Please refresh page.");
        setIsProcessingOrder(false);
        return;
    }

    // 2. Generate Session (Tokenization)
    checkoutRef.current.generateSessionState(async (error, session) => {
        if (error) {
            console.warn(`Failed to generate session: ${error}`);
            setPaymentError('Please check your card details and try again.');
            setIsProcessingOrder(false);
            return;
        }

        // 3. Send Session + Order Data to Backend
        await processBackendOrder(session);
    });
  };

  const processBackendOrder = async (sessionId) => {
    try {
      const orderData = {
        paymentSessionId: sessionId, // <--- Token sent to backend
        items: cartItems.map((item) => ({
          courseId: item?.id,
          quantity: item.quantity,
          unitPrice: item.price,
          subTotal: item.price * item.quantity
        })),
        totalAmount: totalAmount,
        buyerId: user?._id,
        discount: discount,
        role: user?.role,
        couponCode: isApplied ? couponCode : null,
        shippingDetails: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        }
      };

      const response = await axiosInstance.post('/order', orderData);

      if (response.status === 200 || response.status === 201) {
        dispatch(clearCart());
        setOrderComplete(true);
        toast({
          title: 'Success!',
          description: 'Your order has been placed successfully.'
        });
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Transaction failed. Please try again.';
      setPaymentError(msg);
      toast({
        title: 'Order Failed',
        description: msg,
        variant: 'destructive'
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (orderComplete) {
    return <OrderSuccess />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50/50 px-4 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-100 opacity-50 blur-xl"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-gray-100">
            <ShoppingBag size={40} className="text-blue-500" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Your cart is empty
        </h2>
        <p className="mt-4 max-w-sm leading-relaxed text-gray-500">
          Looks like you haven't discovered our courses yet. Start learning
          today!
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

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto py-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-mentora">
              Secure Checkout
            </h1>
          </div>
        </div>

        <div className="container mx-auto py-8">
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
            {/* --- LEFT SIDE: Delivery Information --- */}
            <div className="space-y-8 lg:col-span-7">
              {/* Login Prompt (Only if not logged in) */}

              {/* 1. Contact Information */}
              <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] sm:p-8">
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
                  {/* Name & Email */}
                  <FormInput
                    label="Full Name"
                    icon={User}
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange('fullName', e.target.value)
                    }
                    placeholder="John Doe"
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormInput
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      placeholder="john@example.com"
                    />
                    <FormInput
                      label="Phone Number"
                      icon={Phone}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  {/* Address Section Title */}
                  <div className="border-b border-gray-100 pb-2 pt-4">
                    <h3 className="text-sm font-bold text-gray-800">
                      Address Details
                    </h3>
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
                        onValueChange={(value) =>
                          handleInputChange('country', value)
                        }
                      >
                        <SelectTrigger className="h-[50px] w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3.5 pl-10 text-sm font-medium text-gray-900 shadow-sm transition-all duration-300 ease-out focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {(
                            countries || [
                              'United States',
                              'United Kingdom',
                              'Canada'
                            ]
                          ).map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* City, State, Zip Row */}
                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormInput
                      label="City"
                      icon={Building}
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange('city', e.target.value)
                      }
                      placeholder="New York"
                    />
                    <FormInput
                      label="State / Province"
                      icon={Navigation}
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange('state', e.target.value)
                      }
                      placeholder="NY"
                    />
                    <FormInput
                      label="Zip Code"
                      icon={LocateFixed}
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange('zipCode', e.target.value)
                      }
                      placeholder="10001"
                    />
                  </div>

                  {/* Address Text Area */}
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
                        onChange={(e) =>
                          handleInputChange('address', e.target.value)
                        }
                        placeholder="123 Main St, Apt 4B"
                        className="min-h-[100px] w-full resize-y rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm font-medium text-gray-900 shadow-sm transition-all duration-300 ease-out placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- RIGHT SIDE: Order Summary --- */}
            <div className="mt-8 lg:col-span-5 lg:mt-0">
              <div className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
                {/* Header */}
                <div className="bg-supperagent px-8 py-6 text-white">
                  <h2 className="text-lg font-bold">Order Summary</h2>
                  <p className="mt-1 text-xs text-gray-100">
                    Review your items before payment
                  </p>
                </div>

                {/* Cart Items List */}
                <div className="custom-scrollbar max-h-[350px] overflow-y-auto bg-white px-8 py-4">
                  {cartItems.map((item) => (
                    <CartItemCompact key={item.id} item={item} />
                  ))}
                </div>

                <div className="bg-gray-50/50 px-8 pb-8 pt-4">
                  {/* Coupon Input */}
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
                        <CheckCircle
                          size={16}
                          className="mt-0.5 shrink-0 text-green-600"
                        />
                        <div>
                          <p className="text-xs font-bold text-green-700">
                            Coupon Applied Successfully!
                          </p>
                          <p className="text-[10px] text-green-600">
                            You saved 10% on your order.
                          </p>
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

                  {/* Calculations */}
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
                      <span className="text-base font-bold text-gray-900">
                        Total
                      </span>
                      <div className="text-right">
                        <span className="block text-2xl font-extrabold tracking-tight text-gray-900">
                          ${totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* --- WORLDPAY SECURE PAYMENT FIELDS --- */}
                  <div className="mb-4">
                    <h2 className="mb-4 text-lg font-bold text-gray-900">
                      Payment Method
                    </h2>
                    
                    {/* Container ID must match init config 'form' */}
                    <div id="payment-section-container" className="space-y-4">
                        
                        {/* 1. Card Number */}
                        <div>
                           <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                             Card Number
                           </label>
                           <div className="relative">
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                                   <CreditCard size={18} />
                               </div>
                               {/* Worldpay iframe injects here */}
                               <div id="card-pan" className="h-[46px] w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 flex items-center shadow-sm"></div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* 2. Expiry */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Expiry
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                                        <Calendar size={18} />
                                    </div>
                                    <div id="card-expiry" className="h-[46px] w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 flex items-center shadow-sm"></div>
                                </div>
                            </div>

                            {/* 3. CVC */}
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  CVC
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div id="card-cvc" className="h-[46px] w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-3 flex items-center shadow-sm"></div>
                                </div>
                            </div>
                        </div>

                        {/* Error Message Display */}
                        {paymentError && (
                            <div className="rounded-lg border border-red-100 bg-red-50 p-3 flex items-start gap-2 text-sm text-red-600">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{paymentError}</span>
                            </div>
                        )}
                        
                        {!isSdkReady && (
                           <div className="text-center text-xs text-gray-400 flex justify-center items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" /> Loading secure payment fields...
                           </div>
                        )}
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={
                      !user || cartItems.length === 0 || isProcessingOrder || !isSdkReady
                    }
                    className={`group relative mt-8 w-full overflow-hidden rounded-xl ${accentColorClass} py-4 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none`}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      {isProcessingOrder ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Processing Securely...</span>
                        </>
                      ) : (
                        <>
                          {!user ? (
                            <span className="flex items-center gap-2">
                              <Lock size={16} /> Login Required to Pay
                            </span>
                          ) : (
                            <>
                              <span>Pay ${totalAmount.toFixed(2)}</span>
                              <ArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                              />
                            </>
                          )}
                        </>
                      )}
                    </div>
                    {/* Button Shine Effect - Only when active */}
                    {user && !isProcessingOrder && (
                      <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    )}
                  </button>

                  <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-green-700">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">
                        SSL Secure Payment via Worldpay
                      </span>
                    </div>
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