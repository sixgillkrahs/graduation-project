import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  PROPERTY_COMPARE_MAX_ITEMS,
  type PropertyCompareItem,
} from "@/components/features/properties/compare/compare.types";

interface PropertyCompareState {
  items: PropertyCompareItem[];
  hydrated: boolean;
}

const initialState: PropertyCompareState = {
  items: [],
  hydrated: false,
};

const propertyCompareSlice = createSlice({
  name: "propertyCompare",
  initialState,
  reducers: {
    hydrateCompareItems: (
      state,
      action: PayloadAction<PropertyCompareItem[]>,
    ) => {
      state.items = action.payload.slice(0, PROPERTY_COMPARE_MAX_ITEMS);
      state.hydrated = true;
    },
    addCompareItem: (state, action: PayloadAction<PropertyCompareItem>) => {
      const nextItem = action.payload;
      const currentIndex = state.items.findIndex(
        (item) => item.id === nextItem.id,
      );

      if (currentIndex >= 0) {
        state.items[currentIndex] = nextItem;
        return;
      }

      if (state.items.length >= PROPERTY_COMPARE_MAX_ITEMS) {
        return;
      }

      state.items.push(nextItem);
    },
    removeCompareItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearCompareItems: (state) => {
      state.items = [];
    },
  },
});

export const {
  hydrateCompareItems,
  addCompareItem,
  removeCompareItem,
  clearCompareItems,
} = propertyCompareSlice.actions;

export default propertyCompareSlice.reducer;
