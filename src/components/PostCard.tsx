"use client";
import React from "react";
import PostActions from "@/components/PostActions";
import CommentInput from "@/components/CommentInput";

export default function PostCard({
  item,
  likedPosts,
  likeCounts,
  commentCounts,
  onOpenModal,
  onLike,
  onRepost,
  onOpenComments,
  repostDisabledForId,
  commentValue,
  setCommentValue,
  commentLoading,
  onSubmitComment,
}: {
  item: FeedItem;
  likedPosts: string[];
  likeCounts: Record<string, number>;
  commentCounts: Record<string, number>;
  onOpenModal: (postId: string) => void;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  repostDisabledForId: (postId: string) => boolean;
  commentValue: (postId: string) => string;
  setCommentValue: (postId: string, v: string) => void;
  commentLoading: (postId: string) => boolean;
  onSubmitComment: (postId: string) => void;
}) {
  const post = item.post;
  const isRepost = item.type === "repost";
  const likedMain = likedPosts.includes(post.id);

  return (
    <div className="mb-12 cursor-pointer" onClick={() => onOpenModal(post.id)}>
      <div className="flex gap-8">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover w-12 h-12 rounded-full object-cover"
          style={{
            backgroundImage: `url("${
              post.author?.image || "/Avatar/sloth.svg"
            }")`,
          }}
        />
        <div className="flex flex-col gap-2 w-full">
          {post.repostOf && (
            <p className="flex flex-row gap-1 text-xs text-[#90abcb]">
              {post.author?.name ?? "Someone"} reposted
              <img src="/icons/repost.svg" alt="repost" className="w-3 h-3" />
            </p>
          )}

          <div
            className={
              isRepost
                ? "border-l-2 border-gray-500 p-3 ml-1 rounded-md bg-gray-800"
                : ""
            }
          >
            {!post.repostOf && (
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="mt-2 text-[#90abcb] text-xs">
                  {post.author?.name ?? "Unknown"}
                </p>
                <p className="mt-2 text-sm max-w-2xl break-words whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
            )}

            {post.repostOf && (
              <div>
                <p className="font-medium">{post.repostOf.title}</p>
                <p className="mt-2 text-[#90abcb] text-sm">
                  {post.repostOf.author?.name ?? "Unknown"}
                </p>
                <p className="mt-2 text-sm max-w-2xl break-words whitespace-pre-wrap">
                  {post.repostOf.content}
                </p>
                <p className="text-[#90abcb] text-xs mt-1">
                  {new Date(post.repostOf.createdAt as any).toLocaleString()}
                </p>

                <PostActions
                  targetId={post.repostOf.id}
                  likeCount={likeCounts[post.repostOf.id] ?? post.repostOf.likeCount}
                  commentsCount={commentCounts[post.repostOf.id] ?? post.repostOf.comments.length}
                  repostCount={post.repostOf?.repostCount ?? post.repostCount}
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
            repostCount={post.repostOf?.repostCount ?? post.repostCount}
            liked={likedMain}
            onLike={onLike}
            onOpenComments={onOpenModal}
            onRepost={!post.repostOf ? onRepost : undefined}
            showRepost={!post.repostOf}
            repostDisabled={repostDisabledForId(post.id)}
          />

          <div className="mt-2">
            <CommentInput
              postId={post.id}
              value={commentValue(post.id)}
              onChange={(v) => setCommentValue(post.id, v)}
              onSubmit={() => onSubmitComment(post.id)}
              disabled={commentLoading(post.id)}
              onFocus={() => onOpenComments(post.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
