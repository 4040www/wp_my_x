"use client";
import React from "react";
import PostActions from "@/components/PostActions";
import CommentInput from "@/components/CommentInput";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function PostCard({
  item,
  likedPosts,
  likeCounts,
  commentCounts,
  repostCounts,
  onOpenModal,
  onLike,
  onRepost,
  onOpenComments,
  repostDisabledForId,
  commentValue,
  setCommentValue,
  onSubmitComment,
}: {
  item: FeedItem;
  likedPosts: string[];
  likeCounts: Record<string, number>;
  commentCounts: Record<string, number>;
  repostCounts: Record<string, number>;
  onOpenModal: (postId: string) => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  repostDisabledForId: (postId: string) => boolean;
  commentValue: (postId: string) => string;
  setCommentValue: (postId: string, v: string) => void;
  onSubmitComment: (postId: string) => void;
}) {
  const post = item.post;
  const isRepost = item.type === "repost";
  const likedMain = likedPosts.includes(post.id);

  return (
    <div className="mb-8 cursor-pointer group" onClick={() => onOpenModal(post.id)}>
      <div className="flex gap-6 p-6 bg-gray-900/30 rounded-2xl border border-gray-800 hover:bg-gray-900/50 hover:border-gray-700 transition-all duration-200 hover:shadow-xl hover:shadow-gray-900/20">
        <div className="relative">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover w-14 h-14 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-blue-500 transition-all duration-200"
            style={{
              backgroundImage: `url("${
                post.author?.image || "/Avatar/sloth.svg"
              }")`,
            }}
          />
          {isRepost && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <img src="/icons/repost.svg" alt="repost" className="w-3 h-3 filter brightness-0 invert" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          {post.repostOf && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 rounded-full">
                <img src="/icons/repost.svg" alt="repost" className="w-3 h-3" />
                <span className="text-xs text-blue-400 font-medium">
                  {post.author?.name ?? "Someone"} reposted
                </span>
              </div>
            </div>
          )}

          <div
            className={
              isRepost
                ? "border-l-4 border-blue-500/50 pl-4 py-2 rounded-r-lg bg-gray-800/50"
                : ""
            }
          >
            {!post.repostOf && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {post.title}
                  </h3>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-[#90abcb] font-medium">
                    {post.author?.name ?? "Unknown"}
                  </span>
                </div>
                <div className="text-sm w-full text-gray-200 leading-relaxed">
                  <MarkdownRenderer content={post.content} />
                </div>
              </div>
            )}

            {post.repostOf && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {post.repostOf.title}
                  </h3>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-[#90abcb] font-medium">
                    {post.repostOf.author?.name ?? "Unknown"}
                  </span>
                </div>
                <div className="text-sm w-full text-gray-200 leading-relaxed">
                  <MarkdownRenderer content={post.repostOf.content} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{new Date(post.repostOf.createdAt as string).toLocaleString()}</span>
                </div>

                <PostActions
                  targetId={post.repostOf.id}
                  likeCount={
                    likeCounts[post.repostOf.id] ?? post.repostOf.likeCount
                  }
                  commentsCount={
                    commentCounts[post.repostOf.id] ??
                    post.repostOf.comments.length
                  }
                  repostCount={
                    repostCounts[post.repostOf.id] ?? 
                    post.repostOf?.repostCount ?? 
                    post.repostCount
                  }
                  liked={likedPosts.includes(post.repostOf.id)}
                  onLike={onLike}
                  onOpenComments={onOpenModal}
                  onRepost={onRepost}
                  showRepost={!repostDisabledForId(post.repostOf.id)}
                  repostDisabled={repostDisabledForId(post.repostOf.id)}
                />
              </div>
            )}
          </div>

          <PostActions
            targetId={post.id}
            likeCount={likeCounts[post.id] ?? post.likeCount}
            commentsCount={commentCounts[post.id] ?? post.comments.length}
            repostCount={
              repostCounts[post.id] ?? 
              post.repostOf?.repostCount ?? 
              post.repostCount
            }
            liked={likedMain}
            onLike={onLike}
            onOpenComments={onOpenModal}
            onRepost={!post.repostOf ? onRepost : undefined}
            showRepost={!post.repostOf}
            repostDisabled={repostDisabledForId(post.id)}
          />
        </div>
      </div>
    </div>
  );
}
