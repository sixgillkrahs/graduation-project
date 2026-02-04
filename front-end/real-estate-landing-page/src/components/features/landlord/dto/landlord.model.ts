export interface ILandlord {
  __id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateLandlordRequest = Omit<
  ILandlord,
  "__id" | "createdAt" | "updatedAt"
>;
