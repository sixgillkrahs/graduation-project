import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./store";
import verifyOTPReducer from "./verify.store";

export const store = configureStore({
  reducer: {
    form: formReducer,
    verifyOTP: verifyOTPReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
