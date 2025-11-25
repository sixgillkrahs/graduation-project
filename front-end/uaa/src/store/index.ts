import routerReducer from "./routeSlide";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    router: routerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
