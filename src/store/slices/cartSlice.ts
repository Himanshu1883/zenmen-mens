// src/store/slices/cartSlice.ts
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
}

const initialState: CartState = {
  items: [],
  open: false,
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
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.open = action.payload;
    },
  },
});

export const { addItem, removeItem, updateQty, clearCart, setCartOpen } =
  cartSlice.actions;
export default cartSlice.reducer;
