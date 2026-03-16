"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PROPERTY_RECENTLY_VIEWED_STORAGE_KEY,
  type RecentlyViewedProperty,
} from "./recently-viewed.types";
import {
  normalizeRecentlyViewedProperties,
  upsertRecentlyViewedProperty,
} from "./recently-viewed.utils";

export const useRecentlyViewedProperties = (currentPropertyId?: string) => {
  const [items, setItems] = useState<RecentlyViewedProperty[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
        PROPERTY_RECENTLY_VIEWED_STORAGE_KEY,
      );
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(normalizeRecentlyViewedProperties(parsed));
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      PROPERTY_RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [hydrated, items]);

  const visibleItems = useMemo(() => {
    if (!currentPropertyId) {
      return items;
    }

    return items.filter((item) => item.id !== currentPropertyId);
  }, [currentPropertyId, items]);

  const trackProperty = useCallback((item: RecentlyViewedProperty) => {
    setItems((prev) =>
      upsertRecentlyViewedProperty({
        items: prev,
        item,
      }),
    );
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items: visibleItems,
    hydrated,
    trackProperty,
    clearAll,
  };
};
