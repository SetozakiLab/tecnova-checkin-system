# API 設計書

**最終更新日:** 2025 年 9 月 14 日

---

## 1. API 概要

### 1.1. アーキテクチャ

- **フレームワーク**: Next.js App Router
- **API タイプ**: RESTful API (Next.js Route Handlers)
- **認証方式**: NextAuth.js (Credentials / セッションベース)
- **データ形式**: JSON
- **エラーハンドリング**: 共通ハンドラー（`api-handler.ts`）+ HTTP ステータス

### 1.2. ベース URL

```
本番: https://checkin.tecnova.local (予定)
開発: http://localhost:3000
```

### 1.3. 共通レスポンス形式

成功:

```json
{
  "success": true,
  "data": {},
  "message": "任意のメッセージ"
}
```

エラー:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [{ "field": "name", "message": "名前は必須です" }]
  }
}
```

---

## 2. ゲスト向け API

### 2.1. 新規ゲスト登録

`POST /api/guests`

リクエスト:

```json
{ "name": "田中太郎", "contact": "taro@example.com", "grade": "JH2" }
```

`grade` は任意。未設定時は省略または `null`。

備考: 登録直後にサーバー側で自動チェックインを試行（失敗しても登録は成功扱い）。レスポンスにはチェックイン情報は含まれない。

レスポンス（実装）:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "displayId": 25001,
    "name": "田中太郎",
    "contact": "taro@example.com",
    "grade": "JH2",
    "createdAt": "2025-07-03T10:30:00Z"
  },
  "message": "ゲストを登録しました"
}
```

主なエラー: 400 VALIDATION_ERROR / 500 INTERNAL_SERVER_ERROR

### 2.2. ゲスト検索（公開）

`GET /api/guests/search?q=...`

クエリ:

- `q`: 名前部分一致 または displayId 数値完全一致

備考: `limit` パラメータは未実装（常に最大 10 件）。

レスポンス例:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "displayId": 25001,
      "name": "田中太郎",
      "grade": "ES4",
      "isCurrentlyCheckedIn": false,
      "lastCheckinAt": "2025-07-02T14:30:00Z"
    }
  ]
}
```

### 2.3. ゲスト詳細取得

`GET /api/guests/{id}`

レスポンス例:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "displayId": 25001,
    "name": "田中太郎",
    "contact": "taro@example.com",
    "grade": null,
    "isCurrentlyCheckedIn": false,
    "currentCheckinId": null,
    "lastCheckinAt": "2025-07-02T14:30:00Z",
    "createdAt": "2025-07-03T10:30:00Z"
  }
}
```

### 2.4. チェックイン

`POST /api/guests/{id}/checkin`

リクエストボディ: なし

レスポンス（実装）:

```json
{
  "success": true,
  "data": {
    "id": "checkin-record-uuid",
    "guestId": "uuid",
    "guestName": "田中太郎",
    "guestDisplayId": 25001,
    "checkinAt": "2025-07-03T10:30:00Z",
    "checkoutAt": null,
    "isActive": true
  },
  "message": "チェックインしました"
}
```

エラー: 404 NOT_FOUND / 409 CONFLICT (既にチェックイン)

### 2.5. チェックアウト

`POST /api/guests/{id}/checkout`

リクエストボディ: なし

レスポンス（実装）:

```json
{
  "success": true,
  "data": {
    "id": "checkin-record-uuid",
    "guestId": "uuid",
    "guestName": "田中太郎",
    "guestDisplayId": 25001,
    "checkinAt": "2025-07-03T10:30:00Z",
    "checkoutAt": "2025-07-03T15:30:00Z",
    "isActive": false
  },
  "message": "チェックアウトしました"
}
```

エラー: 400 BAD_REQUEST (未チェックイン)

---

## 3. 管理者向け API（要認証）

### 3.1. 認証

#### サインイン

`POST /api/auth/signin`

```json
{ "username": "admin", "password": "password123" }
```

レスポンス（実装）:

```json
{ "success": true, "message": "ログインしました" }
```

失敗: 401 UNAUTHORIZED

#### サインアウト

`POST /api/auth/signout`

```json
{ "success": true, "message": "ログアウトしました" }
```

### 3.2. ダッシュボード

#### 現在の滞在者

`GET /api/admin/dashboard/current-guests` (認証必須)
レスポンス（実装）:

```json
{
  "success": true,
  "data": [
    {
      "id": "checkin-record-uuid",
      "guestId": "guest-uuid",
      "guestName": "田中太郎",
      "guestDisplayId": 25001,
      "checkinAt": "2025-07-03T10:30:00Z",
      "checkoutAt": null,
      "isActive": true,
      "duration": 135
    }
  ]
}
```

備考: `duration` = 分。総数フィールドは未実装。

#### 今日の統計

`GET /api/admin/dashboard/today-stats`
レスポンス（実装）:

```json
{
  "success": true,
  "data": {
    "totalCheckins": 12,
    "currentGuests": 5,
    "averageStayTime": 225
  }
}
```

備考: `averageStayTime` = 分。旧設計の追加指標は未実装。

### 3.3. 入退場履歴

`GET /api/admin/checkin-records`

クエリ:

- `page` / `limit`
- `startDate` / `endDate`
- `guestId` / `guestName`

レスポンス（実装）:

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record-uuid",
        "guestId": "guest-uuid",
        "guestName": "田中太郎",
        "guestDisplayId": 25001,
        "checkinAt": "2025-07-03T10:30:00Z",
        "checkoutAt": "2025-07-03T15:30:00Z",
        "isActive": false,
        "duration": 300
      }
    ],
    "pagination": { "page": 1, "limit": 20, "totalCount": 150, "totalPages": 8 }
  }
}
```

備考: `duration` = 分。文字列表現（例: "5 時間 0 分"）は未実装。

### 3.4. ゲスト管理

#### 一覧

`GET /api/admin/guests?search=&page=1&limit=50`
レスポンス例:

```json
{
  "success": true,
  "data": {
    "guests": [
      {
        "id": "guest-uuid",
        "displayId": 25001,
        "name": "田中太郎",
        "contact": "taro@example.com",
        "isCurrentlyCheckedIn": false,
        "totalVisits": 15,
        "lastVisitAt": "2025-07-02T14:30:00Z",
        "createdAt": "2025-06-15T10:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 50, "totalCount": 125, "totalPages": 3 }
  }
}
```

#### 更新

`PUT /api/admin/guests/{id}`

```json
{ "name": "田中太郎（更新）", "contact": "taro@example.com", "grade": "HS1" }
```

レスポンス（実装）:

```json
{
  "success": true,
  "data": {
    "id": "guest-uuid",
    "displayId": 25001,
    "name": "田中太郎（更新）",
    "contact": "taro@example.com",
    "grade": "HS1",
    "createdAt": "2025-06-15T10:30:00Z"
  },
  "message": "ゲスト情報を更新しました"
}
```

備考: `updatedAt` はレスポンス未含有。

#### 削除

`DELETE /api/admin/guests/{id}`
成功: 200 （チェックイン中は 409 CONFLICT）

### 3.5. 活動ログ (Activity Log)

MVP: 作成/更新（同一枠再送で上書き） + 削除のみ。一覧/検索は将来実装。

#### 作成 / 更新

`POST /api/admin/activity-logs`

リクエスト（`timeslotStart` 省略時: サーバー側で現在時刻を直前 :00 / :30 に切り捨て）:

```json
{
  "guestId": "guest-uuid",
  "category": "VR_HMD",
  "description": "初めてVR体験",
  "timeslotStart": "2025-09-14T09:00:00+09:00"
}
```

バリデーション:

- guestId: UUID 必須（存在・チェックイン中推奨, MVP では在席未検証でも受理）
- category: ActivityCategory Enum
- description: 1–100 文字 / プレーンテキスト（空白のみ不可）
- timeslotStart: 分=00 or 30, JST 想定（UTC 受領時はサーバー側で丸め）

同一 (guestId, timeslotStart) が存在する場合は UPDATE として上書きし `updatedAt` 更新。

レスポンス:

```json
{
  "success": true,
  "data": {
    "id": "activity-log-uuid",
    "guestId": "guest-uuid",
    "timeslotStart": "2025-09-14T09:00:00+09:00",
    "category": "VR_HMD",
    "description": "初めてVR体験",
    "createdByUserId": "user-uuid",
    "createdAt": "2025-09-14T09:01:02+09:00",
    "updatedAt": "2025-09-14T09:05:10+09:00"
  },
  "message": "活動ログを保存しました"
}
```

エラー:

- 400 VALIDATION_ERROR (形式, 分単位不正, 長さ不正)
- 404 NOT_FOUND (guestId 不存在)

#### 削除 (SUPER のみ)

`DELETE /api/admin/activity-logs/{id}`

成功:

```json
{ "success": true, "message": "活動ログを削除しました" }
```

エラー: 403 FORBIDDEN (MANAGER), 404 NOT_FOUND

#### Enum: ActivityCategory

| 値              | 表示            |
| --------------- | --------------- |
| VR_HMD          | VR（HMD）       |
| DRONE           | ドローン        |
| PRINTER_3D      | 3D プリンタ     |
| PEPPER          | ペッパー        |
| LEGO            | レゴ            |
| MBOT2           | mBot2           |
| LITTLE_BITS     | little Bits     |
| MESH            | MESH            |
| TOIO            | toio            |
| MINECRAFT       | マインクラフト  |
| UNITY           | Unity           |
| BLENDER         | Blender         |
| DAVINCI_RESOLVE | DaVinci Resolve |
| OTHER           | その他          |

備考: OTHER でも description 必須（他カテゴリも必須）。

### 3.5. 管理ユーザー一覧 (補助)

`GET /api/admin/users`

レスポンス例:

```json
{
  "success": true,
  "data": {
    "users": [{ "id": "user-uuid", "username": "admin", "role": "SUPER" }]
  }
}
```

備考: ログイン画面の既存ユーザー選択プルダウン用。MANAGER 自己作成フローと併用。

---

## 4. リアルタイム更新（WebSocket）

現行コードには WebSocket 実装なし。予定イベント案:

- `GUEST_CHECKED_IN`
- `GUEST_CHECKED_OUT`
- `CURRENT_GUESTS_UPDATE`

---

## 5. エラーコード

| HTTP | コード                | 説明                                   |
| ---- | --------------------- | -------------------------------------- |
| 400  | VALIDATION_ERROR      | バリデーションエラー                   |
| 400  | BAD_REQUEST           | 不正リクエスト（汎用）                 |
| 401  | UNAUTHORIZED          | 認証が必要                             |
| 403  | FORBIDDEN             | 権限なし（現状未使用）                 |
| 404  | NOT_FOUND             | リソース未存在                         |
| 405  | METHOD_NOT_ALLOWED    | 許可されていないメソッド               |
| 409  | CONFLICT              | 競合（既にチェックイン / 削除不可 等） |
| 500  | INTERNAL_SERVER_ERROR | サーバー内部エラー                     |

内部サービス例外: `GUEST_NOT_FOUND`, `ALREADY_CHECKED_IN`, `NOT_CHECKED_IN`, `GUEST_CURRENTLY_CHECKED_IN`, `DISPLAY_ID_GENERATION_FAILED`, `SEQUENCE_LIMIT_EXCEEDED` など。

---

## 6. レート制限

現行: 未導入。導入予定（案）

- 公開 API: 1 IP / 100 req / 分
- 管理 API: 1 セッション / 500 req / 分
- リアルタイム: 1 セッション 1 接続
  候補: @upstash/ratelimit + Redis

---

## 7. セキュリティ

### 7.1. 認証 / 認可

- 管理ルートは `requireAuth` でセッション検証
- セッション有効期限: NextAuth デフォルト（明示設定なし）
- CSRF: NextAuth 標準

### 7.2. データ保護

- SQL インジェクション: Prisma ORM
- XSS: Next.js デフォルトのエスケープ
- 個人情報暗号化: 未実装（必要性次第で検討）

### 7.3. ログ / 監査

- アクセスログ（構造化）: 未実装
- 監査ログ: 未実装
- 異常検知: 未実装

---

## 8. 変更履歴（差分要約）

| 項目                | 旧記述                                   | 現行実装                               | 備考                    |
| ------------------- | ---------------------------------------- | -------------------------------------- | ----------------------- |
| ゲスト検索          | limit 対応                               | limit 未実装                           | 固定 10 件              |
| チェックイン/アウト | timestamp フィールド                     | ボディ不要                             | サーバー時刻使用        |
| 現在滞在者          | totalCount + guests オブジェクト         | 配列のみ (public current にも類似構造) | duration 分単位         |
| 今日統計            | 多項目 (peak 等)                         | 3 項目のみ                             | 拡張予定                |
| 履歴 API            | guest オブジェクト + stayDuration 文字列 | フラット + duration(分)                | 文字列整形未実装        |
| 更新レスポンス      | updatedAt 返却                           | 未返却                                 | 返却統一検討            |
| サインイン          | user / sessionToken 返却                 | message のみ                           | NextAuth セッション管理 |
| WebSocket           | 実装前提                                 | 未実装                                 | 設計のみ保持            |
| レート制限          | 実装記述あり                             | 未実装                                 | 導入予定                |
| エラー              | NOT_CHECKED_IN 等のみ                    | BAD_REQUEST/METHOD_NOT_ALLOWED 追加    | 共通化                  |
| 学年フィールド      | 未記載                                   | 追加 (任意: grade)                     | null 可                 |
| users API           | 未記載                                   | /api/admin/users 追加                  | ログイン補助            |
| 活動ログ API        | 未記載                                   | 作成/更新/削除 (一覧未実装)            | 30 分枠/カテゴリ選択    |

---

## 9. 今後の改善候補

1. レート制限導入
2. WebSocket / SSE による push 更新
3. 滞在時間文字列表現フォーマッタ追加
4. 統計指標（ピーク時間/総訪問者）拡張
5. 監査ログ + エラートラッキング (Sentry)
6. `updatedAt` や完全 DTO の返却統一
7. エラーコード列挙型化 & ドキュメント自動生成
8. 学年別統計 (ダッシュボード/履歴フィルタ) の追加

---

### 付録: `grade` Enum 定義

| 値   | 表示ラベル | 説明          |
| ---- | ---------- | ------------- |
| ES1  | 小学 1 年  | Elementary 1  |
| ES2  | 小学 2 年  | Elementary 2  |
| ES3  | 小学 3 年  | Elementary 3  |
| ES4  | 小学 4 年  | Elementary 4  |
| ES5  | 小学 5 年  | Elementary 5  |
| ES6  | 小学 6 年  | Elementary 6  |
| JH1  | 中学 1 年  | Junior High 1 |
| JH2  | 中学 2 年  | Junior High 2 |
| JH3  | 中学 3 年  | Junior High 3 |
| HS1  | 高校 1 年  | High School 1 |
| HS2  | 高校 2 年  | High School 2 |
| HS3  | 高校 3 年  | High School 3 |
| null | 未設定     | 入力なし      |

バリデーション: `grade` が存在する場合は上記いずれか。存在しない/ null の場合は未設定扱い。
