import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface UseConfirmDeleteOptions<T> {
  /** 実際の削除処理。成功時は値を返す（不要なら void 可） */
  action: (target: T) => Promise<unknown> | unknown;
  /** 成功トーストメッセージ。関数なら返り値で動的組み立て */
  successMessage?: string | ((target: T) => string);
  /** 失敗時メッセージ（API が既に detail を返す場合は上書きされる可能性あり） */
  errorMessage?: string;
  /** 成功後に呼びたいコールバック（データ再取得など） */
  onSuccess?: (target: T) => void | Promise<void>;
  /** 失敗後に呼びたいコールバック */
  onError?: (err: unknown, target: T) => void | Promise<void>;
}

interface State<T> {
  open: boolean;
  target: T | null;
  loading: boolean;
  error: string;
}

export function useConfirmDelete<T>(options: UseConfirmDeleteOptions<T>) {
  const {
    action,
    successMessage,
    errorMessage = "削除に失敗しました",
    onSuccess,
    onError,
  } = options;
  const [state, setState] = useState<State<T>>({
    open: false,
    target: null,
    loading: false,
    error: "",
  });

  const open = useCallback((target: T) => {
    setState({ open: true, target, loading: false, error: "" });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const confirm = useCallback(async () => {
    if (!state.target || state.loading) return;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      await action(state.target);
      // 先に閉じる
      const targetRef = state.target;
      setState((s) => ({ ...s, open: false, loading: false }));
      // トースト
      const msg =
        typeof successMessage === "function"
          ? successMessage(targetRef)
          : successMessage || "削除しました";
      toast.success(msg);
      if (onSuccess) await onSuccess(targetRef);
    } catch (err: unknown) {
      const apiMsg =
        (err as { message?: string } | undefined)?.message || errorMessage;
      setState((s) => ({ ...s, loading: false, error: apiMsg }));
      toast.error(apiMsg);
      if (onError) await onError(err, state.target as T);
    }
  }, [
    state.target,
    state.loading,
    action,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  ]);

  return {
    open: state.open,
    target: state.target,
    loading: state.loading,
    error: state.error,
    openDialog: open,
    closeDialog: close,
    confirm,
  } as const;
}
