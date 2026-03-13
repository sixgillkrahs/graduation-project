import { useQuery } from "@tanstack/react-query";
import { LeadQueryKey } from "./config";
import LeadService from "./service";

export const useGetAgentLeads = () => {
  return useQuery({
    queryKey: [LeadQueryKey.agent],
    queryFn: () => LeadService.getAgentLeads(),
  });
};
