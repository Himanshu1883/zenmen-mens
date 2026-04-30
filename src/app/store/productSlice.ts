import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const res = await fetch("/api/products", {
      cache: "no-store",
    });

    // console.log(res);

    if (!res.ok) throw new Error("Failed to fetch");

    return res.json();
  },
);

interface ProductState {
  products: any[];
  loading: boolean;
  loaded: boolean;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  loaded: false,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
        state.loaded = true; // 🔥 important
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
