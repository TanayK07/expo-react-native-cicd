import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyButton from "../CopyButton";

// navigator.clipboard is a getter-only property in jsdom.
// jest.setup.ts sets it via Object.assign which silently no-ops on getter-only props.
// The next/jest wrapper provides a working clipboard mock automatically.
// Tests here focus on behavioral outcomes (RTL best practice).

describe("CopyButton", () => {
  it("renders a button with 'Copy' text initially", () => {
    render(<CopyButton textToCopy="hello world" />);
    expect(
      screen.getByRole("button", { name: /copy to clipboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Copy");
  });

  it("has correct aria-label for accessibility", () => {
    render(<CopyButton textToCopy="test" />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Copy to clipboard",
    );
  });

  it("shows 'Copied!' feedback after a successful clipboard write", async () => {
    const user = userEvent.setup();
    render(<CopyButton textToCopy="some text" />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("Copied!");
    });
  });

  it("resets back to 'Copy' after 2 seconds", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ delay: null });

    render(<CopyButton textToCopy="some text" />);
    await user.click(screen.getByRole("button"));

    // After click, should show "Copied!"
    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("Copied!");
    });

    // Advance 2 seconds → the setTimeout resets state back to "Copy"
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByRole("button")).toHaveTextContent("Copy");
    jest.useRealTimers();
  });
});
