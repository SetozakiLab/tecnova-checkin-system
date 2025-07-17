# tec-nova 入退場管理システム

小学生から高校生が利用する施設「tec-nova」において、ゲスト（子供）の入退場プロセスをデジタル化し、施設管理者（メンター）の運営負担を軽減するための Web アプリケーションです。

## 🚀 機能概要

### ゲスト向け機能

- **新規ゲスト登録**: 氏名（ニックネーム可）、メールアドレス（任意）などの基本情報を登録
- **利用規約同意**: 新規登録時に利用規約への同意を確認
- **簡単チェックイン/アウト**: 発行された ID や氏名で検索し、ワンタップで入退場を記録

### 管理者向け機能

- **セキュアなログイン**: ID/パスワード認証による権限管理
- **リアルタイムダッシュボード**: 現在施設内にいるゲストの一覧と滞在人数を表示
- **入退場履歴管理**: 過去の入退場記録の検索・閲覧・修正
- **ゲスト情報管理**: 登録ゲストの情報の参照・編集・削除（CRUD 操作）

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
