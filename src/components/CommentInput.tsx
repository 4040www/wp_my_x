"use client";
import React, { useState } from "react";

export default function CommentInput({
  // postId,
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
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <div className={`flex items-end space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 ${
        isFocused 
          ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
        <div className="flex-1">
          <textarea
            placeholder="寫下你的想法..."
            className="w-full resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-relaxed focus:outline-none"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onSubmit();
              }
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={!!disabled}
            autoFocus={autoFocus}
            rows={1}
            style={{
              minHeight: '20px',
              maxHeight: '120px',
              height: 'auto',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
        </div>
        
        {showSubmitButton && (
          <button
            onClick={onSubmit}
            disabled={!value?.trim() || disabled}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              value?.trim() && !disabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {disabled ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>送出中...</span>
              </div>
            ) : (
              '送出'
            )}
          </button>
        )}
      </div>
      
      {showSubmitButton && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          按 Ctrl+Enter 快速送出
        </p>
      )}
    </div>
  );
}
