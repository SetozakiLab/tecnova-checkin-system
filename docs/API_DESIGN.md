# API 設計書

**最終更新日:** 2025 年 7 月 3 日

---

## 1. API 概要

### 1.1. アーキテクチャ

- **フレームワーク**: Next.js App Router
- **API タイプ**: RESTful API
- **認証方式**: NextAuth.js (セッションベース)
- **データ形式**: JSON
- **エラーハンドリング**: 標準 HTTP ステータスコード

### 1.2. ベース URL

```
本番: https://checkin.tecnova.local
開発: http://localhost:3000
```

### 1.3. 共通レスポンス形式

#### 成功レスポンス

```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "message": "操作が成功しました"
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "name",
        "message": "名前は必須です"
      }
    ]
  }
}
```

## 2. ゲスト向け API

### 2.1. 新規ゲスト登録

**エンドポイント**: `POST /api/guests`

**リクエスト**:

```json
{
  "name": "田中太郎",
  "contact": "taro@example.com"
}
```

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "displayId": 250703001,
    "name": "田中太郎",
    "contact": "taro@example.com",
    "createdAt": "2025-07-03T10:30:00Z"
  },
  "message": "ゲストを登録しました"
}
```

**エラーケース**:

- 400: バリデーションエラー
- 409: 既に同名のゲストが存在

### 2.2. ゲスト検索

**エンドポイント**: `GET /api/guests/search`

**クエリパラメータ**:

- `q`: 検索語（名前または displayId）
- `limit`: 最大取得件数（デフォルト: 10）

**例**: `/api/guests/search?q=田中&limit=5`

**レスポンス**:

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
      "displayId": 250703001,
      "name": "田中太郎",
      "isCurrentlyCheckedIn": false,
      "lastCheckinAt": "2025-07-02T14:30:00Z"
    },
    {
      "id": "b2c3d4e5-f6g7-8901-2345-678901bcdefg",
      "displayId": 250703002,
      "name": "田中花子",
      "isCurrentlyCheckedIn": true,
      "lastCheckinAt": "2025-07-03T09:15:00Z"
    }
  ]
}
```

### 2.3. ゲスト詳細取得

**エンドポイント**: `GET /api/guests/[id]`

**パスパラメータ**:

- `id`: ゲスト ID（UUID）

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "displayId": 250703001,
    "name": "田中太郎",
    "contact": "taro@example.com",
    "isCurrentlyCheckedIn": false,
    "currentCheckinId": null,
    "lastCheckinAt": "2025-07-02T14:30:00Z",
    "createdAt": "2025-07-03T10:30:00Z"
  }
}
```

### 2.4. チェックイン

**エンドポイント**: `POST /api/guests/[id]/checkin`

**パスパラメータ**:

- `id`: ゲスト ID（UUID）

**リクエスト**:

```json
{
  "timestamp": "2025-07-03T10:30:00Z"
}
```

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "checkinRecordId": "c3d4e5f6-g7h8-9012-3456-789012cdefgh",
    "guestId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "guestName": "田中太郎",
    "checkinAt": "2025-07-03T10:30:00Z",
    "isActive": true
  },
  "message": "チェックインしました"
}
```

**エラーケース**:

- 400: 既にチェックイン済み
- 404: ゲストが見つからない

### 2.5. チェックアウト

**エンドポイント**: `POST /api/guests/[id]/checkout`

**パスパラメータ**:

- `id`: ゲスト ID（UUID）

**リクエスト**:

```json
{
  "timestamp": "2025-07-03T15:30:00Z"
}
```

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "checkinRecordId": "c3d4e5f6-g7h8-9012-3456-789012cdefgh",
    "guestId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "guestName": "田中太郎",
    "checkinAt": "2025-07-03T10:30:00Z",
    "checkoutAt": "2025-07-03T15:30:00Z",
    "isActive": false,
    "stayDuration": "5時間0分"
  },
  "message": "チェックアウトしました"
}
```

**エラーケース**:

- 400: チェックインしていない
- 404: ゲストが見つからない

## 3. 管理者向け API

### 3.1. 認証関連

#### ログイン

**エンドポイント**: `POST /api/auth/signin`

**リクエスト**:

```json
{
  "username": "admin",
  "password": "password123"
}
```

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin-uuid",
      "username": "admin"
    },
    "sessionToken": "session-token-here"
  },
  "message": "ログインしました"
}
```

#### ログアウト

**エンドポイント**: `POST /api/auth/signout`

**レスポンス**:

```json
{
  "success": true,
  "message": "ログアウトしました"
}
```

### 3.2. ダッシュボード

#### 現在の滞在者一覧

**エンドポイント**: `GET /api/admin/dashboard/current-guests`

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "totalCount": 5,
    "guests": [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "displayId": 250703001,
        "name": "田中太郎",
        "checkinAt": "2025-07-03T10:30:00Z",
        "stayDuration": "2時間15分"
      },
      {
        "id": "b2c3d4e5-f6g7-8901-2345-678901bcdefg",
        "displayId": 250703002,
        "name": "田中花子",
        "checkinAt": "2025-07-03T09:15:00Z",
        "stayDuration": "3時間30分"
      }
    ]
  }
}
```

#### 今日の統計情報

**エンドポイント**: `GET /api/admin/dashboard/today-stats`

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "date": "2025-07-03",
    "totalVisitors": 12,
    "currentGuests": 5,
    "totalCheckins": 12,
    "totalCheckouts": 7,
    "averageStayTime": "3時間45分",
    "peakTime": "14:00-15:00",
    "peakCount": 8
  }
}
```

### 3.3. 入退場履歴

#### 履歴検索

**エンドポイント**: `GET /api/admin/checkin-records`

**クエリパラメータ**:

- `startDate`: 開始日（YYYY-MM-DD）
- `endDate`: 終了日（YYYY-MM-DD）
- `guestName`: ゲスト名（部分一致）
- `type`: 種別（checkin/checkout）
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1 ページあたりの件数（デフォルト: 50）

**例**: `/api/admin/checkin-records?startDate=2025-07-01&endDate=2025-07-03&page=1&limit=20`

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "c3d4e5f6-g7h8-9012-3456-789012cdefgh",
        "guest": {
          "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "displayId": 250703001,
          "name": "田中太郎"
        },
        "checkinAt": "2025-07-03T10:30:00Z",
        "checkoutAt": "2025-07-03T15:30:00Z",
        "stayDuration": "5時間0分",
        "isActive": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 150,
      "totalPages": 8
    }
  }
}
```

### 3.4. ゲスト管理

#### ゲスト一覧

**エンドポイント**: `GET /api/admin/guests`

**クエリパラメータ**:

- `search`: 検索語（名前または displayId）
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1 ページあたりの件数（デフォルト: 50）

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "guests": [
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "displayId": 250703001,
        "name": "田中太郎",
        "contact": "taro@example.com",
        "isCurrentlyCheckedIn": false,
        "totalVisits": 15,
        "lastVisitAt": "2025-07-02T14:30:00Z",
        "createdAt": "2025-06-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalCount": 125,
      "totalPages": 3
    }
  }
}
```

#### ゲスト更新

**エンドポイント**: `PUT /api/admin/guests/[id]`

**パスパラメータ**:

- `id`: ゲスト ID（UUID）

**リクエスト**:

```json
{
  "name": "田中太郎（更新）",
  "contact": "taro@example.com"
}
```

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "displayId": 250703001,
    "name": "田中太郎（更新）",
    "contact": "taro@example.com",
    "updatedAt": "2025-07-03T16:00:00Z"
  },
  "message": "ゲスト情報を更新しました"
}
```

#### ゲスト削除

**エンドポイント**: `DELETE /api/admin/guests/[id]`

**パスパラメータ**:

- `id`: ゲスト ID（UUID）

**レスポンス**:

```json
{
  "success": true,
  "message": "ゲストを削除しました"
}
```

**エラーケース**:

- 404: ゲストが見つからない
- 409: 現在チェックイン中のため削除不可

## 4. WebSocket API（リアルタイム更新）

### 4.1. 接続

**エンドポイント**: `ws://localhost:3000/api/websocket`

**認証**: 管理者のみ（セッション確認）

### 4.2. イベント

#### 入場通知

```json
{
  "type": "GUEST_CHECKED_IN",
  "data": {
    "guestId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "guestName": "田中太郎",
    "checkinAt": "2025-07-03T10:30:00Z"
  }
}
```

#### 退場通知

```json
{
  "type": "GUEST_CHECKED_OUT",
  "data": {
    "guestId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "guestName": "田中太郎",
    "checkoutAt": "2025-07-03T15:30:00Z",
    "stayDuration": "5時間0分"
  }
}
```

#### 滞在者数更新

```json
{
  "type": "CURRENT_GUESTS_UPDATE",
  "data": {
    "totalCount": 5,
    "guests": [
      // 現在の滞在者一覧
    ]
  }
}
```

## 5. エラーコード一覧

| HTTP ステータス | エラーコード          | 説明                   |
| --------------- | --------------------- | ---------------------- |
| 400             | VALIDATION_ERROR      | バリデーションエラー   |
| 400             | ALREADY_CHECKED_IN    | 既にチェックイン済み   |
| 400             | NOT_CHECKED_IN        | チェックインしていない |
| 401             | UNAUTHORIZED          | 認証が必要             |
| 403             | FORBIDDEN             | 権限がない             |
| 404             | NOT_FOUND             | リソースが見つからない |
| 409             | CONFLICT              | データの競合           |
| 500             | INTERNAL_SERVER_ERROR | サーバー内部エラー     |

## 6. レート制限

- **ゲスト向け API**: 1IP あたり 100 リクエスト/分
- **管理者向け API**: 1 セッション あたり 500 リクエスト/分
- **WebSocket**: 1 セッション あたり 1 接続

## 7. セキュリティ考慮事項

### 7.1. 認証・認可

- 管理者機能は全て認証必須
- セッション有効期限: 8 時間
- CSRF 保護: Next.js 標準機能

### 7.2. データ保護

- 個人情報の暗号化
- SQL インジェクション対策（Prisma ORM）
- XSS 対策（Next.js 標準機能）

### 7.3. ログ・監査

- 全 API 呼び出しのログ記録
- 管理者操作の監査ログ
- 異常なアクセスパターンの検知
