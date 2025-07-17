# Node.js公式イメージを使用
FROM node:24-alpine

# 作業ディレクトリを設定
WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# Prismaクライアントを生成
COPY prisma ./prisma/
RUN npx prisma generate

# アプリケーションコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# ポート3000を公開
EXPOSE 3000

# 本番サーバーを起動
CMD ["npm", "start"]
