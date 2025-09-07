"use client";

import LoginHeader from "@/components/LoginHeader";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();

  // 如果已經登入，導向首頁
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div
      className="relative flex min-h-screen flex-col bg-[#101923] overflow-x-hidden"
      style={{ fontFamily: `"Spline Sans", "Noto Sans", sans-serif` }}
    >
      <div className="flex h-full grow flex-col layout-container">
        {/* Header */}
        <LoginHeader />
        {/* Sign-in content */}
        <div className="flex flex-1 justify-center px-40 py-5">
          <div className="flex flex-col items-center max-w-[420px] py-5 flex-1 layout-content-container gap-8">
            <h2 className="text-white text-[28px] font-bold tracking-light leading-tight text-center pb-3 pt-5 px-4">
              Sign in to NTU X
            </h2>
            {/* Sign in buttons */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-4 rounded-lg h-10 px-4 bg-[#223449] text-white text-sm font-bold"
            >
              <Image
                src="/icons/google-icon.png"
                width={16}
                height={16}
                alt="Google"
              />
              <span>Sign in with Google</span>
            </button>
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-4 rounded-lg h-10 px-4 bg-[#223449] text-white text-sm font-bold"
            >
              <Image
                src="/icons/github-icon.png"
                width={16}
                height={16}
                alt="GitHub"
              />
              <span>Sign in with GitHub</span>
            </button>
            <p className="text-[#90abcb] text-sm font-normal leading-normal text-center underline pb-3 pt-1 px-4">
              Don&apos;t have an account? Sign up
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
