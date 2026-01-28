export interface ListingState {
  currentStep: number;
  data: {
    demandType: "SALE" | "RENT";
    propertyType: "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "STREET_HOUSE";
    projectName: string;
    // Add other fields as we implement more steps
    location?: any;
    features?: any;
    media?: any;
    description?: string;
  };
}
