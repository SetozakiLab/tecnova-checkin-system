import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CheckinStatusBadge,
  GradeStatusBadge,
  StatusBadge,
} from "../status-badge";

describe("StatusBadge Components", () => {
  describe("StatusBadge", () => {
    it("renders with active status", () => {
      render(<StatusBadge status="active">チェックイン中</StatusBadge>);
      expect(screen.getByText("チェックイン中")).toBeInTheDocument();
    });

    it("renders with different status variants", () => {
      const statuses = [
        "active",
        "inactive",
        "pending",
        "error",
        "info",
      ] as const;

      statuses.forEach((status) => {
        const { rerender } = render(
          <StatusBadge status={status}>Test</StatusBadge>,
        );
        expect(screen.getByText("Test")).toBeInTheDocument();
        rerender(<div />);
      });
    });

    it("supports custom className and props", () => {
      render(
        <StatusBadge
          status="active"
          className="custom-class"
          data-testid="status-badge"
        >
          Test
        </StatusBadge>,
      );

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("custom-class");
    });
  });

  describe("CheckinStatusBadge", () => {
    it("renders checkin status correctly", () => {
      render(<CheckinStatusBadge isActive={true} />);
      expect(screen.getByText("チェックイン中")).toBeInTheDocument();
    });

    it("renders checkout status correctly", () => {
      render(<CheckinStatusBadge isActive={false} />);
      expect(screen.getByText("チェックアウト済み")).toBeInTheDocument();
    });
  });

  describe("GradeStatusBadge", () => {
    it("renders grade when provided", () => {
      render(<GradeStatusBadge grade="ES1" />);
      expect(screen.getByText("ES1")).toBeInTheDocument();
    });

    it("renders default text when grade is null", () => {
      render(<GradeStatusBadge grade={null} />);
      expect(screen.getByText("学年未設定")).toBeInTheDocument();
    });

    it("renders default text when grade is undefined", () => {
      render(<GradeStatusBadge grade={undefined} />);
      expect(screen.getByText("学年未設定")).toBeInTheDocument();
    });
  });
});
