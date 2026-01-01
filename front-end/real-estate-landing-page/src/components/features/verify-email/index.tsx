"use client";

import { Button, Icon, Input } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import Logo from "@/assets/Logo.svg";
import { useVerifyEmail } from "./services/query";

const VerifyEmail = () => {
  const router = useRouter();
  const { token } = useParams();
  const { data, isLoading, isError } = useVerifyEmail(token);

  const handleToHome = () => {
    router.push("/");
  };

  if (isError) {
    return <div>Error: {data?.message}</div>;
  }

  return (
    <div className="px-10 py-5 h-full">
      <div
        className="flex items-start gap-2 text-xl md:text-2xl font-semibold cursor-pointer mb-6"
        onClick={handleToHome}
      >
        <Image src={Logo} alt="logo" width={24} height={24} />
        <span className="text-black">Havenly</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">Verify Email</h2>
        <span className="cs-typography-gray text-sm!">
          Please set your password to activate your account.
        </span>
      </div>

      <div className="h-75">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <form className="grid gap-4">
            <Input
              label="Email Address"
              placeholder="john.doe@example.com"
              disabled
              suffix={<Icon.Mail className="main-color-gray w-5 h-5" />}
            />

            <Input
              label="Password"
              placeholder="Enter password"
              type="password"
              //   suffix={<Icon.Lock className="main-color-gray w-5 h-5" />}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              type="password"
              //   suffix={<Icon.Lock className="main-color-gray w-5 h-5" />}
            />

            <Button type="submit" className="w-full cs-bg-red text-white mt-2">
              Verify & Continue
            </Button>
          </form>
        )}
      </div>

      <div className="mt-4 text-center">
        <span className="cs-typography-gray text-sm!">
          Already verified?{" "}
          <Link href="/sign-in" className="text-red-500">
            Sign In
          </Link>
        </span>
      </div>
    </div>
  );
};

export default VerifyEmail;
