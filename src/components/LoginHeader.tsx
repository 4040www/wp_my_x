"use client";

import Link from "next/link";

export default function LoginHeader() {
  return (
    <header className="flex items-center justify-between border-b border-b-[#223449] px-6 py-4 bg-[#162232]">
      {/* Left: Logo + Title */}
      <Link href="/" className="flex items-center gap-3 text-white group">
        <div className="w-6 h-6 text-[#4ea1f3] group-hover:text-[#73b4ff] transition-colors">
          <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-wide group-hover:text-[#73b4ff] transition-colors">
          NTU X
        </h1>
      </Link>
    </header>
  );
}
