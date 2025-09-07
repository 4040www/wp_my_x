import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// 服務端 Pusher 配置
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'your_app_id',
  key: process.env.PUSHER_KEY || 'your_key',
  secret: process.env.PUSHER_SECRET || 'your_secret',
  cluster: process.env.PUSHER_CLUSTER || 'ap1',
  useTLS: true,
});

// 客戶端 Pusher 配置
export const pusherClient = (() => {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || 'your_key';
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1';
  
  // 如果沒有正確配置，返回 null
  if (key === 'your_key' || !key) {
    return null;
  }
  
  return new PusherClient(key, {
    cluster,
    // 添加錯誤處理
    onError: (error) => {
      console.warn('Pusher connection error:', error);
    },
    // 添加連接狀態處理
    onConnectionStateChange: (state) => {
      console.log('Pusher connection state:', state);
    },
  });
})();

// 通知頻道名稱生成
export function getNotificationChannel(userId: string) {
  return `notifications-${userId}`;
}

// 帖子更新頻道名稱生成
export function getPostChannel(postId: string) {
  return `post-${postId}`;
}
