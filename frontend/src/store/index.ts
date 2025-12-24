import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import clientReducer from "./clientSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    clients: clientReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
