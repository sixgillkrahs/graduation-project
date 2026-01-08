import { Menu } from "@/models/menu.model";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

const initialState: Menu = {
  label: "dashboard",
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setLabel: (state, action: PayloadAction<string>) => {
      state.label = action.payload;
    },
  },
});

export const { setLabel } = menuSlice.actions;

export default menuSlice.reducer;
