"use client";

import { createContext, type ReactNode, useContext } from "react";

interface ListingDraftContextValue {
  saveDraft: () => Promise<void>;
  isSavingDraft: boolean;
}

const ListingDraftContext = createContext<ListingDraftContextValue | null>(
  null,
);

export const ListingDraftProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: ListingDraftContextValue;
}) => {
  return (
    <ListingDraftContext.Provider value={value}>
      {children}
    </ListingDraftContext.Provider>
  );
};

export const useListingDraft = () => {
  const context = useContext(ListingDraftContext);

  if (!context) {
    throw new Error("useListingDraft must be used within ListingDraftProvider");
  }

  return context;
};
