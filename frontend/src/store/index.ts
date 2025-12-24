import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import clientReducer from "./clientSlice";
import orderReducer from "./orderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    clients: clientReducer,
    orders: orderReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
