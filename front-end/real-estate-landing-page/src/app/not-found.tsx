import Link from "next/link";
import { CsButton } from "@/components/custom";
import { ROUTES } from "@/const/routes";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-9xl font-black text-gray-200">404</h1>
      <div className="absolute flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Oops! The page you are looking for does not exist or you do not have
          permission to access it.
        </p>
        <Link href={ROUTES.HOME}>
          <CsButton>Back to Home</CsButton>
        </Link>
      </div>
    </div>
  );
}
