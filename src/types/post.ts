interface Post {
  id: string;
  title?: string;
  content: string;
  likeCount: number;
  comments: PostComment[];
  reposts: Post[];
  repostCount?: number;
  repostOf?: Post;
  author?: User;
  createdAt?: string;
}

interface PostComment {
  id: string;
  content: string;
  author: User;
  createdAt?: string;
}

interface FeedItem {
  type: "post" | "repost";
  createdAt: string;
  post: Post;
  repostedBy?: User;
}

interface PostUpdateData {
  postId: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  liked?: boolean;
  newComment?: {
    id: string;
    content: string;
    author: { id: string; name: string | null; image: string | null };
  };
  newRepost?: {
    id: string;
    createdAt: string;
    author: { id: string; name: string | null; image: string | null };
  };
  userId: string;
}