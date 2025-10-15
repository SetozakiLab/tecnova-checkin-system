import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // 追加の認証ロジックがあればここに記述
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/guests/:path*",
    "/admin/history/:path*",
  ],
};
