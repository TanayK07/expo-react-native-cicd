import React from "react";
import { render, screen } from "@testing-library/react";
import FeatureCard from "../FeatureCard";

describe("FeatureCard", () => {
  it("renders the title", () => {
    render(<FeatureCard title="Free & Open Source" description="No cost" />);
    expect(
      screen.getByRole("heading", { name: /free & open source/i }),
    ).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(
      <FeatureCard
        title="Fast Builds"
        description="Blazing fast CI/CD pipelines"
      />,
    );
    expect(
      screen.getByText(/blazing fast ci\/cd pipelines/i),
    ).toBeInTheDocument();
  });

  it("renders an h3 element for the title", () => {
    render(<FeatureCard title="Test Title" description="Test description" />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Test Title");
  });

  it("renders both title and description together", () => {
    const { container } = render(
      <FeatureCard title="Multiple Platforms" description="Android and iOS" />,
    );
    expect(container).toHaveTextContent("Multiple Platforms");
    expect(container).toHaveTextContent("Android and iOS");
  });

  it("renders the decorative accent bar", () => {
    const { container } = render(
      <FeatureCard title="My Feature" description="My desc" />,
    );
    // The accent bar is a div with specific width class
    const bar = container.querySelector(".w-12.h-1");
    expect(bar).toBeInTheDocument();
  });
});
