import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Heart,
  ShoppingCart,
  User,
  BookOpen, // Icon for My Courses
  Plus,
  Minus,
  Trash,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  decreaseQuantity,
  increaseQuantity,
  removeItem
} from '@/redux/features/cartSlice';
import { logout } from '@/redux/features/authSlice';

// --- Logo ---
function Logo({ onClick }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate('/student');
        if (onClick) onClick();
      }}
      className="flex cursor-pointer items-center space-x-2 transition-opacity hover:opacity-80"
    >
      <GraduationCap className="h-9 w-9 text-supperagent" />
      <span className="text-2xl font-bold text-supperagent">Medicare Training</span>
    </div>
  );
}

// --- Desktop NavLink ---
function NavLink({ to, children, end = false }) {
  return (
    <li>
      <RouterNavLink
        to={to}
        end={end}
        className={({ isActive }) => 
          `text-sm font-semibold transition-colors hover:text-supperagent`
        }
      >
        {children}
      </RouterNavLink>
    </li>
  );
}

// --- Mobile NavLink ---
const MobileNavLink = React.forwardRef(({ to, children, onClick, end = false }, ref) => {
  return (
    <RouterNavLink
      ref={ref}
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => 
        `block py-4 text-lg font-medium border-b border-gray-100 ${isActive ? 'text-supperagent' : 'text-gray-800'}`
      }
    >
      {children}
    </RouterNavLink>
  );
});

const MotionMobileNavLink = motion(MobileNavLink);

// --- Animation Variants ---
const menuWrapperVariants = {
  initial: { x: '100%' },
  animate: { 
    x: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren"
    }
  },
  exit: { 
    x: '100%',
    transition: { 
      duration: 0.3, 
      ease: [0.22, 1, 0.36, 1],
      when: "afterChildren"
    }
  }
};

const contentStaggerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

// --- Main StudentNav Component ---
export function StudentNav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { cartItems, totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const cartButtonRef = useRef(null);
  const cartDropdownRef = useRef(null);

  // --- Actions ---
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleIncrease = (id) => dispatch(increaseQuantity(id));
  const handleDecrease = (id) => dispatch(decreaseQuantity(id));
  const handleRemove = (id) => dispatch(removeItem(id));

  const handleCart = () => {
    navigate('/student/cart');
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
  };

  // --- Effects ---
  useEffect(() => setIsMobileMenuOpen(false), [location]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isCartOpen &&
        cartButtonRef.current &&
        !cartButtonRef.current.contains(event.target) &&
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target)
      ) {
        setIsCartOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen]);

  return (
    <div className="sticky top-0 z-[9999] border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto ">
        <div className="flex h-16 items-center justify-between">
          
          {/* 1. Left: Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Logo onClick={undefined} />
          </div>

          {/* 2. Center: Navigation (Desktop) */}
          <nav className="hidden md:flex flex-1 items-center justify-center">
            <ul className="flex items-center space-x-10">
              <NavLink to="/student" end>Home</NavLink>
              <NavLink to="/student/courses">Courses</NavLink>
              <NavLink to="/student/contact">Contact</NavLink>
            </ul>
          </nav>

          {/* 3. Right: Actions */}
          <div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-4">
            
            {/* Wishlist */}
            <button className="hidden rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-supperagent sm:block">
              <Heart className="h-5 w-5" />
            </button>

            {/* Cart Section */}
            <div className="relative">
              <button
                ref={cartButtonRef}
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`relative rounded-full p-2 hover:bg-gray-100 ${
                  isCartOpen ? 'bg-gray-100 text-supperagent' : 'text-gray-500'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalQuantity > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-supperagent text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div
                  ref={cartDropdownRef}
                  className="absolute right-0 top-full mt-3 w-80 sm:w-96 transform rounded-xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all z-50"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900">Shopping Cart</h3>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto border-t border-gray-50 px-4">
                    {cartItems.length > 0 ? (
                      <ul className="divide-y divide-gray-50">
                        {cartItems.map((item) => (
                          <li key={item.id} className="flex py-4">
                            <img src={item.image || '/placeholder.svg'} alt={item.title} className="h-14 w-14 rounded-md object-cover border border-gray-100"/>
                            <div className="ml-3 flex flex-1 flex-col">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                                <button type="button" onClick={() => handleRemove(item.id)} className="ml-2 text-gray-400 hover:text-red-500"><Trash size={14} /></button>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center space-x-2 rounded-md border border-gray-200 p-0.5">
                                  <button onClick={() => handleDecrease(item.id)} className="p-1 text-gray-500 hover:text-supperagent"><Minus size={10} /></button>
                                  <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                  <button onClick={() => handleIncrease(item.id)} className="p-1 text-gray-500 hover:text-supperagent"><Plus size={10} /></button>
                                </div>
                                <span className="text-sm font-semibold text-supperagent">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingCart className="h-10 w-10 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Your cart is empty.</p>
                      </div>
                    )}
                  </div>
                  {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-xl">
                      <div className="mb-3 flex justify-between text-base font-medium text-gray-900">
                        <span>Subtotal</span>
                        <span>${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                      </div>
                      <button onClick={handleCart} className="w-full rounded-lg bg-supperagent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-supperagent/90">Go to Cart</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Student Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              
              {/* My Courses Button */}
              <RouterNavLink
                to="/student/my-courses"
                className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>My Courses</span>
              </RouterNavLink>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-500 md:hidden hover:bg-gray-100 rounded-full"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* ANIMATED MOBILE MENU OVERLAY                                           */}
      {/* ---------------------------------------------------------------------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-student-menu"
            variants={menuWrapperVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[10000] bg-white md:hidden flex flex-col h-screen"
          >
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
              <Logo onClick={() => setIsMobileMenuOpen(false)} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Content */}
            <motion.div 
              variants={contentStaggerVariants}
              className="flex-1 overflow-y-auto p-6 flex flex-col"
            >
              <motion.nav className="mb-8">
                <MotionMobileNavLink variants={itemVariants} to="/student" end onClick={() => setIsMobileMenuOpen(false)}>Home</MotionMobileNavLink>
                <MotionMobileNavLink variants={itemVariants} to="/student/courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</MotionMobileNavLink>
                <MotionMobileNavLink variants={itemVariants} to="/student/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</MotionMobileNavLink>
              </motion.nav>

              {/* Mobile Actions */}
              <motion.div variants={itemVariants} className="mt-auto space-y-4">
                <RouterNavLink
                  to="/student/my-courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center items-center space-x-2 rounded-xl border border-gray-300 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 w-full"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>My Courses</span>
                </RouterNavLink>

                <button
                  onClick={handleLogout}
                  className="flex justify-center items-center space-x-2 rounded-xl bg-red-50 py-3 text-base font-medium text-red-600 hover:bg-red-100 w-full border border-red-100"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}