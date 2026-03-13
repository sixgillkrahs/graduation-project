"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { RootState } from "@/store";
import {
  addCompareItem,
  clearCompareItems,
  hydrateCompareItems,
  removeCompareItem,
} from "@/store/property-compare.store";
import type { PropertyCompareItem } from "./compare.types";

const selectPropertyCompare = (state: RootState) => state.propertyCompare;

export const usePropertyCompare = () => {
  return useAppSelector(selectPropertyCompare);
};

export const usePropertyCompareActions = () => {
  const dispatch = useAppDispatch();

  return {
    hydrate: (items: PropertyCompareItem[]) =>
      dispatch(hydrateCompareItems(items)),
    addItem: (item: PropertyCompareItem) => dispatch(addCompareItem(item)),
    removeItem: (id: string) => dispatch(removeCompareItem(id)),
    clearItems: () => dispatch(clearCompareItems()),
  };
};
