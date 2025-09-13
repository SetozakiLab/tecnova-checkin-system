import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface UseNavigationOptions {
  onNavigate?: (path: string) => void;
  confirmBeforeLeave?: boolean;
  confirmMessage?: string;
}

interface UseNavigationReturn {
  navigate: (path: string) => void;
  navigateToCheckinComplete: (type: 'checkin' | 'checkout', guestId: string) => void;
  navigateToHome: () => void;
  navigateToLogin: () => void;
  navigateToCheckin: () => void;
  navigateToCheckout: () => void;
  navigateToAdmin: () => void;
  navigateBack: () => void;
  replace: (path: string) => void;
  refresh: () => void;
}

export function useNavigation(options: UseNavigationOptions = {}): UseNavigationReturn {
  const router = useRouter();
  const { onNavigate, confirmBeforeLeave = false, confirmMessage = "変更が保存されていません。本当に離れますか？" } = options;

  const navigate = useCallback((path: string) => {
    if (confirmBeforeLeave) {
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }
    
    if (onNavigate) {
      onNavigate(path);
    }
    
    router.push(path);
  }, [router, onNavigate, confirmBeforeLeave, confirmMessage]);

  const navigateToCheckinComplete = useCallback((type: 'checkin' | 'checkout', guestId: string) => {
    const path = `/checkin/complete?type=${type}&guestId=${guestId}`;
    navigate(path);
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const navigateToLogin = useCallback(() => {
    navigate("/admin/login");
  }, [navigate]);

  const navigateToCheckin = useCallback(() => {
    navigate("/checkin");
  }, [navigate]);

  const navigateToCheckout = useCallback(() => {
    navigate("/checkout");
  }, [navigate]);

  const navigateToAdmin = useCallback(() => {
    navigate("/admin/dashboard");
  }, [navigate]);

  const navigateBack = useCallback(() => {
    router.back();
  }, [router]);

  const replace = useCallback((path: string) => {
    router.replace(path);
  }, [router]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return {
    navigate,
    navigateToCheckinComplete,
    navigateToHome,
    navigateToLogin,
    navigateToCheckin,
    navigateToCheckout,
    navigateToAdmin,
    navigateBack,
    replace,
    refresh,
  };
}