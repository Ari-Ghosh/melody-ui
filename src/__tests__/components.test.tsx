import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SwipeCard from "@/components/SwipeCard";
import TasteRing from "@/components/TasteRing";
import ReportModal from "@/components/ReportModal";

// Mock the apiPost used by ReportModal
vi.mock("@/lib/api", () => ({
  apiPost: vi.fn().mockResolvedValue({}),
}));

describe("SwipeCard", () => {
  it("renders children content", () => {
    render(
      <SwipeCard>
        <div data-testid="child">Test Content</div>
      </SwipeCard>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders with accessible group role and keyboard support", () => {
    render(<SwipeCard><div>Content</div></SwipeCard>);
    const card = screen.getByRole("group");
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("tabindex", "0");
    expect(card).toHaveAttribute("aria-label", "Swipeable card. Use left/right arrow keys to swipe.");
  });

  it("calls onSwipeLeft on ArrowLeft key", () => {
    const onLeft = vi.fn();
    render(<SwipeCard onSwipeLeft={onLeft}><div>Content</div></SwipeCard>);
    const card = screen.getByRole("group");
    fireEvent.keyDown(card, { key: "ArrowLeft" });
    expect(onLeft).toHaveBeenCalledOnce();
  });

  it("calls onSwipeRight on ArrowRight key", () => {
    const onRight = vi.fn();
    render(<SwipeCard onSwipeRight={onRight}><div>Content</div></SwipeCard>);
    const card = screen.getByRole("group");
    fireEvent.keyDown(card, { key: "ArrowRight" });
    expect(onRight).toHaveBeenCalledOnce();
  });

  it("does not trigger swipe when disabled", () => {
    const onLeft = vi.fn();
    render(<SwipeCard disabled onSwipeLeft={onLeft}><div>Content</div></SwipeCard>);
    const card = screen.getByRole("group");
    fireEvent.keyDown(card, { key: "ArrowLeft" });
    expect(onLeft).not.toHaveBeenCalled();
  });
});

describe("TasteRing", () => {
  it("renders score percentage", () => {
    render(<TasteRing score={85} label="Strong Match" />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders match label", () => {
    render(<TasteRing score={95} label="Soulmates" />);
    expect(screen.getByText("Soulmates")).toBeInTheDocument();
  });

  it("renders with breakdown bars when provided", () => {
    const breakdown = {
      genre: 20,
      artist: 18,
      swipe: 12,
      discovery: 8,
      activity: 5,
      serendipity: 3,
    };
    render(<TasteRing score={66} breakdown={breakdown} label="Potential Match" />);
    expect(screen.getByText("Genre")).toBeInTheDocument();
    expect(screen.getByText("Artist")).toBeInTheDocument();
    expect(screen.getByText("Swipes")).toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
    expect(screen.getByText("Serendipity")).toBeInTheDocument();
  });

  it("renders all match labels correctly", () => {
    const labels = ["Soulmates", "Strong Match", "Potential Match", "Low Compatibility"];
    const scores = [95, 80, 60, 30];
    labels.forEach((label, i) => {
      const { unmount } = render(<TasteRing score={scores[i]} label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});

describe("ReportModal", () => {
  it("renders with target name", () => {
    render(<ReportModal targetUserId="user-123" targetName="John" onClose={vi.fn()} />);
    expect(screen.getByText(/Report John/)).toBeInTheDocument();
  });

  it("renders all 6 reason options", () => {
    render(<ReportModal targetUserId="user-123" targetName="John" onClose={vi.fn()} />);
    expect(screen.getByText("Harassment")).toBeInTheDocument();
    expect(screen.getByText("Bullying")).toBeInTheDocument();
    expect(screen.getByText("Hate Speech")).toBeInTheDocument();
    expect(screen.getByText("Spam")).toBeInTheDocument();
    expect(screen.getByText("Fake Profile")).toBeInTheDocument();
    expect(screen.getByText("Inappropriate Content")).toBeInTheDocument();
  });

  it("calls onClose when cancel clicked", () => {
    const onClose = vi.fn();
    render(<ReportModal targetUserId="user-123" targetName="John" onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("submit button disabled until reason selected", () => {
    render(<ReportModal targetUserId="user-123" targetName="John" onClose={vi.fn()} />);
    const submitBtn = screen.getByText("Submit Report");
    expect(submitBtn).toBeDisabled();
  });
});
