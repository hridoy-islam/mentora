import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

// This interface is for the addToCart payload
interface AddToCartPayload {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number; // The quantity to add
}

interface CartState {
  cartItems: CartItem[];
  totalQuantity: number;
}

const initialState: CartState = {
  cartItems: [],
  totalQuantity: 0,
};

// Helper function to recalculate total
const calculateTotalQuantity = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // For adding a specific quantity (e.g., from Course Detail Page)
    addToCart: (state, action: PayloadAction<AddToCartPayload>) => {
      const newItem = action.payload;
      const existing = state.cartItems.find(i => i.id === newItem.id);

      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        state.cartItems.push({ ...newItem }); // newItem already has quantity
      }
      state.totalQuantity = calculateTotalQuantity(state.cartItems);
    },

    // For the '+' button in the cart dropdown
    increaseQuantity: (state, action: PayloadAction<any>) => {
      const id = action.payload;
      const existing = state.cartItems.find(i => i.id === id);
      if (existing) {
        existing.quantity += 1;
        state.totalQuantity = calculateTotalQuantity(state.cartItems);
      }
    },

    // For the '-' button in the cart dropdown
    decreaseQuantity: (state, action: PayloadAction<any>) => {
      const id = action.payload;
      const existing = state.cartItems.find(i => i.id === id);

      if (!existing) return;

      if (existing.quantity > 1) {
        existing.quantity -= 1;
      } else {
        // Remove item if quantity becomes 0
        state.cartItems = state.cartItems.filter(i => i.id !== id);
      }
      state.totalQuantity = calculateTotalQuantity(state.cartItems);
    },

    // For the 'X' button in the cart dropdown
    removeItem: (state, action: PayloadAction<any>) => {
      const id = action.payload;
      state.cartItems = state.cartItems.filter(i => i.id !== id);
      state.totalQuantity = calculateTotalQuantity(state.cartItems);
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalQuantity = 0;
    },
  },
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeItem,clearCart } = cartSlice.actions;
export default cartSlice.reducer;