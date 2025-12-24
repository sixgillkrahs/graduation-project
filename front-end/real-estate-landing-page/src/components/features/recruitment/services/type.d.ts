namespace IExtractService {
  export interface IRegistrationRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    agentName: string;
    area: string[];
    IDNumber: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    nationality: string;
  }
}
