"use client";
import React from "react";

export default function CommentInput({
  postId,
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  postId: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      placeholder="Write a comment..."
      className="w-full p-2 rounded bg-gray-700 text-white text-sm"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSubmit()}
      disabled={!!disabled}
    />
  );
}
