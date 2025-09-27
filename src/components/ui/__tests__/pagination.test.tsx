import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppPagination } from "../pagination";

describe("AppPagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders pagination controls", () => {
    render(<AppPagination {...defaultProps} />);
    
    expect(screen.getByText("前へ")).toBeInTheDocument();
    expect(screen.getByText("次へ")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("does not render when totalPages <= 1", () => {
    const { container } = render(
      <AppPagination {...defaultProps} totalPages={1} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("disables previous button on first page", () => {
    render(<AppPagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByText("前へ").closest('a');
    expect(prevButton).toHaveClass("pointer-events-none", "opacity-50");
  });

  it("disables next button on last page", () => {
    render(<AppPagination {...defaultProps} currentPage={5} totalPages={5} />);
    
    const nextButton = screen.getByText("次へ").closest('a');
    expect(nextButton).toHaveClass("pointer-events-none", "opacity-50");
  });

  it("calls onPageChange when clicking page numbers", () => {
    const onPageChange = vi.fn();
    render(<AppPagination {...defaultProps} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByText("3"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange when clicking previous button", () => {
    const onPageChange = vi.fn();
    render(
      <AppPagination 
        {...defaultProps} 
        currentPage={3} 
        onPageChange={onPageChange} 
      />
    );
    
    fireEvent.click(screen.getByText("前へ"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange when clicking next button", () => {
    const onPageChange = vi.fn();
    render(
      <AppPagination 
        {...defaultProps} 
        currentPage={2} 
        onPageChange={onPageChange} 
      />
    );
    
    fireEvent.click(screen.getByText("次へ"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("highlights current page", () => {
    render(<AppPagination {...defaultProps} currentPage={3} />);
    
    const currentPage = screen.getByText("3").closest('a');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it("disables all controls when loading", () => {
    render(<AppPagination {...defaultProps} loading={true} />);
    
    const prevButton = screen.getByText("前へ").closest('a');
    const nextButton = screen.getByText("次へ").closest('a');
    const pageButton = screen.getByText("2").closest('a');
    
    expect(prevButton).toHaveClass("pointer-events-none", "opacity-50");
    expect(nextButton).toHaveClass("pointer-events-none", "opacity-50");
    expect(pageButton).toHaveClass("pointer-events-none", "opacity-50");
  });

  it("shows correct page numbers for large page counts", () => {
    render(<AppPagination {...defaultProps} currentPage={10} totalPages={20} />);
    
    // Should show pages around current page (8, 9, 10, 11, 12)
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("supports custom className", () => {
    render(
      <AppPagination 
        {...defaultProps} 
        className="custom-pagination"
      />
    );
    
    const pagination = screen.getByRole("navigation");
    expect(pagination).toHaveClass("custom-pagination");
  });
});