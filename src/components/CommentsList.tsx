"use client";
import React from "react";

export default function CommentsList({
  comments,
}: {
  comments: PostComment[];
}) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">還沒有留言，來搶沙發吧！</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="flex space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div 
            className="w-8 h-8 rounded-full bg-cover bg-center flex-shrink-0"
            style={{
              backgroundImage: `url("${c.author?.image || "/Avatar/sloth.svg"}")`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {c.author?.name ?? "Unknown"}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {c.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
