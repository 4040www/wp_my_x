interface PostComment {
  id: string;
  content: string;
  author: User;
}

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

interface FeedItem {
  type: "post" | "repost";
  createdAt: string;
  post: Post;
  repostedBy?: User;
}
