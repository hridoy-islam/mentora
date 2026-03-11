import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import {
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle,
  ShoppingBag,
  Tag,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';

// Redux & Utils
import {
  increaseQuantity,
  decreaseQuantity,
  removeItem,
} from '@/redux/features/cartSlice';

// --- Cart Item Component ---
function CartItem({ item }) {
  const dispatch = useDispatch();

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
        <img
          src={item.image || '/placeholder.jpg'}
          alt={item.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-1">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900">
            {item.title}
          </h3>
        </div>

        {/* Controls & Price */}
        <div className="flex items-center justify-between gap-6 sm:justify-end">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => dispatch(decreaseQuantity(item.id))}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition-all hover:text-red-600 disabled:opacity-50"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => dispatch(increaseQuantity(item.id))}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition-all hover:text-green-600"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="text-right">
            <span className="block text-lg font-bold text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            {item.quantity > 1 && (
              <span className="block text-xs font-medium text-gray-400">
                ${item.price.toFixed(2)} each
              </span>
            )}
          </div>

          <button
            onClick={() => dispatch(removeItem(item.id))}
            className="rounded-full p-2 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export function CartPage() {
  const { cartItems } = useSelector((state:any) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();



  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );


  const totalAmount = cartSubtotal ;
  const accentColorClass = 'bg-supperagent'; // Adjusted to standard tailwind for safety, replace with bg-supperagent if defined

  // Handle Checkout Navigation
  const handleProceedToCheckout = () => {
    // Navigates to the checkout page
    navigate('/checkout'); 
  };

  // --- Empty Cart State ---
  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50/50 px-4 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-100 opacity-50 blur-xl"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-gray-100">
            <ShoppingBag size={40} className="text-supperagent" />
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
          className={`mt-10 inline-flex items-center justify-center rounded-full ${accentColorClass} px-8 py-4 text-sm font-bold text-white shadow-xl shadow-supperagent/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-supperagent/40 active:scale-95`}
        >
          Explore Courses
          <ArrowRight size={18} className="ml-2" />
        </RouterNavLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Shopping Cart
            </h1>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-supperagent">
              {cartItems.length} items
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
          
          {/* --- LEFT SIDE: Cart Items List --- */}
          <div className="space-y-4 lg:col-span-8">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
            
            <div className="pt-6">
               <RouterNavLink to="/courses" className="flex items-center text-sm font-bold text-supperagent">
                 <ChevronLeft size={16} />
                 Continue Shopping
               </RouterNavLink>
            </div>
          </div>

          {/* --- RIGHT SIDE: Order Summary --- */}
          <div className="mt-8 lg:col-span-4 lg:mt-0">
            <div className="sticky top-6 overflow-hidden rounded-2xl bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-100">
              {/* Header */}
              <div className={`${accentColorClass} px-8 py-6 text-white`}>
                <h2 className="text-lg font-bold">Order Summary</h2>
              </div>

              <div className="px-8 pb-8 pt-6">
                
              

                {/* Calculations */}
                <div className="space-y-3 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                
                  <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0}
                  className={`group relative mt-8 w-full overflow-hidden rounded-xl ${accentColorClass} py-4 text-center text-sm font-bold text-white shadow-lg shadow-supperagent/30 transition-all hover:shadow-xl hover:shadow-supperagent/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none`}
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <span>Checkout</span>
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </button>

                
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}