interface CreateNotificationParams {
  type: "like" | "comment" | "repost";
  senderId: string;
  postId: string;
  commentId?: string;
}

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
  post: {
    id: string;
    content: string | null;
    title: string | null;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  comment?: {
    id: string;
    content: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
}