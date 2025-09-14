# tec-nova 入退場管理システム

小学生から高校生が利用する施設「tec-nova」において、ゲスト（子供）の入退場プロセスをデジタル化し、施設管理者（メンター）の運営負担を軽減するための Web アプリケーションです。

## 🚀 機能概要

### ゲスト向け機能

- **新規ゲスト登録**: 氏名（ニックネーム可）、メールアドレス（任意）、学年（任意 / 小学 1 年〜高校 3 年）などの基本情報を登録
- **利用規約同意**: 新規登録時に利用規約への同意を確認
- **簡単チェックイン/アウト**: 発行された ID や氏名で検索し、ワンタップで入退場を記録

### 管理者向け機能

- **セキュアなログイン**: ID/パスワード認証による権限管理
- **リアルタイムダッシュボード**: 現在施設内にいるゲストの一覧と滞在人数を表示
- **入退場履歴管理**: 過去の入退場記録の検索・閲覧・修正
- **ゲスト情報管理**: 登録ゲストの情報の参照・編集・削除（CRUD 操作）
- **活動ログ記入**: チェックイン中ゲストの 30 分枠活動内容をカテゴリ + 100 文字説明で記録（同枠再送で上書き / 削除は SUPER のみ）グリッド UI & Sheet 編集対応済み

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15.3.4, React 19, TypeScript
- **バックエンド**: Next.js API Routes, NextAuth.js
- **データベース**: PostgreSQL, Prisma ORM
- **UI ライブラリ**: Tailwind CSS, Radix UI, Lucide React
- **認証**: NextAuth.js with credential provider
- **フォーム**: React Hook Form, Zod validation
- **開発環境**: Docker, Docker Compose

## 📋 前提条件

- Node.js 20 以上
- Docker & Docker Compose
- PostgreSQL 15 以上（Docker を使用しない場合）

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/ut42univ/tecnova-checkin-system.git
cd tecnova-checkin-system
```

### 2. 環境変数の設定

```bash
# 開発環境用
cp .env.example .env.dev

# 本番環境用
cp .env.example .env.prod
```

環境変数ファイルを編集し、必要な値を設定してください。

### 3. Docker を使用した開発環境の起動

```bash
# 開発環境の起動（推奨）
docker-compose -f compose.dev.yaml up -d

# または、データベースのみDockerで起動
docker-compose up -d
```

開発環境では以下が自動的に実行されます：

- PostgreSQL データベースの起動
- Prisma マイグレーションの実行
- データベースのシード
- Next.js 開発サーバーの起動

### 4. ローカル開発（Docker を使用しない場合）

```bash
# 依存関係のインストール
npm install

# Prismaクライアントの生成
npm run db:generate

# データベースマイグレーション
npm run db:migrate

# シードデータの投入
npm run db:seed

# 開発サーバーの起動
npm run dev
```

### 5. アプリケーションへのアクセス

- **ゲスト用画面**: http://localhost:3000
- **管理者用画面**: http://localhost:3000/admin
- **管理者ログイン**: 開発環境では `admin` / `password` でログイン可能

## 🐳 Docker 環境

### 開発環境

```bash
# 開発環境の起動
docker-compose -f compose.dev.yaml up -d

# ログの確認
docker-compose -f compose.dev.yaml logs -f web

# 環境の停止
docker-compose -f compose.dev.yaml down
```

### 本番環境

```bash
# 本番環境の起動
docker-compose -f compose.prod.yaml up -d

# ログの確認
docker-compose -f compose.prod.yaml logs -f web

# 環境の停止
docker-compose -f compose.prod.yaml down
```

### データベースのみ起動

```bash
# PostgreSQLのみを起動
docker-compose up -d db

# データベースへの接続
docker-compose exec db psql -U postgres -d tecnova_checkin
```

## 📝 開発用コマンド

```bash
# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバーの起動
npm run start

# ESLintによるコード検証
npm run lint

# Prismaクライアントの生成
npm run db:generate

# データベースの変更をプッシュ
npm run db:push

# マイグレーションの実行
npm run db:migrate

# シードデータの投入
npm run db:seed
```

## 📁 プロジェクト構造

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (guest)/        # ゲスト向けページ
│   │   ├── admin/          # 管理者向けページ
│   │   └── api/            # API Routes
│   ├── components/         # Reactコンポーネント
│   │   ├── features/       # 機能別コンポーネント
│   │   ├── shared/         # 共通コンポーネント
│   │   └── ui/             # UIコンポーネント
│   ├── hooks/              # カスタムフック
│   ├── lib/                # ユーティリティ関数
│   ├── services/           # ビジネスロジック
│   └── types/              # TypeScript型定義
├── prisma/                 # Prismaスキーマとマイグレーション
├── docs/                   # プロジェクトドキュメント
├── public/                 # 静的ファイル
└── Docker関連ファイル       # Dockerfile, docker-compose.yaml
```

## 🗃️ データベース

### マイグレーション

```bash
# 新しいマイグレーションの作成
npx prisma migrate dev --name migration_name

# マイグレーションの適用
npx prisma migrate deploy

# マイグレーション状態の確認
npx prisma migrate status
```

### Prisma Studio

```bash
# Prisma Studioの起動（データベースGUI）
npx prisma studio
```

## 🔧 設定ファイル

- `prisma/schema.prisma`: データベーススキーマ定義
- `next.config.ts`: Next.js 設定
- `tailwind.config.ts`: Tailwind CSS 設定
- `tsconfig.json`: TypeScript 設定
- `eslint.config.mjs`: ESLint 設定

## 📚 追加リソース

詳細な設計書や API ドキュメントは `docs/` ディレクトリをご確認ください：

- [要件定義書](docs/REQUIREMENTS.md)
- [システム設計書](docs/ARCHITECTURE.md)
- [データベース設計書](docs/DATABASE_DESIGN.md)
- [画面設計書](docs/SCREEN_DESIGN.md)
- [API 設計書](docs/API_DESIGN.md)

## 🤝 コントリビューション

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

---

**開発者向けメモ**:

- 本システムは小学生から高校生が利用することを前提としており、UI/UX は直感的で分かりやすい設計を心がけています
- セキュリティを考慮し、管理者機能は認証必須となっています
- 将来的な拡張（QR コード対応、統計機能など）を考慮した設計となっています

---

## 📌 現在のプロジェクト状況サマリ（2025-09-14 時点）

最新主要バージョン:

- Next.js: 15.3.4
- React: 19.0.0
- TypeScript: 5 系
- Prisma: 6.11.0
- PostgreSQL: 15（Alpine イメージ）

直近のスキーマ変更（`prisma/migrations`）:

1. `20250906022240_add_role_to_user`: `Role` ENUM（`SUPER` / `MANAGER`）追加
2. `20250913005656_add_grade_to_guest`: `Guest.grade` 追加
3. `20250914011353_add_activity_log`: `ActivityLog` テーブル / `ActivityCategory` ENUM / UNIQUE (guestId,timeslotStart)

運用上の留意点:

- 役割ベース権限: 活動ログ削除は `SUPER` のみ（今後細分化予定）
- 監査ログ: 未実装（空マイグレーションがあれば整理推奨）
- 学年 (grade): UI 反映済み
- 活動ログ: 実装完了。Upsert により同一 30 分枠は冪等更新
- 本番起動時 `prisma migrate deploy` 実行 → 未検証マイグレーションは事前確認必須

### 活動ログ API 利用例

Upsert (同一キー=guestId+timeslotStart で上書き):

```bash
curl -X POST http://localhost:3000/api/admin/activity-logs \
	-H 'Content-Type: application/json' \
	-b 'your_session_cookie' \
	-d '{
		"guestId": "<guest-uuid>",
		"category": "STUDY",
		"description": "数学ドリル",
		"timestamp": "2025-09-14T10:15:00+09:00"
	}'
```

取得（指定 JST 日付）:

```bash
curl -X GET 'http://localhost:3000/api/admin/activity-logs?date=2025-09-14' -b 'your_session_cookie'
```

削除（SUPER のみ）:

```bash
curl -X DELETE http://localhost:3000/api/admin/activity-logs/<logId> -b 'your_session_cookie'
```

UI: `/admin/activity-log` 列=現在チェックイン中ゲスト / 行=30 分スロット。セルクリックで Sheet による追加/編集。

---

## 🛡️ 本番環境（オンプレ/セルフホスト）アップグレード & マイグレーション手順

目的: 既存データを保持しつつ、アプリケーションと DB スキーマを安全に更新する。

### 更新シナリオ別早見表

| シナリオ                       | 判定条件                                                              | 推奨コマンド / 手順概要                                                                                                        | 備考                                                   |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| A. アプリコードのみ更新        | `prisma/schema.prisma` 変更なし & 新規 `migrations/` 追加なし         | 1) `git pull` 2) `docker compose -f compose.prod.yaml up -d --build` 3) 動作確認                                               | `prisma migrate deploy` は実行されるが差分なしで即終了 |
| B. 軽微な DB スキーマ追加/変更 | 新しいマイグレーションフォルダあり（追加カラム / ENUM 追加等 非破壊） | 1) バックアップ取得 2) `docker compose -f compose.prod.yaml run --rm web npx prisma migrate deploy` 3) `up -d --build` 4) 確認 | エラー時はロールバック（バックアップ必須）             |
| C. 破壊的 / 大規模変更         | カラム削除 / 型変更 / インデックス再作成 / 大量データ移行             | 1) メンテウィンドウ確保 2) バックアップ二重化 3) リハーサル環境で所要時間計測 4) 本番 `migrate deploy` 5) 再起動               | 必要なら一時的にメンテ表示                             |
| D. 手動 SQL 併用               | Prisma 生成不可（複雑リライト等）                                     | 1) バックアップ 2) 手動 SQL 実行 3) Prisma マイグレーション（空ダミー / drift 回避）                                           | 手動操作ログを残す                                     |

簡易判定フロー:

1. `git diff --name-only <旧タグ>..<新タグ> prisma/schema.prisma` で差分無 → シナリオ A
2. 新規 `prisma/migrations/<timestamp>_*` の SQL が CREATE/ALTER ADD のみ → シナリオ B
3. DROP / ALTER TYPE 変更 / 既存列型変更 / データ移行（UPDATE で大量行）→ シナリオ C
4. マイグレーションフォルダ未整備で手動 SQL 予定 → シナリオ D（先に正規マイグレーション作成を検討）

各シナリオで最低限: バージョンタグ or コミットハッシュを操作記録に残すこと。

### フロー概観

1. 変更確認 & メンテ計画
2. 事前バックアップ（必須 / 推奨 2 系列）
3. 新コード取得 & イメージ再ビルド
4. マイグレーション適用（ドライラン検証 → 本番適用）
5. アプリ再起動 & 動作確認
6. ロールバック手順確認（実行せずシミュレーション）

### 0. 前提

- `.env.prod` が最新（特に DB 接続値 / 認証秘密鍵）
- DB ボリューム: `postgres-prod-data`（compose.prod.yaml 定義）
- バックアップ出力用ディレクトリ: `./backups`（すでにマウント設定済）

### 1. 変更内容の確認

```
git fetch --all --prune
git log --oneline origin/main..origin/agent-dev
git diff --name-status origin/main..origin/agent-dev prisma/schema.prisma
```

### 2. バックアップ（必須）

2 系列（論理 + ボリュームスナップショット）を取得し、少なくとも直近 1 つをオフホスト保管。

論理バックアップ（リストア粒度細かい・推奨）:

```
docker compose -f compose.prod.yaml exec -T db pg_dump -Fc -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
	> backups/`date +%Y%m%d_%H%M%S`_tecnova.dump
```

ボリュームスナップショット（高速ロールバック用 / 容量大）:

```
docker run --rm --volumes-from $(docker compose -f compose.prod.yaml ps -q db) \
	-v $(pwd)/backups:/backup busybox \
	tar czf /backup/`date +%Y%m%d_%H%M%S`_postgres-volume.tgz /var/lib/postgresql/data
```

整合性簡易チェック:

```
pg_restore -l backups/<取得した>.dump | head
```

### 3. メンテナンスモード（任意 / 推奨）

アプリ側で未実装の場合: 一時的に管理 UI ログインを制限（例: `NEXT_PUBLIC_MAINTENANCE=1` を導入予定、現状は Basic 認証やリバースプロキシでブロックで代替）。

### 4. コード更新 & イメージ再ビルド

```
git checkout main
git pull origin main
# あるいは対象リリースタグへ checkout
docker compose -f compose.prod.yaml build --no-cache web
```

### 5. マイグレーションの事前検証（任意）

本番 DB をコピーした一時コンテナ/別環境で `prisma migrate deploy` を実行し破壊的変更が無いか確認。

### 6. マイグレーション適用（本番）

アプリ起動時に自動実行されるが、明示的に先行適用してエラーを早期検知することを推奨。

```
docker compose -f compose.prod.yaml run --rm web npx prisma migrate deploy
```

成功後に本番再起動:

```
docker compose -f compose.prod.yaml up -d web
```

### 7. 動作確認チェックリスト

- /admin ログイン可
- 既存ユーザーの `role` カラムが `SUPER` で埋まっている
- チェックイン / チェックアウト処理成功
- `prisma migrate status` で未適用なし

```
docker compose -f compose.prod.yaml exec -T web npx prisma migrate status
docker compose -f compose.prod.yaml logs -f web | tail
```

### 8. 監査ログマイグレーション（未完成フォルダ対応）

`20250906090000_add_audit_log/` が空の場合:

- a) 実装がまだ: フォルダ削除して再度 `prisma migrate dev --name add_audit_log` を開発環境で実行し、生成後に再デプロイ
- b) 本番適用を延期: 空フォルダを一旦削除し、リポジトリ更新

### 9. ロールバック手順（シミュレーション）

障害発生時:

```
# 停止
docker compose -f compose.prod.yaml down web

# DB を初期化（破壊操作: バックアップがあることを必ず確認）
docker compose -f compose.prod.yaml exec -T db psql -U $POSTGRES_USER -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$POSTGRES_DB';"
docker compose -f compose.prod.yaml exec -T db dropdb -U $POSTGRES_USER $POSTGRES_DB
docker compose -f compose.prod.yaml exec -T db createdb -U $POSTGRES_USER $POSTGRES_DB

# 復元（論理バックアップ）
cat backups/<対象>.dump | docker compose -f compose.prod.yaml exec -T db pg_restore -U $POSTGRES_USER -d $POSTGRES_DB --clean --if-exists

# 旧バージョンイメージ再起動（タグ管理している場合）
docker compose -f compose.prod.yaml up -d web
```

---

## 🧪 推奨運用タスク（定期）

- 日次: `pg_dump -Fc` 取得 & オフサイト転送
- 週次: ボリュームスナップショット
- 月次: 復元テスト（空 DB へリハーサル）
- 障害訓練: ロールバック 3 分以内を目標

---

## ❓ トラブルシューティング早見

- `web` 起動直後に落ちる: 環境変数 / Prisma マイグレーション失敗 (`docker compose logs web`)
- `prisma migrate deploy` がハング: DB ロック（`pg_locks` 確認）、長時間トランザクションを強制終了
- 役割 ENUM 追加で失敗: 既存で ENUM 名変更している場合、`ALTER TYPE ... ADD VALUE` の手動適用が必要

---

## 🔒 セキュリティ短期 TODO（優先度順）

1. 監査ログテーブル実装 & 管理画面表示
2. `role` ベースの API / UI ガード実装
3. メンテナンスモード簡易フラグ導入
4. 管理者パスワード初回強制変更ワークフロー

---

（本節はアップグレード運用指針のため適宜更新してください）
