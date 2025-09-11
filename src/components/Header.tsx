"use client";

import Link from "next/link";
import Image from "next/image";
import { Popover } from "@headlessui/react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onNotificationClick?: (postId: string) => void;
}

export default function Header({ onSearch, searchQuery = "", onNotificationClick }: HeaderProps) {
  const { data: session } = useSession();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const { notifications, unreadCount } = useRealtimeNotifications(session);
  
  // 標記所有通知為已讀
  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter((n: { read: boolean; id: string }) => !n.read)
      .map((n: { id: string }) => n.id);
    if (unreadIds.length > 0) {
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-b-[#223449] px-6 py-4 bg-[#162232]">
      {/* Left: Logo + Title */}
      <Link href="/" className="flex items-center gap-3 text-white group">
        <div className="w-6 h-6 text-[#4ea1f3] group-hover:text-[#73b4ff] transition-colors">
          <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-wide group-hover:text-[#73b4ff] transition-colors">
          MY X
        </h1>
      </Link>

      {/* Right side */}
      <div className="flex flex-1 justify-end gap-6 items-center text-sm font-medium text-white">

        {/* Search */}
        <div className="flex items-center bg-[#223449] rounded-lg px-3 py-2 gap-2 w-56 focus-within:ring-2 focus-within:ring-[#4ea1f3] transition">
          <Image src="/icons/search.svg" width={20} height={20} alt="search" />
          <input
            type="text"
            placeholder="Search posts or authors..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSearch) {
                onSearch(localSearchQuery);
              }
            }}
            className="bg-transparent outline-none placeholder:text-[#90abcb] text-white w-full"
          />
          {localSearchQuery && (
            <button
              onClick={() => {
                setLocalSearchQuery("");
                if (onSearch) onSearch("");
              }}
              className="text-[#90abcb] hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        
        {/* Notifications */}
        <Popover className="relative">
          <Popover.Button className="px-3 py-2 rounded-lg hover:bg-[#2a3b52] transition relative">
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Popover.Button>
          <Popover.Panel className="absolute right-0 mt-2 w-80 rounded-xl bg-[#223449] p-4 shadow-lg text-white max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-lg">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#4ea1f3] hover:text-[#73b4ff] transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-[#90abcb] text-sm text-center py-4">No notifications yet</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {notifications.map((notification: { 
                  id: string; 
                  read: boolean; 
                  content: string; 
                  createdAt: string; 
                  sender: { image?: string }; 
                  comment?: { content: string }; 
                  post: { id: string } 
                }) => (
                  <li
                    key={notification.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      notification.read 
                        ? "hover:bg-[#2a3b52]" 
                        : "bg-[#2a3b52] hover:bg-[#3a4b62] border-l-2 border-[#4ea1f3]"
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        fetch('/api/notifications', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ notificationIds: [notification.id] }),
                        });
                      }
                      if (onNotificationClick) {
                        onNotificationClick(notification.post.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-center bg-no-repeat bg-cover flex-shrink-0"
                           style={{
                             backgroundImage: `url("${notification.sender.image || "/Avatar/sloth.svg"}")`
                           }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white">{notification.content}</p>
                        <p className="text-[#90abcb] text-xs mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {notification.comment && (
                          <p className="text-[#90abcb] text-xs mt-1 italic">
                            &ldquo;{notification.comment.content}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Popover.Panel>
        </Popover>
        
        {/* Avatar / Profile menu */}
        <Popover className="relative">
          <Popover.Button className="rounded-full w-11 h-11 overflow-hidden border-2 border-transparent hover:border-[#4ea1f3] transition">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover w-full h-full"
              style={{
                backgroundImage: `url("${
                  session?.user?.image || "/Avatar/sloth.svg"
                }")`,
              }}
            />
          </Popover.Button>
          <Popover.Panel className="absolute right-0 mt-2 w-64 rounded-xl bg-[#223449] p-4 shadow-lg text-white">
            {session ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 pb-3 border-b border-[#2a3b52]">
                  <img
                    src={session.user?.image || "/Avatar/sloth.svg"}
                    alt="avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-bold">{session.user?.name}</p>
                    <p className="text-xs text-gray-300">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 hover:bg-red-600 rounded px-3 py-2 text-sm transition"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  rel="icon"
                  href="/login"
                  className="bg-[#2d89ef] hover:bg-[#3d9dff] rounded px-3 py-2 text-sm transition text-center"
                >
                  Sign in
                </Link>
                <button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="bg-[#444] hover:bg-[#555] rounded px-3 py-2 text-sm transition"
                >
                  Sign in with Google
                </button>
                <button
                  onClick={() => signIn("github", { callbackUrl: "/" })}
                  className="bg-[#444] hover:bg-[#555] rounded px-3 py-2 text-sm transition"
                >
                  Sign in with GitHub
                </button>
              </div>
            )}
          </Popover.Panel>
        </Popover>
      </div>
    </header>
  );
}
