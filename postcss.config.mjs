// Vitest 等の Node 環境でそのまま読み込まれるとエラーになるため条件分岐
const isTest = process.env.VITEST;

const config = {
  plugins: isTest ? [] : ["@tailwindcss/postcss"],
};

export default config;
