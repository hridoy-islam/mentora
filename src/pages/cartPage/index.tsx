import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import {
  increaseQuantity,
  decreaseQuantity,
  removeItem,
} from "@/redux/features/cartSlice";
import { Plus, Minus, Trash2, ArrowUpRight, CheckCircle } from "lucide-react";
import ReactConfetti from "react-confetti";

function CartRow({ item, isLast }) {
  const dispatch = useDispatch();
  const itemSubtotal = (item.price * item.quantity).toFixed(2);

  return (
    <div
      className={`grid grid-cols-5 items-center py-4 text-sm text-gray-700 ${!isLast ? "border-b border-gray-200" : ""
        }`}
    >
      <div className="col-span-1 flex items-center pr-2">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.title}
          className="h-16 w-16 rounded-md object-cover mr-4"
        />
        <span className="font-medium text-gray-800">{item.title}</span>
      </div>

      <div className="col-span-1 text-center font-medium">
        ${item.price.toFixed(2)}
      </div>

      <div className="col-span-1 flex justify-center">
        <div className="flex items-center space-x-2 border border-gray-300 rounded-md p-1">
          <button
            onClick={() => dispatch(decreaseQuantity(item.id))}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="font-medium">{item.quantity}</span>
          <button
            onClick={() => dispatch(increaseQuantity(item.id))}
            className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
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
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export function CartPage() {
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isApplied, setIsApplied] = useState(false);
  const [showPartyEffect, setShowPartyEffect] = useState(false);
  const [couponError, setCouponError] = useState("");
  const couponRef = React.useRef(null);
const [couponBoxSize, setCouponBoxSize] = useState({ width: 0, height: 0 });

React.useEffect(() => {
  if (couponRef.current) {
    const { offsetWidth, offsetHeight } = couponRef.current;
    setCouponBoxSize({ width: offsetWidth, height: offsetHeight });
  }
}, [showPartyEffect]);


  const cartSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (couponCode.toUpperCase() === "SAVE10") {
      setDiscount(0.1);
      setIsApplied(true);
      setCouponError("");

      // Show party effect
      setShowPartyEffect(true);
      setTimeout(() => setShowPartyEffect(false), 1000);
    } else {
      setCouponError("Invalid coupon code!");
      setIsApplied(false);
      setDiscount(0);
    }
  };

  const totalAmount = cartSubtotal * (1 - discount);
  const accentColor = "bg-supperagent";

  const EmptyCart = (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-gray-500 mb-6 text-lg">Your Cart is Empty</p>
      <RouterNavLink
        to="/courses"
        className="flex items-center space-x-2 border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
      >
        <span>Explore Products!</span>
        <ArrowUpRight size={16} />
      </RouterNavLink>
    </div>
  );

  return (
    <div className="container mx-auto py-24">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-5 gap-4 py-3 px-4 text-sm font-semibold rounded-t-lg bg-supperagent text-white">
            <div className="col-span-1">Product</div>
            <div className="col-span-1 text-center">Price</div>
            <div className="col-span-1 text-center">Quantity</div>
            <div className="col-span-1 text-center">Subtotal</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          <div className="bg-white shadow-md rounded-b-lg p-4">
            {cartItems.length === 0 ? (
              EmptyCart
            ) : (
              <div>
                {cartItems.map((item, index) => (
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
          <div className="bg-white p-6 shadow-xl rounded-lg border border-gray-200 sticky top-4">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Cart Total</h2>

            <div className="space-y-4 mb-6">
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
            <div className="mb-6 relative " ref={couponRef}>
              <div className="flex">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError(""); // Clear error when user types
                  }}
                  placeholder="Enter coupon code"
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none "
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplied}
                  className={`px-4 py-2 rounded-r-md text-white ${isApplied ? "bg-gray-400" : accentColor
                    } hover:opacity-90 transition-opacity`}
                >
                  Apply
                </button>
              </div>

              {/* Party Effect */}
            {showPartyEffect && (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
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




              {/* Success Message */}
              {isApplied && !showPartyEffect && (
                <p className="mt-2 text-green-600 text-sm flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  Coupon applied successfully!
                </p>
              )}

              {/* Error Message */}
              {couponError && (
                <p className="mt-2 text-red-600 text-sm">{couponError}</p>
              )}
            </div>

            <div
              onClick={() => {
                if (!user) navigate("/login");
                else console.log("Proceed to checkout");
              }}
              className={`mt-4 w-full block text-center cursor-pointer rounded-md ${accentColor} px-6 py-3 text-lg font-medium text-white hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
            >
              <span>Checkout</span>
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}