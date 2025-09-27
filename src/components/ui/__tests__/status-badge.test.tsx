import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { 
  StatusBadge, 
  LegacyStatusBadge, 
  CheckinStatusBadge, 
  GradeStatusBadge 
} from "../status-badge";

describe("StatusBadge Components", () => {
  describe("StatusBadge", () => {
    it("renders with active status", () => {
      render(<StatusBadge status="active">チェックイン中</StatusBadge>);
      expect(screen.getByText("チェックイン中")).toBeInTheDocument();
    });

    it("renders with different status variants", () => {
      const statuses = ['active', 'inactive', 'pending', 'error', 'info'] as const;
      
      statuses.forEach(status => {
        const { rerender } = render(<StatusBadge status={status}>Test</StatusBadge>);
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
        </StatusBadge>
      );
      
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveClass("custom-class");
    });
  });

  describe("LegacyStatusBadge", () => {
    it("renders active state with default text", () => {
      render(<LegacyStatusBadge isActive={true} />);
      expect(screen.getByText("滞在中")).toBeInTheDocument();
    });

    it("renders inactive state with default text", () => {
      render(<LegacyStatusBadge isActive={false} />);
      expect(screen.getByText("退場済み")).toBeInTheDocument();
    });

    it("renders with custom text", () => {
      render(
        <LegacyStatusBadge 
          isActive={true} 
          activeText="オンライン" 
          inactiveText="オフライン"
        />
      );
      expect(screen.getByText("オンライン")).toBeInTheDocument();
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