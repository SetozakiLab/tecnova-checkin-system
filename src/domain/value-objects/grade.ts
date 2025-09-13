// Domain Value Object: Grade
// 学年を表すValue Object

export type GradeValue =
  | "ES1" // 小学1年
  | "ES2" // 小学2年
  | "ES3" // 小学3年
  | "ES4" // 小学4年
  | "ES5" // 小学5年
  | "ES6" // 小学6年
  | "JH1" // 中学1年
  | "JH2" // 中学2年
  | "JH3" // 中学3年
  | "HS1" // 高校1年
  | "HS2" // 高校2年
  | "HS3"; // 高校3年

export class Grade {
  constructor(private readonly value: GradeValue) {}

  getValue(): GradeValue {
    return this.value;
  }

  getDisplayName(): string {
    const gradeMap: Record<GradeValue, string> = {
      ES1: "小学1年",
      ES2: "小学2年",
      ES3: "小学3年",
      ES4: "小学4年",
      ES5: "小学5年",
      ES6: "小学6年",
      JH1: "中学1年",
      JH2: "中学2年",
      JH3: "中学3年",
      HS1: "高校1年",
      HS2: "高校2年",
      HS3: "高校3年",
    };
    return gradeMap[this.value];
  }

  getSchoolLevel(): "elementary" | "junior_high" | "high_school" {
    if (this.value.startsWith("ES")) return "elementary";
    if (this.value.startsWith("JH")) return "junior_high";
    return "high_school";
  }

  equals(other: Grade): boolean {
    return this.value === other.value;
  }

  static fromString(value: string): Grade | null {
    if (isValidGrade(value)) {
      return new Grade(value);
    }
    return null;
  }

  static getAllGrades(): GradeValue[] {
    return [
      "ES1",
      "ES2",
      "ES3",
      "ES4",
      "ES5",
      "ES6",
      "JH1",
      "JH2",
      "JH3",
      "HS1",
      "HS2",
      "HS3",
    ];
  }
}

export function isValidGrade(value: string): value is GradeValue {
  return Grade.getAllGrades().includes(value as GradeValue);
}

export interface GradeDefinition {
  value: GradeValue;
  label: string;
}

export const GRADE_DEFINITIONS: GradeDefinition[] = [
  { value: "ES1", label: "小学1年" },
  { value: "ES2", label: "小学2年" },
  { value: "ES3", label: "小学3年" },
  { value: "ES4", label: "小学4年" },
  { value: "ES5", label: "小学5年" },
  { value: "ES6", label: "小学6年" },
  { value: "JH1", label: "中学1年" },
  { value: "JH2", label: "中学2年" },
  { value: "JH3", label: "中学3年" },
  { value: "HS1", label: "高校1年" },
  { value: "HS2", label: "高校2年" },
  { value: "HS3", label: "高校3年" },
];

export function formatGradeDisplay(value: string | null | undefined): string {
  if (!value) return "-";
  const found = GRADE_DEFINITIONS.find((g) => g.value === value);
  return found ? found.label : value;
}
