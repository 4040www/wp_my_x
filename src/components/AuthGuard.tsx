"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  redirectTo = "/login" 
}: AuthGuardProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(redirectTo);
    }
  }, [status, router, redirectTo]);

  // 載入中狀態
  if (status === "loading") {
    return (
      <div className="bg-[#101923] text-white font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-[#90abcb]">載入中...</p>
        </div>
      </div>
    );
  }

  // 未認證狀態
  if (status === "unauthenticated") {
    return null; // 重定向中，不渲染任何內容
  }

  // 已認證，渲染子組件
  return <>{children}</>;
}
