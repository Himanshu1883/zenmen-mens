import type { CurrencyCode } from "@/lib/currency";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CurrencyState {
  code: CurrencyCode;
}

const initialState: CurrencyState = {
  code: "INR",
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<CurrencyCode>) {
      state.code = action.payload;
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
