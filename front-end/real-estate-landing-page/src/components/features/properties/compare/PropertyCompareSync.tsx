"use client";

import { useEffect, useRef } from "react";
import { PROPERTY_COMPARE_STORAGE_KEY } from "./compare.types";
import { normalizeStoredCompareItems } from "./compare.utils";
import {
  usePropertyCompare,
  usePropertyCompareActions,
} from "./usePropertyCompare";

const PropertyCompareSync = () => {
  const initializedRef = useRef(false);
  const { items, hydrated } = usePropertyCompare();
  const { hydrate } = usePropertyCompareActions();

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    try {
      const raw = window.localStorage.getItem(PROPERTY_COMPARE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      hydrate(normalizeStoredCompareItems(parsed));
    } catch {
      hydrate([]);
    }
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      PROPERTY_COMPARE_STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [hydrated, items]);

  return null;
};

export default PropertyCompareSync;
