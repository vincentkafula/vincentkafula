import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [], // 👈 matches: state.cart.cart
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;

      const exists = state.cart.find((p) => p.id === item.id);

      if (exists) {
        exists.qty += item.qty || 1;
      } else {
        state.cart.push({ ...item, qty: item.qty || 1 });
      }
    },

    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },

    increment: (state, action) => {
      const item = state.cart.find((p) => p.id === action.payload);
      if (item) item.qty += 1;
    },

    decrement: (state, action) => {
      const item = state.cart.find((p) => p.id === action.payload);
      if (item && item.qty > 1) item.qty -= 1;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increment,
  decrement,
} = cartSlice.actions;

export default cartSlice.reducer;
