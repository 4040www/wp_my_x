"use client";
import React from "react";
import CommentsList from "@/components/CommentsList";
import CommentInput from "@/components/CommentInput";

export default function PostModal({
  modalPost,
  likedPosts,
  likeCounts,
  onClose,
  onLike,
  onRepost,
  repostedPosts,
  commentValue,
  setCommentValue,
  commentLoading,
  onSubmitComment,
}: {
  modalPost: Post;
  likedPosts: string[];
  likeCounts: Record<string, number>;
  onClose: () => void;
  onLike: (postId: string) => void;
  onRepost?: (postId: string) => void;
  repostedPosts?: string[];
  commentValue: (postId: string) => string;
  setCommentValue: (postId: string, v: string) => void;
  commentLoading: (postId: string) => boolean;
  onSubmitComment: (postId: string) => void;
}) {
  const isRepost = !!modalPost.repostOf;
  const basePost = modalPost.repostOf ?? modalPost;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] text-white p-6 rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-6 text-xl">
          ✕
        </button>

        <h3 className="text-lg font-bold mb-2">{basePost.title}</h3>
        <p className="text-[#90abcb] text-sm">{basePost.author?.name}</p>
        <p className="text-sm mb-4 max-w-2xl break-words whitespace-pre-wrap">
          {basePost.content}
        </p>
        <p className="text-[#90abcb] text-xs mt-1">
          {basePost.createdAt
            ? new Date(basePost.createdAt).toLocaleString()
            : ""}
        </p>

        {isRepost && modalPost.repostOf && (
          <p className="text-xs text-gray-400 mb-2">
            Reposted from {modalPost.repostOf.author?.name}
          </p>
        )}

        <div className="flex gap-6 mt-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onLike(modalPost.id)}
            className="flex items-center gap-1"
          >
            <img
              src={
                likedPosts.includes(modalPost.id)
                  ? "/icons/heart-fill.svg"
                  : "/icons/heart.svg"
              }
              alt="like"
              className="w-5 h-5"
            />
            <span className="text-sm">{likeCounts[modalPost.id] ?? modalPost.likeCount}</span>
          </button>

          <button
            onClick={() => onLike(modalPost.id)}
            className="flex items-center gap-1"
          >
            <img src="/icons/chat.svg" alt="comment" className="w-5 h-5" />
            <span className="text-sm">{modalPost.comments.length}</span>
          </button>

          {onRepost && !isRepost && (
            <button
              onClick={() => onRepost(modalPost.id)}
              className="flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={repostedPosts?.includes(modalPost.id)}
            >
              <img src="/icons/repost.svg" alt="repost" className="w-5 h-5" />
              <span className="text-sm">{modalPost.repostCount || 0}</span>
            </button>
          )}
        </div>

        <h4 className="text-md font-semibold mt-4 mb-2">Comments</h4>
        <CommentsList comments={modalPost.comments} />

        <div className="mt-2">
          <CommentInput
            postId={modalPost.id}
            value={commentValue(modalPost.id)}
            onChange={(v) => setCommentValue(modalPost.id, v)}
            onSubmit={() => onSubmitComment(modalPost.id)}
            disabled={commentLoading(modalPost.id)}
            autoFocus={true}
            showSubmitButton={true}
          />
        </div>
      </div>
    </div>
  );
}
