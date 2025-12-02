import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import { Plus, Minus, Trash2, ArrowUpRight, CheckCircle, Loader2 } from 'lucide-react';

import {
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart
} from '@/redux/features/cartSlice';
import axiosInstance from '@/lib/axios'; 
import { useToast } from '@/components/ui/use-toast';
import { OrderSuccess } from './components/order-success';
import { AuthDialog } from './components/auth-dialog';

// --- CartRow Component (Kept same as provided) ---
function CartRow({ item, isLast }: { item: any, isLast: boolean }) {
  const dispatch = useDispatch();
  const itemSubtotal = (item.price * item.quantity).toFixed(2);

  return (
    <div
      className={`grid grid-cols-6 items-center py-4 text-sm text-gray-700 ${
        !isLast ? 'border-b border-gray-200' : ''
      }`}
    >
      <div className="col-span-1 flex items-start pr-2">
        <img
          src={item.image || '/placeholder.svg'}
          alt={item.title}
          className="mr-4 h-16 w-16 rounded-md object-cover"
        />
      </div>
      <div className="col-span-1 text-center font-medium">{item.title}</div>
      <div className="col-span-1 text-center font-medium">
        ${item.price.toFixed(2)}
      </div>
      <div className="col-span-1 flex justify-center">
        <div className="flex items-center space-x-2 rounded-md border border-gray-300 p-1">
          <button
            onClick={() => dispatch(decreaseQuantity(item.id))}
            className="p-1 text-gray-600 transition-colors hover:text-gray-900"
          >
            <Minus size={14} />
          </button>
          <span className="font-medium">{item.quantity}</span>
          <button
            onClick={() => dispatch(increaseQuantity(item.id))}
            className="p-1 text-gray-600 transition-colors hover:text-gray-900"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="col-span-1 text-center font-bold text-gray-900">
        ${itemSubtotal}
      </div>
      <div className="col-span-1 flex justify-center">
        <button
          onClick={() => dispatch(removeItem(item.id))}
          className="p-2 text-gray-400 transition-colors hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// --- Main CartPage ---
export function CartPage() {
  const { cartItems } = useSelector((state: any) => state.cart);
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplied, setIsApplied] = useState(false);
  const [showPartyEffect, setShowPartyEffect] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const couponRef = React.useRef<HTMLDivElement>(null);
  const [couponBoxSize, setCouponBoxSize] = useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (couponRef.current) {
      const { offsetWidth, offsetHeight } = couponRef.current;
      setCouponBoxSize({ width: offsetWidth, height: offsetHeight });
    }
  }, [showPartyEffect]);

  const cartSubtotal = cartItems.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
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
      setTimeout(() => setShowPartyEffect(false), 1000);
    } else {
      setCouponError('Invalid coupon code!');
      setIsApplied(false);
      setDiscount(0);
    }
  };

  const totalAmount = cartSubtotal * (1 - discount);
  const accentColor = 'bg-supperagent';

  // --- Checkout Logic ---
  const handleCheckout = async () => {
    // 1. Check Auth
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }


    const orderItems = cartItems.map((item: any) => ({
      courseId: item?.id, 
      quantity: item.quantity,
      unitPrice: item.price, 
      subTotal: item.price * item.quantity, 
    }));

    // 2. Process Order
    setIsProcessingOrder(true);
    try {
      const orderData = {
        items: orderItems,
        totalAmount: totalAmount,
        buyerId: user?._id,
        discount: discount,
        role: user?.role,
        couponCode: isApplied ? couponCode : null,
      };
      const response = await axiosInstance.post('/order', orderData);

      if (response.status === 200 || response.status === 201) {
        dispatch(clearCart());
        setOrderComplete(true);
        toast({
          title: "Success!",
          description: "Your order has been placed successfully.",
        });
      }
    } catch (error) {
      console.error("Order failed", error);
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (orderComplete) {
    return <OrderSuccess />;
  }

  const EmptyCart = (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="mb-6 text-lg text-gray-500">Your Cart is Empty</p>
      <RouterNavLink
        to="/courses"
        className="flex items-center space-x-2 rounded-md border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <span>Explore Products!</span>
        <ArrowUpRight size={16} />
      </RouterNavLink>
    </div>
  );

  return (
    <>
      <div className="container mx-auto py-24">
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-6 gap-4 rounded-t-lg bg-supperagent px-4 py-3 text-sm font-semibold text-white">
              <div className="col-span-1">Image</div>
              <div className="col-span-1">Course</div>
              <div className="col-span-1 text-center">Price</div>
              <div className="col-span-1 text-center">Quantity</div>
              <div className="col-span-1 text-center">Subtotal</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>

            <div className="rounded-b-lg bg-white p-4 shadow-md">
              {cartItems.length === 0 ? (
                EmptyCart
              ) : (
                <div>
                  {cartItems.map((item: any, index: number) => (
                    <CartRow
                      key={item.id}
                      item={item}
                      isLast={index === cartItems.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Cart Total</h2>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-semibold text-gray-800">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>

                {isApplied && (
                  <div className="flex justify-between border-b border-gray-100 pb-3 text-green-600">
                    <span className="text-gray-600">Discount (10%)</span>
                    <span className="font-semibold text-green-600">
                      -${(cartSubtotal * 0.1).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-1">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Coupon Input */}
              <div className="relative mb-6 " ref={couponRef}>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-l-md border border-gray-300 px-4 py-2 focus:outline-none "
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplied}
                    className={`rounded-r-md px-4 py-2 text-white ${
                      isApplied ? 'bg-gray-400' : accentColor
                    } transition-opacity hover:opacity-90`}
                  >
                    Apply
                  </button>
                </div>

                {showPartyEffect && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <ReactConfetti
                      width={couponBoxSize.width}
                      height={couponBoxSize.height}
                      numberOfPieces={120}
                      recycle={false}
                      gravity={0.25}
                      tweenDuration={1000}
                    />
                  </div>
                )}

                {isApplied && !showPartyEffect && (
                  <p className="mt-2 flex items-center text-sm text-green-600">
                    <CheckCircle size={16} className="mr-1" />
                    Coupon applied successfully!
                  </p>
                )}

                {couponError && (
                  <p className="mt-2 text-sm text-red-600">{couponError}</p>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || isProcessingOrder}
                className={`mt-4 w-full rounded-md text-center ${accentColor} flex items-center justify-center space-x-2 px-6 py-3 text-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Checkout</span>
                    <ArrowUpRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog Wrapper */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen} 
      />
    </>
  );
}