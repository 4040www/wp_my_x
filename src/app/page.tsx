"use client";

import Header from "@/components/Header";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useSimplePosts } from "@/hooks/useSimpleSWR";
import { useSWRSearch } from "@/hooks/useSWRSearch";
import { usePostModal } from "@/hooks/usePostModal";
import { useState } from "react";

import PostCard from "@/components/PostCard";
import PostModal from "@/components/PostModal";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const { 
    feed, 
    isLoading: feedLoading, 
    refetch 
  } = useSimplePosts(session);

  // 狀態管理
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [commentValues, setCommentValues] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [repostedPosts, setRepostedPosts] = useState<string[]>([]);
  
  const { 
    searchQuery, 
    searchResults, 
    hasSearched, 
    isLoading: searchLoading, 
    performSearch, 
    clearSearch 
  } = useSWRSearch();
  
  const { selectedPostId, openPostModal, closePostModal } = usePostModal();

  // 處理點讚
  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.includes(postId);
    const newLikedPosts = isLiked 
      ? likedPosts.filter(id => id !== postId)
      : [...likedPosts, postId];
    
    // 樂觀更新 UI
    setLikedPosts(newLikedPosts);
    
    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      // 重新獲取數據以同步服務器狀態
      refetch();
    } catch (error) {
      // 如果失敗，回滾 UI 狀態
      setLikedPosts(likedPosts);
      console.error('Like failed:', error);
    }
  };

  // 處理評論
  const handleComment = async (postId: string) => {
    const content = commentValues[postId];
    if (!content?.trim()) return;

    setCommentLoading(prev => ({ ...prev, [postId]: true }));
    
    try {
      await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      // 清空評論輸入
      setCommentValues(prev => ({ ...prev, [postId]: '' }));
      // 重新獲取數據
      refetch();
    } catch (error) {
      console.error('Comment failed:', error);
    } finally {
      setCommentLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // 處理轉發
  const handleRepost = async (postId: string) => {
    if (repostedPosts.includes(postId)) return;
    
    try {
      await fetch(`/api/posts/${postId}/repost`, { method: 'POST' });
      setRepostedPosts(prev => [...prev, postId]);
      refetch();
    } catch (error) {
      console.error('Repost failed:', error);
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
                ? `Search Results${searchQuery ? ` for "${searchQuery}"` : ""}` 
                : session ? "Home" : "You are not logged in yet!"
              }
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
              No results found for "{searchQuery}"
            </div>
          )}

          {displayData.map((item: any, idx: number) => (
            <div key={`${item.type}-${item.post.id}-${item.createdAt}-${idx}`}>
              <PostCard
                item={item}
                likedPosts={likedPosts}
                onOpenModal={openPostModal}
                onLike={handleLike}
                onRepost={handleRepost}
                onOpenComments={openPostModal}
                repostDisabledForId={(id) => repostedPosts.includes(id)}
                commentValue={(id) => commentValues[id] || ""}
                setCommentValue={(id, v) => setCommentValues(prev => ({ ...prev, [id]: v }))}
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
          onClose={closePostModal}
          onLike={handleLike}
          onRepost={handleRepost}
          repostedPosts={repostedPosts}
          commentValue={(id) => commentValues[id] || ""}
          setCommentValue={(id, v) => setCommentValues(prev => ({ ...prev, [id]: v }))}
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
  );
}
