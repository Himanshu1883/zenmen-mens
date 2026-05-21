// src/store/slices/cartSlice.ts
import { clearCartStorage } from "@/lib/cart-storage";
import type { ProductImage } from "@/types/product";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  _id: string;
  title: string;
  slug: string;
  price: number;
  image: ProductImage;
  selectedColor?: string;
  selectedSize?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  open: boolean;
  hydrated: boolean;
}

const initialState: CartState = {
  items: [],
  open: false,
  hydrated: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) =>
          i._id === action.payload._id &&
          i.selectedColor === action.payload.selectedColor &&
          i.selectedSize === action.payload.selectedSize,
      );
      if (existing) {
        existing.qty += action.payload.qty;
      } else {
        state.items.push(action.payload);
      }
      state.open = true;
    },
    removeItem(
      state,
      action: PayloadAction<{
        _id: string;
        selectedColor?: string;
        selectedSize?: string;
      }>,
    ) {
      state.items = state.items.filter(
        (i) =>
          !(
            i._id === action.payload._id &&
            i.selectedColor === action.payload.selectedColor &&
            i.selectedSize === action.payload.selectedSize
          ),
      );
    },
    updateQty(
      state,
      action: PayloadAction<{
        _id: string;
        selectedColor?: string;
        selectedSize?: string;
        qty: number;
      }>,
    ) {
      const item = state.items.find(
        (i) =>
          i._id === action.payload._id &&
          i.selectedColor === action.payload.selectedColor &&
          i.selectedSize === action.payload.selectedSize,
      );
      if (item) {
        item.qty = Math.max(1, action.payload.qty);
      }
    },
    clearCart(state) {
      state.items = [];
      clearCartStorage();
    },
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    setCartHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.open = action.payload;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQty,
  clearCart,
  setCartItems,
  setCartHydrated,
  setCartOpen,
} = cartSlice.actions;
export default cartSlice.reducer;
