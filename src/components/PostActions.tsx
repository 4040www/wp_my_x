"use client";
import React from "react";

export default function PostActions({
  targetId,
  likeCount,
  commentsCount,
  repostCount,
  liked,
  onLike,
  onOpenComments,
  onRepost,
  showRepost = true,
  repostDisabled = false,
}: {
  targetId: string;
  likeCount: number;
  commentsCount: number;
  repostCount?: number;
  liked: boolean;
  onLike: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onRepost?: (postId: string) => void;
  showRepost?: boolean;
  repostDisabled?: boolean;
}) {
  return (
    <div className="flex gap-6 mt-3" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onLike(targetId)}
        className="flex items-center gap-1 hover:text-gray-400 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
      >
        <img
          src={liked ? "/icons/heart-fill.svg" : "/icons/heart.svg"}
          alt="like"
          className="w-5 h-5"
        />
        <span className="text-sm text-white">{likeCount ?? 0}</span>
      </button>

      <button
        onClick={() => onOpenComments(targetId)}
        className="flex items-center gap-1 hover:text-gray-400 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
      >
        <img src="/icons/chat.svg" alt="comment" className="w-5 h-5" />
        <span className="text-sm text-white">{commentsCount ?? 0}</span>
      </button>

      {showRepost && onRepost && (
        <button
          onClick={() => onRepost(targetId)}
          className={`flex items-center gap-1 hover:text-gray-400 hover:bg-gray-700 px-2 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
          disabled={repostDisabled}
          title={repostDisabled ? "Already reposted" : "Repost"}
        >
          <img
            src="/icons/repost.svg"
            alt="repost"
            className={`w-5 h-5 ${
              repostDisabled
                ? "filter brightness-0 saturate-100 invert sepia-100 saturate-1000 hue-rotate-90"
                : ""
            }`}
          />
          <span className="text-sm text-white">{repostCount ?? 0}</span>
        </button>
      )}
    </div>
  );
}
