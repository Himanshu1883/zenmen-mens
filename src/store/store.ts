// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import currencyReducer from "./slices/currencySlice";
import productReducer from "./slices/productSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    currency: currencyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
