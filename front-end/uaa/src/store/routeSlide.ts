import { createSlice } from "@reduxjs/toolkit";
import { type Location } from "react-router-dom";

interface RouterState {
  location: Location | null;
}

const initialState: RouterState = { location: null };

const routerSlice = createSlice({
  name: "router",
  initialState,
  reducers: {
    locationChanged(state, action) {
      state.location = action.payload;
    },
  },
});

export const { locationChanged } = routerSlice.actions;
export default routerSlice.reducer;
