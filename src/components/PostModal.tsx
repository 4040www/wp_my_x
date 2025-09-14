"use client";
import React, { useEffect } from "react";
import CommentsList from "@/components/CommentsList";
import CommentInput from "@/components/CommentInput";
import MarkdownRenderer from "@/components/MarkdownRenderer";

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
  const isLiked = likedPosts.includes(modalPost.id);
  const isReposted = repostedPosts?.includes(modalPost.id);

  // 防止背景滾動
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 處理 ESC 鍵關閉
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full bg-cover bg-center"
              style={{
                backgroundImage: `url("${basePost.author?.image || "/Avatar/sloth.svg"}")`,
              }}
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {basePost.author?.name || "Unknown"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {basePost.createdAt
                  ? new Date(basePost.createdAt).toLocaleString()
                  : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          {/* Repost indicator */}
          {isRepost && modalPost.repostOf && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                Reposted from {modalPost.repostOf.author?.name}
              </span>
            </div>
          )}

          {/* Post title */}
          {basePost.title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {basePost.title}
            </h3>
          )}

          {/* Post content */}
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer content={basePost.content} />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Like button */}
              <button
                onClick={() => onLike(modalPost.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {likeCounts[modalPost.id] ?? modalPost.likeCount}
                </span>
              </button>

              {/* Comment button - 只是顯示，實際功能在下方輸入框 */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">{modalPost.comments.length}</span>
              </div>

              {/* Repost button */}
              {onRepost && !isRepost && (
                <button
                  onClick={() => onRepost(modalPost.id)}
                  disabled={isReposted}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                    isReposted
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-not-allowed'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{modalPost.repostCount || 0}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Comments ({modalPost.comments.length})
            </h4>
            
            {/* Comments list */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              <CommentsList comments={modalPost.comments} />
            </div>

            {/* Comment input */}
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
    </div>
  );
}
