import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Heart,
  ShoppingCart,
  User,
  ArrowUpRight,
  Plus,
  Minus,
  Trash,
  Grip,
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

// --- Logo ---
function Logo({ onClick }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate('/');
        if (onClick) onClick();
      }}
      className="flex cursor-pointer items-center space-x-2 transition-opacity hover:opacity-80"
    >
      <img src="/logo.png" alt="medicare" width={120} />
    </div>
  );
}

// --- Desktop NavLink ---
function NavLink({ to, children }) {
  return (
    <li>
      <RouterNavLink
        to={to}
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
// FIX: Pass the ref to RouterNavLink so Motion works correctly
const MobileNavLink = React.forwardRef(({ to, children, onClick }, ref) => {
  return (
    <RouterNavLink
      ref={ref}
      to={to}
      onClick={onClick}
      className={({ isActive }) => 
        `block py-4 text-lg font-semibold border-b border-gray-100`
      }
    >
      {children}
    </RouterNavLink>
  );
});

// Create the Motion component
const MotionMobileNavLink = motion(MobileNavLink);

// --- Animation Variants ---
const menuWrapperVariants = {
  initial: { x: '100%' },
  animate: { 
    x: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier
      when: "beforeChildren" // Ensure menu opens before staggering content
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

// --- Main Component ---
export function TopNav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const { cartItems, totalQuantity } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const cartButtonRef = useRef(null);
  const cartDropdownRef = useRef(null);

  // --- Handlers ---
  const handleIncrease = (id) => dispatch(increaseQuantity(id));
  const handleDecrease = (id) => dispatch(decreaseQuantity(id));
  const handleRemove = (id) => dispatch(removeItem(id));

  const handleCart = () => {
    navigate('/cart');
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
  };

  // --- Effects ---
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          
          {/* 1. Left Side: Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Logo onClick={undefined} />
          </div>

          {/* 2. Center: Navigation Items (Desktop) */}
          <nav className="hidden md:flex flex-1 items-center justify-center">
            <ul className="flex items-center space-x-10">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/about-us">About Us</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </ul>
          </nav>

          {/* 3. Right Side: Actions & Mobile Toggle */}
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
                      <button onClick={handleCart} className="w-full rounded-lg bg-supperagent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-supperagent/90">Checkout Now</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              {!user ? (
                <>
                  <RouterNavLink to="/login" className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <User className="h-4 w-4" />
                    <span>Log in</span>
                  </RouterNavLink>
                  <RouterNavLink to="/signup" className="flex items-center space-x-2 rounded-md bg-supperagent px-4 py-2 text-sm font-medium text-white hover:bg-supperagent/90">
                    <span>Sign up</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </RouterNavLink>
                </>
              ) : (
                <div onClick={() => { if (user?.role === 'student') navigate('/student'); else if (['admin', 'instructor', 'company'].includes(user?.role)) navigate('/dashboard'); }} className="flex cursor-pointer items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium bg-supperagent text-white hover:bg-supperagent/90">
                  <Grip className="h-4 w-4" />
                  <span>Dashboard</span>
                </div>
              )}
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

      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            variants={menuWrapperVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[10000] bg-white md:hidden flex flex-col h-[95vh]"
          >
            {/* Mobile Header - No stagger */}
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
              <Logo onClick={() => setIsMobileMenuOpen(false)} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Content Scrollable Area - Stagger applied here */}
            {/* FIX: This must be a motion.div for staggerChildren to work on internal items */}
            <motion.div 
              variants={contentStaggerVariants}
              className="flex-1 overflow-y-auto p-6 flex flex-col"
            >
              
              {/* Links - Staggered Animation */}
              {/* FIX: Use motion.nav to allow variant propagation */}
              <motion.nav className="mb-8">
                <MotionMobileNavLink variants={itemVariants} to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</MotionMobileNavLink>
                <MotionMobileNavLink variants={itemVariants} to="/courses" onClick={() => setIsMobileMenuOpen(false)}>Courses</MotionMobileNavLink>
                <MotionMobileNavLink variants={itemVariants} to="/about-us" onClick={() => setIsMobileMenuOpen(false)}>About Us</MotionMobileNavLink>
                <MotionMobileNavLink variants={itemVariants} to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</MotionMobileNavLink>
              </motion.nav>

              {/* Mobile Actions - Staggered Animation */}
              <motion.div variants={itemVariants} className="mt-auto space-y-4">
                {!user ? (
                  <div className="grid grid-cols-2 gap-4">
                     <RouterNavLink
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex justify-center items-center space-x-2 rounded-xl border border-gray-300 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-5 w-5" />
                      <span>Log in</span>
                    </RouterNavLink>
                    <RouterNavLink
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex justify-center items-center space-x-2 rounded-xl bg-supperagent py-3 text-base font-medium text-white hover:bg-supperagent/90"
                    >
                      <span>Sign up</span>
                      <ArrowUpRight className="h-5 w-5" />
                    </RouterNavLink>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (user?.role === 'student') navigate('/student');
                      else if (['admin', 'instructor', 'company'].includes(user?.role))
                        navigate('/dashboard');
                    }}
                    className="flex cursor-pointer justify-center items-center space-x-2 rounded-xl bg-supperagent py-3 text-base font-medium text-white hover:bg-supperagent/90 w-full"
                  >
                    <Grip className="h-5 w-5" />
                    <span>Go to Dashboard</span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}