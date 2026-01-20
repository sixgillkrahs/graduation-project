import { Menu } from "@/models/menu.model";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: Menu = {
  info: [{
    title: "dashboard",
    href: "/agent/dashboard",
  }],
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setLabel: (state, action: PayloadAction<{ title: string, href: string }>) => {
      state.info = state.info.map((item) => ({
        ...item,
        active: item.title === action.payload.title && item.href === action.payload.href,
      }));
    },
  },
});

export const { setLabel } = menuSlice.actions;

export default menuSlice.reducer;
