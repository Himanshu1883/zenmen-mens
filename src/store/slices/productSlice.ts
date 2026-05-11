// src/store/slices/productSlice.ts
import type { Product } from "@/types/product";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/products", {
        next: { revalidate: 60 },
      } as RequestInit);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      // Handle both paginated { products: [...], total, pages, page } and direct array responses
      const products = Array.isArray(data) ? data : (data.products ?? []);
      return products as Product[];
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

interface ProductState {
  products: Product[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  loaded: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to load products";
      });
  },
});

export const { clearError } = productSlice.actions;
export default productSlice.reducer;
