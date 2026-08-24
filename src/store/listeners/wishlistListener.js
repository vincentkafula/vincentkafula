import { createListenerMiddleware } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { addToWishList, removeFromWishList } from "../slices/wishlistSlice";

export const wishlistListener = createListenerMiddleware();

wishlistListener.startListening({
  actionCreator: addToWishList,

  effect: async (action, listenerApi) => {
    const state = listenerApi.getState();
    const alreadyExists = state.wishlist.alreadyExists;

    if (alreadyExists) {
      toast.info("Already in wishlist");
    } else {
      toast.success(`${action.payload.title} added to wishlist`);
    }
  },
});

wishlistListener.startListening({
  actionCreator: removeFromWishList,
  effect: () => {
    toast.error("Removed from wishlist");
  },
});
