"use client";
import React from "react";

export default function CommentInput({
  postId,
  value,
  onChange,
  onSubmit,
  disabled,
  onFocus,
  autoFocus = false,
  showSubmitButton = false,
}: {
  postId: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  onFocus?: () => void;
  autoFocus?: boolean;
  showSubmitButton?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Write a comment..."
        className="flex-1 p-2 rounded bg-gray-700 text-white text-sm"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        onFocus={onFocus}
        disabled={!!disabled}
        autoFocus={autoFocus}
      />
      {showSubmitButton && (
        <button
          onClick={onSubmit}
          disabled={!value?.trim() || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          送出
        </button>
      )}
    </div>
  );
}
