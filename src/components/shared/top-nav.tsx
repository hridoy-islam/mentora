import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Heart,
  ShoppingCart,
  User,
  ArrowUpRight,
  X,
  Plus,
  Minus,
  Trash
} from 'lucide-react';
import { NavLink as RouterNavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  decreaseQuantity,
  increaseQuantity,
  removeItem
} from '@/redux/features/cartSlice';

// Logo (no change)
function Logo() {
  return (
    <RouterNavLink to="/" className="flex items-center space-x-2">
      <GraduationCap className="h-10 w-10 text-supperagent" />
      <span className="text-3xl font-bold text-supperagent">Mentora</span>
    </RouterNavLink>
  );
}

// NavLink (no change)
function NavLink({ to, children }) {
  return (
    <li>
      <RouterNavLink
        to={to}
        className={({ isActive }) =>
          `pb-1 ${isActive
            ? 'border-b-2 border-supperagent font-medium text-supperagent'
            : 'text-gray-600 hover:text-supperagent'
          }`
        }
      >
        {children}
      </RouterNavLink>
    </li>
  );
}

// TopNav (Updated)
export function TopNav() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, totalQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const cartButtonRef = useRef(null);
  const cartDropdownRef = useRef(null);

  // Handlers for the new actions
  const handleIncrease = (id) => {
    dispatch(increaseQuantity(id));
  };

  const handleDecrease = (id) => {
    dispatch(decreaseQuantity(id));
  };

  const handleRemove = (id) => {
    dispatch(removeItem(id));
  };

  // Effect to close dropdown (no change)
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen]);

  const handleCart = () => {

    navigate('/cart')
    setIsCartOpen(false);

  }


  return (
    <div className="z-[9999] flex items-center justify-between bg-white p-4 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Left Side (no change) */}
        <div className="flex items-center space-x-40">
          <Logo />
          <nav>
            <ul className="flex items-center space-x-8 font-medium">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/courses">Courses</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </ul>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100">
            <Heart className="h-5 w-5" />
          </button>

          {/* Cart Section */}
          <div className="relative">
            <button
              ref={cartButtonRef}
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-supperagent text-xs text-white">
                  {totalQuantity}
                </span>
              )}
            </button>

            {/* Cart Dropdown */}
            {isCartOpen && (
              <div
                ref={cartDropdownRef}
                className="absolute right-0 top-full z-50 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                {cartItems.length > 0 ? (
                  <>
                    <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto p-4">
                      {cartItems.map((item) => (
                        <li key={item.id} className="flex items-center py-3">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.title}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <div className="ml-3 min-w-0 flex-1">
                            <p className=" font-medium text-xs text-gray-800">
                              {item.title}
                            </p>

                            {/* Quantity Selector */}
                            <div className="mt-1 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDecrease(item.id)}
                                className="rounded-full border border-gray-300 p-1 text-gray-600 hover:bg-gray-100"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncrease(item.id)}
                                className="rounded-full border border-gray-300 p-1 text-gray-600 hover:bg-gray-100"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <span className="text-sm font-bold text-gray-600">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="ml-2 self-start p-1 text-gray-400 hover:text-red-500"
                            title="Remove item"
                          >
                            <Trash size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Total Price */}
                    <div className="border-t border-gray-200 p-4">
                      <div className="mb-2 flex justify-between font-medium text-gray-800">
                        <span>Total:</span>
                        <span className='font-bold'>
                          $
                          {cartItems
                            .reduce(
                              (sum, item) => sum + item.price * item.quantity,
                              0
                            )
                            .toFixed(2)}
                        </span>
                      </div>

                      <div

                        onClick={() => handleCart()}
                        className="block w-full rounded-md bg-supperagent px-4 py-2 text-center text-sm font-medium text-white hover:bg-supperagent/90"
                      >
                        Go to Cart
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-600">Your cart is empty.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth Buttons (no change) */}
          <RouterNavLink
            to="/login"
            className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            <span>Log in</span>
          </RouterNavLink>
          <RouterNavLink
            to="/signup"
            className="flex items-center space-x-2 rounded-md bg-supperagent px-4 py-2 text-sm font-medium text-white hover:bg-supperagent/90"
          >
            <span>Sign up</span>
            <ArrowUpRight className="h-4 w-4" />
          </RouterNavLink>
        </div>
      </div>
    </div>
  );
}
