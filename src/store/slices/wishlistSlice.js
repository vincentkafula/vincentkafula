import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState: {
    items: [],
    alreadyExists: false,
  },

  reducers: {
    addToWishList: (state, action) => {
      const exists = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (exists) {
        state.alreadyExists = true;
      } else {
        state.items.push(action.payload);
        state.alreadyExists = false;
      }
    },

    removeFromWishList: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      );
    },
  },
});

export const { addToWishList, removeFromWishList } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
