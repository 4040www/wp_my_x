"use client";

import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { useInfiniteScrollPosts } from "@/hooks/usePaginatedPosts";
import { useSWRSearch } from "@/hooks/useSWRSearch";
import { usePostModal } from "@/hooks/usePostModal";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";
import { useState, useEffect } from "react";

import PostCard from "@/components/PostCard";
import PostModal from "@/components/PostModal";

export default function Home() {
  const { data: session } = useSession();
  const { 
    posts: feed, 
    isLoading: feedLoading, 
    isValidating,
    hasMore,
    loadMore,
    refetch 
  } = useInfiniteScrollPosts(session, 10);

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
  const [repostCounts, setRepostCounts] = useState<Record<string, number>>({});

  const {
    searchQuery,
    searchResults,
    hasSearched,
    isLoading: searchLoading,
    performSearch,
    clearSearch,
  } = useSWRSearch();

  const { selectedPostId, openPostModal, closePostModal } = usePostModal();

  // 初始化點讚和轉發狀態 - 只在首次載入時執行
  useEffect(() => {
    if (feed && session?.user?.id && feed.length > 0 && likedPosts.length === 0) {
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

      setLikedPosts(initialLikedPosts);
      setRepostedPosts(initialRepostedPosts);
      setLikeCounts(initialLikeCounts);
      setCommentCounts(initialCommentCounts);
    }
  }, [feed, session?.user?.id, likedPosts.length]); // 添加 likedPosts.length 作為條件

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
    
    // 保存原始狀態用於回滾
    const originalLikedPosts = [...likedPosts];
    const originalLikeCount = likeCounts[postId] || 0;
    
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
      const response = await fetch(`/api/posts/${postId}/like`, { 
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Like API error:", response.status, errorText);
        throw new Error(`Like request failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Like successful:", result);
    } catch (error) {
      // 如果失敗，回滾 UI 狀態
      setLikedPosts(originalLikedPosts);
      setLikeCounts((prev) => ({
        ...prev,
        [postId]: originalLikeCount,
      }));
      console.error("Like failed:", error);
    }
  };

  // 處理評論
  const handleComment = async (postId: string) => {
    const content = commentValues[postId];
    if (!content?.trim()) return;

    const currentCount = commentCounts[postId] || 0;
    
    // 保存原始狀態用於回滾
    const originalCommentCount = currentCount;

    // 樂觀更新 - 立即增加評論數
    setCommentCounts((prev) => ({ ...prev, [postId]: currentCount + 1 }));
    setCommentLoading((prev) => ({ ...prev, [postId]: true }));

    // 清空評論輸入
    setCommentValues((prev) => ({ ...prev, [postId]: "" }));

    try {
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Comment API error:", response.status, errorText);
        throw new Error(`Comment request failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Comment successful:", result);
    } catch (error) {
      // 如果失敗，回滾評論數
      setCommentCounts((prev) => ({ ...prev, [postId]: originalCommentCount }));
      // 恢復評論內容
      setCommentValues((prev) => ({ ...prev, [postId]: content }));
      console.error("Comment failed:", error);
    } finally {
      setCommentLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  // 處理轉發
  const handleRepost = async (postId: string) => {
    if (repostedPosts.includes(postId)) return;

    // 保存原始狀態用於回滾
    const originalRepostedPosts = [...repostedPosts];
    const currentRepostCount = repostCounts[postId] || 0;

    // 樂觀更新 - 立即添加轉發狀態和計數
    setRepostedPosts((prev) => [...prev, postId]);
    setRepostCounts((prev) => ({
      ...prev,
      [postId]: currentRepostCount + 1,
    }));

    try {
      const response = await fetch(`/api/posts/${postId}/repost`, { 
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Repost API error:", response.status, errorText);
        throw new Error(`Repost request failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Repost successful:", result);
    } catch (error) {
      // 如果失敗，回滾轉發狀態和計數
      setRepostedPosts(originalRepostedPosts);
      setRepostCounts((prev) => ({
        ...prev,
        [postId]: currentRepostCount,
      }));
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
      <div className="min-h-screen bg-[#101923] text-white font-sans">
        <Header
          onSearch={performSearch}
          searchQuery={searchQuery}
          onNotificationClick={openPostModal}
        />
        <main className="flex flex-col items-center px-4 py-6 max-w-4xl mx-auto min-h-[calc(100vh-120px)] bg-[#101923]">
          <div className="w-full max-w-2xl space-y-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                 {hasSearched
                   ? `Search Results${searchQuery ? ` for ${searchQuery}` : ""}`
                   : "Home"}
              </h2>
            </div>
            {hasSearched && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 text-[#90abcb] hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Clear Search
              </button>
            )}
          </div>

          {isLoading && (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="inline-flex items-center gap-3 text-white">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-lg font-medium">
                  {hasSearched ? "Searching..." : "Loading..."}
                </span>
              </div>
            </div>
          )}

          {!isLoading && displayData.length === 0 && hasSearched && (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="inline-flex flex-col items-center gap-4 p-8 bg-gray-900/50 rounded-2xl border border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-400">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {displayData.map((item: FeedItem, idx: number) => (
              <div key={`${item.type}-${item.post.id}-${item.createdAt}-${idx}`}>
                <PostCard
                  item={item}
                  likedPosts={likedPosts}
                  likeCounts={likeCounts}
                  commentCounts={commentCounts}
                  repostCounts={repostCounts}
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

          {/* 載入更多按鈕 */}
          {!hasSearched && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={isValidating}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isValidating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    載入中...
                  </div>
                ) : (
                  "載入更多"
                )}
              </button>
            </div>
          )}

          {/* 載入中指示器 */}
          {!hasSearched && isValidating && feed.length > 0 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-gray-900/50 rounded-full border border-gray-800">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-gray-400 text-sm font-medium">載入更多貼文...</span>
              </div>
            </div>
          )}

          {/* 沒有更多數據提示 */}
          {!hasSearched && !hasMore && feed.length > 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900/30 rounded-full border border-gray-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm font-medium">已載入所有貼文</span>
              </div>
            </div>
          )}

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
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl shadow-2xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-blue-500/25 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Post
      </Link>
      </div>
    </AuthGuard>
  );
}
