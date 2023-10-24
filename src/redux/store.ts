import { configureStore } from "@reduxjs/toolkit";
import customReducer from "./features/userSlice";
import authReducer from "./features/auth/authSlice/auth";

export const store = configureStore({
  reducer: {
    // user: customReducer
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
