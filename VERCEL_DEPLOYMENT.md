# Vercel 部署指南

## 環境變數配置

在 Vercel 控制台中，你需要設置以下環境變數：

### 必需變數
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=postgresql://username:password@host:port/database_name
```

### OAuth 配置（選擇一個或多個）
```
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### Pusher 配置（可選，用於即時通知）
```
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=ap1
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

## 部署步驟

1. 將代碼推送到 GitHub
2. 在 Vercel 中連接你的 GitHub 倉庫
3. 設置環境變數
4. 部署

## 已修復的問題

- ✅ ESLint 配置問題
- ✅ Prisma 客戶端生成問題
- ✅ TypeScript 類型錯誤
- ✅ 構建腳本優化

## 構建命令

```bash
npm run build  # 包含 prisma generate
```

## 注意事項

- 確保資料庫 URL 正確配置
- OAuth 應用需要設置正確的回調 URL
- Pusher 配置是可選的，如果沒有配置會跳過即時通知功能
