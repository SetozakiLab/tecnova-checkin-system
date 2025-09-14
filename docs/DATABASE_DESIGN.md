# データベース設計書

**最終更新日:** 2025 年 9 月 14 日

---

## 1. ER 図

```mermaid
erDiagram
    Guest ||--o{ CheckinRecord : has
    User {
        uuid id PK
        string username UK
        string hashedPassword
        datetime createdAt
        datetime updatedAt
    }

  Guest {
    uuid id PK
    int displayId UK "表示用ID"
    string name "氏名・ニックネーム"
    string contact "メールアドレス（任意）"
    Grade grade NULL "学年 (NULL=未設定)"
    datetime createdAt
    datetime updatedAt
  }

    CheckinRecord {
        uuid id PK
        uuid guestId FK
        datetime checkinAt "チェックイン時刻"
        datetime checkoutAt "チェックアウト時刻(NULL可)"
        boolean isActive "現在滞在中フラグ"
        datetime createdAt
        datetime updatedAt
    }
```

## 2. テーブル詳細設計

### 2.1. User（管理者）テーブル

| カラム名       | データ型     | 制約                    | 説明                       |
| -------------- | ------------ | ----------------------- | -------------------------- |
| id             | UUID         | PRIMARY KEY             | 主キー                     |
| username       | VARCHAR(50)  | UNIQUE, NOT NULL        | ログイン ID                |
| hashedPassword | VARCHAR(255) | NOT NULL                | ハッシュ化されたパスワード |
| createdAt      | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 作成日時                   |
| updatedAt      | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 更新日時                   |

**インデックス:**

- PRIMARY KEY (id)
- UNIQUE INDEX (username)

### 2.2. Guest（ゲスト）テーブル

| カラム名  | データ型     | 制約                    | 説明                                        |
| --------- | ------------ | ----------------------- | ------------------------------------------- |
| id        | UUID         | PRIMARY KEY             | 主キー（QR コード用）                       |
| displayId | INTEGER      | UNIQUE, NOT NULL        | 表示用 ID（YYXXX 形式）                     |
| name      | VARCHAR(100) | NOT NULL                | 氏名・ニックネーム                          |
| contact   | VARCHAR(255) | NULL                    | メールアドレス（任意）                      |
| grade     | ENUM Grade   | NULL                    | 学年 (ES1-ES6/JH1-JH3/HS1-HS3, NULL=未設定) |
| createdAt | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 登録日時                                    |
| updatedAt | TIMESTAMP    | NOT NULL, DEFAULT NOW() | 更新日時                                    |

**インデックス（設計）:**

- PRIMARY KEY (id)
- UNIQUE INDEX (displayId)
- INDEX (name) - 検索用

**実装状況差分:** Prisma schema は `displayId` の UNIQUE のみ。`grade` カラム追加済 (Enum)。`name` インデックスは未定義（必要性とクエリ頻度を踏まえ追加検討）。

**備考:**

- displayId は `YYXXX` 形式（例: 25001, 25002）
- YY: 年（2025 → 25）
- XXX: 年内の連番（001 から 999 まで）
- name はニックネーム可
- contact カラムは存在するが現行 UI では入力欄を非表示（将来 保護者通知機能対応時に再表示予定）
- grade は任意入力。既存行は Migration 適用後 NULL。Enum 値:
  - ES1..ES6 (小学 1–6 年)
  - JH1..JH3 (中学 1–3 年)
  - HS1..HS3 (高校 1–3 年)
  - NULL = 未設定（申告なし / 卒業状態用）

**Enum 採用理由:** 単一 ENUM に集約することで:

| 観点   | ENUM 採用効果     | 他案 (数値+区分) / フリーテキスト の課題 |
| ------ | ----------------- | ---------------------------------------- |
| 型安全 | Prisma で型生成   | 変換ロジック増 / 入力揺れ                |
| 一貫性 | 定義値固定        | 表記揺れ / 不正値混入                    |
| 集計   | GROUP BY しやすい | JOIN/CASE 必要                           |

**進級方針（将来）:** 年度切替時に ES1→ES2...HS2→HS3、HS3→NULL (卒業)。段階跨ぎ（ES6→JH1 等）は初期は手動運用。

### 2.3. CheckinRecord（入退場記録）テーブル

| カラム名   | データ型  | 制約                    | 説明               |
| ---------- | --------- | ----------------------- | ------------------ |
| id         | UUID      | PRIMARY KEY             | 主キー             |
| guestId    | UUID      | FOREIGN KEY, NOT NULL   | ゲスト ID          |
| checkinAt  | TIMESTAMP | NOT NULL                | チェックイン時刻   |
| checkoutAt | TIMESTAMP | NULL                    | チェックアウト時刻 |
| isActive   | BOOLEAN   | NOT NULL, DEFAULT TRUE  | 現在滞在中フラグ   |
| createdAt  | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時           |
| updatedAt  | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時           |

**外部キー制約:**

- guestId REFERENCES Guest(id) ON DELETE CASCADE

**インデックス（設計）:**

- PRIMARY KEY (id)
- INDEX (guestId)
- INDEX (checkinAt)
- INDEX (isActive)
- INDEX (guestId, isActive) - 複合インデックス

**実装状況差分:** 現行 Prisma schema にこれらのインデックス定義は未追加。高頻度クエリ（`isActive`、`guestId+isActive`、`checkinAt`）に最適化余地あり。次回マイグレーション候補。

**備考:**

- isActive = TRUE: 現在滞在中
- isActive = FALSE: 退場済み
- checkoutAt = NULL: 滞在中
- 同一 guestId で isActive=TRUE は 1 件だけであるべき。現在アプリケーションロジックで保証（DB 制約は未付与 / 将来部分 UNIQUE インデックス検討）

## 3. ビジネスルール

### 3.1. DisplayID 生成ルール

```typescript
// 表示用ID生成ロジック
const generateDisplayId = (sequence: number): number => {
  const year = new Date().getFullYear().toString().slice(-2); // YY
  const sequenceStr = sequence.toString().padStart(3, "0"); // XXX

  return parseInt(`${year}${sequenceStr}`);
};

// 年ごとの次の連番を取得
const getNextSequenceForYear = async (year: number): Promise<number> => {
  const yearPrefix = year.toString().slice(-2);

  // 該当年のdisplayIdの最大値を取得
  const maxDisplayId = await prisma.guest.findFirst({
    where: {
      displayId: {
        gte: parseInt(`${yearPrefix}000`),
        lt: parseInt(
          `${(parseInt(yearPrefix) + 1).toString().padStart(2, "0")}000`
        ),
      },
    },
    orderBy: {
      displayId: "desc",
    },
  });

  if (!maxDisplayId) {
    return 1; // 該当年の最初のゲスト
  }

  // 現在の最大displayIdから連番部分を抽出
  const currentSequence = maxDisplayId.displayId % 1000;
  return currentSequence + 1;
};
```

### 3.2. チェックイン/アウト制御

- 同一ゲストの重複チェックイン防止
- チェックアウト時は対応する isActive=TRUE のレコードを更新
- 未チェックアウトのレコードがある場合のハンドリング

### 3.3. データ整合性

- ゲスト削除時は関連するチェックイン記録も削除（CASCADE）
- チェックイン時刻 ≤ チェックアウト時刻の制約
- 同一ゲストで isActive=TRUE のレコードは最大 1 件

## 4. パフォーマンス考慮事項

### 4.1. 想定データ量

- ゲスト数: 500 人程度
- 1 日あたりの入退場記録: 100-200 回
- 年間の入退場記録: 36,000-72,000 件

### 4.2. クエリ最適化

**頻繁に実行されるクエリ:**

1. **現在の滞在者一覧取得**（`isActive = true` フィルタ + `checkinAt` ソート。インデックス未整備のため今後 `isActive, checkinAt` 追加を推奨）

```sql
SELECT g.name, cr.checkinAt
FROM Guest g
JOIN CheckinRecord cr ON g.id = cr.guestId
WHERE cr.isActive = TRUE
ORDER BY cr.checkinAt DESC;
```

2. **ゲスト検索（名前）**（`ILIKE` 部分一致。`name` インデックス未定義のため件数増加時にパフォーマンス懸念）

```sql
SELECT id, displayId, name
FROM Guest
WHERE name LIKE '%検索語%'
ORDER BY name;
```

3. **入退場履歴検索**（`checkinAt` 範囲検索。`checkinAt` インデックス未定義のため追加予定）

4. **学年別現在滞在者集計 (将来予定)**

```sql
SELECT grade, COUNT(*)
FROM Guest g
JOIN CheckinRecord cr ON g.id = cr.guestId AND cr.isActive = TRUE
GROUP BY grade
ORDER BY grade;
```

初期段階ではクエリ頻度が低いため `grade` へのインデックスは不要。ダッシュボード指標拡張時に追加検討。

### 4.3. 今後のマイグレーション提案

| 対象          | 追加インデックス                    | 目的                     |
| ------------- | ----------------------------------- | ------------------------ |
| Guest         | name                                | 部分一致検索高速化       |
| Guest         | grade                               | 学年別統計需要が顕在化時 |
| CheckinRecord | isActive                            | 現在滞在者一覧           |
| CheckinRecord | guestId,isActive                    | 重複チェックイン防止判定 |
| CheckinRecord | checkinAt                           | 日次範囲集計             |
| CheckinRecord | (部分)UNIQUE guestId WHERE isActive | アプリ側制約の DB 移行   |

### 4.4. リスクと対応

- インデックス追加による書き込みオーバーヘッドは許容範囲（想定書き込み 200/日）
- 既存データ量が少ない段階で早期適用を推奨
- 重複アクティブチェックイン防止は現行ロジック依存のため、将来 DB 制約導入で整合性強化

```sql
SELECT g.name, cr.checkinAt, cr.checkoutAt
FROM CheckinRecord cr
JOIN Guest g ON cr.guestId = g.id
WHERE DATE(cr.checkinAt) = '2025-07-03'
ORDER BY cr.checkinAt DESC;
```
