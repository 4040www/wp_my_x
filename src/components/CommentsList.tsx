"use client";
import React from "react";

export default function CommentsList({
  comments,
}: {
  comments: PostComment[];
}) {
  if (!comments || comments.length === 0) {
    return <p className="text-xs text-gray-400">沒有留言</p>;
  }
  return (
    <>
      {comments.map((c) => (
        <div key={c.id} className="mb-2 border-b border-gray-600 pb-2">
          <p className="text-sm font-medium">{c.author?.name ?? "Unknown"}</p>
          <p className="text-xs text-gray-300">{c.content}</p>
        </div>
      ))}
    </>
  );
}
