"use client";

import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { useSimplePosts } from "@/hooks/useSimpleSWR";
import { useSWRSearch } from "@/hooks/useSWRSearch";
import { usePostModal } from "@/hooks/usePostModal";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";
import { useState, useEffect } from "react";

import PostCard from "@/components/PostCard";
import PostModal from "@/components/PostModal";

export default function Home() {
  const { data: session } = useSession();
  const { feed, isLoading: feedLoading, refetch } = useSimplePosts(session);

  // 狀態管理
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentValues, setCommentValues] = useState<Record<string, string>>(
    {},
  );
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [repostedPosts, setRepostedPosts] = useState<string[]>([]);

  const {
    searchQuery,
    searchResults,
    hasSearched,
    isLoading: searchLoading,
    performSearch,
    clearSearch,
  } = useSWRSearch();

  const { selectedPostId, openPostModal, closePostModal } = usePostModal();

  // 初始化點讚和轉發狀態
  useEffect(() => {
    if (feed && session?.user?.id && feed.length > 0) {
      const currentUserId = session.user.id;
      const initialLikedPosts: string[] = [];
      const initialRepostedPosts: string[] = [];
      const initialLikeCounts: Record<string, number> = {};
      const initialCommentCounts: Record<string, number> = {};

      feed.forEach((item: { post: { 
        id: string; 
        likes?: { userId: string }[]; 
        likeCount?: number; 
        comments?: { id: string; content: string }[]; 
        reposts?: { authorId: string }[]; 
        repostOf?: { 
          id: string; 
          likes?: { userId: string }[]; 
          likeCount?: number; 
          comments?: { id: string; content: string }[] 
        } 
      } }) => {
        const post = item.post;

        // 檢查主帖子的點讚狀態
        if (post.likes?.some((like: { userId: string }) => like.userId === currentUserId)) {
          initialLikedPosts.push(post.id);
        }
        initialLikeCounts[post.id] = post.likeCount || 0;
        initialCommentCounts[post.id] = post.comments?.length || 0;

        // 檢查轉發狀態
        if (
          post.reposts?.some((repost: { authorId: string }) => repost.authorId === currentUserId)
        ) {
          initialRepostedPosts.push(post.id);
        }

        // 檢查轉發帖子的狀態
        if (post.repostOf) {
          if (
            post.repostOf.likes?.some(
              (like: { userId: string }) => like.userId === currentUserId,
            )
          ) {
            initialLikedPosts.push(post.repostOf.id);
          }
          initialLikeCounts[post.repostOf.id] = post.repostOf.likeCount || 0;
          initialCommentCounts[post.repostOf.id] =
            post.repostOf.comments?.length || 0;
        }
      });

      // 只在狀態真正改變時才更新
      setLikedPosts((prev) => {
        const newSet = new Set(initialLikedPosts);
        const prevSet = new Set(prev);
        if (
          newSet.size !== prevSet.size ||
          !initialLikedPosts.every((id) => prevSet.has(id))
        ) {
          return initialLikedPosts;
        }
        return prev;
      });

      setRepostedPosts((prev) => {
        const newSet = new Set(initialRepostedPosts);
        const prevSet = new Set(prev);
        if (
          newSet.size !== prevSet.size ||
          !initialRepostedPosts.every((id) => prevSet.has(id))
        ) {
          return initialRepostedPosts;
        }
        return prev;
      });

      setLikeCounts((prev) => {
        const hasChanged = Object.keys(initialLikeCounts).some(
          (key) => prev[key] !== initialLikeCounts[key],
        );
        return hasChanged ? initialLikeCounts : prev;
      });

      setCommentCounts((prev) => {
        const hasChanged = Object.keys(initialCommentCounts).some(
          (key) => prev[key] !== initialCommentCounts[key],
        );
        return hasChanged ? initialCommentCounts : prev;
      });
    }
  }, [feed, session?.user?.id]); // 依賴於 feed 和用戶 ID

  // 获取所有帖子的ID用于实时订阅
  const postIds =
    feed
      ?.map((item: { post: { id: string; repostOf?: { id: string } } }) => {
        const ids = [item.post.id];
        if (item.post.repostOf) {
          ids.push(item.post.repostOf.id);
        }
        return ids;
      })
      .flat() || [];

  // 实时更新处理函数
  const handleRealtimeUpdate = (data: { 
    postId: string; 
    likeCount: number; 
    commentCount: number; 
    repostCount: number; 
    liked?: boolean; 
    userId: string 
  }) => {
    const { postId, likeCount, commentCount, liked, userId } =
      data;

    // 如果是当前用户的操作，跳过（避免重复更新）
    if (userId === session?.user?.id) return;

    // 更新点赞数
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: likeCount,
    }));

    // 更新评论数
    setCommentCounts((prev) => ({
      ...prev,
      [postId]: commentCount,
    }));

    // 如果有新的点赞状态，更新点赞列表
    if (liked !== undefined) {
      setLikedPosts((prev) => {
        if (liked && !prev.includes(postId)) {
          return [...prev, postId];
        } else if (!liked && prev.includes(postId)) {
          return prev.filter((id) => id !== postId);
        }
        return prev;
      });
    }
  };

  // 订阅实时更新
  useRealtimePosts(postIds, handleRealtimeUpdate);

  // 處理點讚
  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.includes(postId);
    const currentCount = likeCounts[postId] || 0;
    const newLikedPosts = isLiked
      ? likedPosts.filter((id) => id !== postId)
      : [...likedPosts, postId];

    // 樂觀更新 UI - 點讚狀態和數字
    setLikedPosts(newLikedPosts);
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: isLiked ? currentCount - 1 : currentCount + 1,
    }));

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      // 重新獲取數據以同步服務器狀態
      refetch();
    } catch (error) {
      // 如果失敗，回滾 UI 狀態
      setLikedPosts(likedPosts);
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: currentCount,
      }));
      console.error("Like failed:", error);
    }
  };

  // 處理評論
  const handleComment = async (postId: string) => {
    const content = commentValues[postId];
    if (!content?.trim()) return;

    const currentCount = commentCounts[postId] || 0;

    // 樂觀更新 - 立即增加評論數
    setCommentCounts((prev) => ({ ...prev, [postId]: currentCount + 1 }));
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));

    // 清空評論輸入
    setCommentValues((prev) => ({ ...prev, [postId]: "" }));

    try {
      await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      // 重新獲取數據以同步服務器狀態
      refetch();
    } catch (error) {
      // 如果失敗，回滾評論數
      setCommentCounts((prev) => ({ ...prev, [postId]: currentCount }));
      console.error("Comment failed:", error);
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // 處理轉發
  const handleRepost = async (postId: string) => {
    if (repostedPosts.includes(postId)) return;

    try {
      await fetch(`/api/posts/${postId}/repost`, { method: "POST" });
      setRepostedPosts((prev) => [...prev, postId]);
      refetch();
    } catch (error) {
      console.error("Repost failed:", error);
    }
  };

  function getPostById(targetId: string | null) {
    if (!targetId) return null;
    for (const item of feed) {
      if (item.post.id === targetId) return item.post;
      if (item.post.repostOf?.id === targetId) return item.post.repostOf;
    }
    return null;
  }

  const modalPost = getPostById(selectedPostId);

  // 决定显示哪个数据源
  const displayData = hasSearched ? searchResults : feed;
  const isLoading = hasSearched ? searchLoading : feedLoading;

  return (
    <AuthGuard>
      <div className="bg-[#101923] text-white font-sans">
        <Header
          onSearch={performSearch}
          searchQuery={searchQuery}
          onNotificationClick={openPostModal}
        />
        <main className="flex flex-col items-center px-10 py-5 max-w-screen overflow-y-scroll scrollbar-none">
        <div className="h-[calc(100vh-120px)] w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
               {hasSearched
                 ? `Search Results${searchQuery ? ` for &ldquo;${searchQuery}&rdquo;` : ""}`
                 : "Home"}
            </h2>
            {hasSearched && (
              <button
                onClick={clearSearch}
                className="text-[#90abcb] hover:text-white transition-colors text-sm"
              >
                Clear Search
              </button>
            )}
          </div>

          {isLoading && (
            <div className="text-center py-8 text-[#90abcb]">
              {hasSearched ? "Searching..." : "Loading..."}
            </div>
          )}

          {!isLoading && displayData.length === 0 && hasSearched && (
            <div className="text-center py-8 text-[#90abcb]">
              No results found for &ldquo;{searchQuery}&rdquo;
            </div>
          )}

          {displayData.map((item: FeedItem, idx: number) => (
            <div key={`${item.type}-${item.post.id}-${item.createdAt}-${idx}`}>
              <PostCard
                item={item}
                likedPosts={likedPosts}
                likeCounts={likeCounts}
                commentCounts={commentCounts}
                onOpenModal={openPostModal}
                onLike={handleLike}
                onRepost={handleRepost}
                onOpenComments={openPostModal}
                repostDisabledForId={(id) => repostedPosts.includes(id)}
                commentValue={(id) => commentValues[id] || ""}
                setCommentValue={(id, v) =>
                  setCommentValues((prev) => ({ ...prev, [id]: v }))
                }
                commentLoading={(id) => commentLoading[id] || false}
                onSubmitComment={handleComment}
              />
            </div>
          ))}
        </div>
      </main>

      {modalPost && (
        <PostModal
          modalPost={modalPost}
          likedPosts={likedPosts}
          likeCounts={likeCounts}
          onClose={closePostModal}
          onLike={handleLike}
          onRepost={handleRepost}
          repostedPosts={repostedPosts}
          commentValue={(id) => commentValues[id] || ""}
          setCommentValue={(id, v) =>
            setCommentValues((prev) => ({ ...prev, [id]: v }))
          }
          commentLoading={(id) => commentLoading[id] || false}
          onSubmitComment={handleComment}
        />
      )}

      <Link
        href="/posts/new"
        className="fixed bottom-6 right-6 bg-white hover:bg-blue-700 text-black px-5 py-3 rounded-full shadow-lg font-semibold transition"
      >
        + New Post
      </Link>
      </div>
    </AuthGuard>
  );
}
