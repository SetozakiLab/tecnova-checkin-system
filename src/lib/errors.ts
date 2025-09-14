export type DomainErrorCode =
  | "GUEST_NOT_FOUND"
  | "ALREADY_CHECKED_IN"
  | "NOT_CHECKED_IN"
  | "GUEST_CURRENTLY_CHECKED_IN"
  | "SEQUENCE_LIMIT_EXCEEDED"
  | "DISPLAY_ID_GENERATION_FAILED"
  | "FORBIDDEN"
  | "NOT_FOUND";

const codeMessage: Record<DomainErrorCode, string> = {
  GUEST_NOT_FOUND: "ゲストが見つかりません",
  ALREADY_CHECKED_IN: "既にチェックインしています",
  NOT_CHECKED_IN: "チェックインしていません",
  GUEST_CURRENTLY_CHECKED_IN: "現在チェックイン中のゲストは削除できません",
  SEQUENCE_LIMIT_EXCEEDED: "年間登録上限に達しました",
  DISPLAY_ID_GENERATION_FAILED: "表示ID生成に失敗しました",
  FORBIDDEN: "権限がありません",
  NOT_FOUND: "対象が見つかりません",
};

const codeStatus: Record<DomainErrorCode, number> = {
  GUEST_NOT_FOUND: 404,
  ALREADY_CHECKED_IN: 400,
  NOT_CHECKED_IN: 400,
  GUEST_CURRENTLY_CHECKED_IN: 400,
  SEQUENCE_LIMIT_EXCEEDED: 500,
  DISPLAY_ID_GENERATION_FAILED: 500,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  public readonly status: number;
  constructor(code: DomainErrorCode, message?: string) {
    super(message ?? codeMessage[code]);
    this.code = code;
    this.status = codeStatus[code];
  }
}

export function isDomainError(e: unknown): e is DomainError {
  return e instanceof DomainError;
}

export function domain(code: DomainErrorCode, message?: string): DomainError {
  return new DomainError(code, message);
}
