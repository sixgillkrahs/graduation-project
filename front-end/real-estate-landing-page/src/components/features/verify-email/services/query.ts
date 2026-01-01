import { useQuery } from "@tanstack/react-query";
import { VerifyEmailQueryKey } from "./config";
import VerifyEmailService from "./service";
import { ParamValue } from "next/dist/server/request/params";

export const useVerifyEmail = (token: ParamValue) => {
    return useQuery({
        queryKey: [VerifyEmailQueryKey.verifyEmail, token],
        queryFn: () => VerifyEmailService.verifyEmail(token),
        enabled: !!token,
    });
};