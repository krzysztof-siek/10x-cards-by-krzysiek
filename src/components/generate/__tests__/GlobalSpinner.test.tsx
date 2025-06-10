import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GlobalSpinner } from "../GlobalSpinner";

describe("GlobalSpinner", () => {
  it("renders with loading text", () => {
    render(<GlobalSpinner />);

    expect(screen.getByText("Generowanie fiszek...")).toBeInTheDocument();
    expect(screen.getByText("To może chwilę potrwać")).toBeInTheDocument();
  });

  it("renders a spinner animation element", () => {
    render(<GlobalSpinner />);

    const spinnerElement = document.querySelector(".animate-spin");
    expect(spinnerElement).toBeInTheDocument();
  });

  it("has a semi-transparent background overlay", () => {
    render(<GlobalSpinner />);

    const overlay = document.querySelector(".bg-black\\/50");
    expect(overlay).toBeInTheDocument();
  });

  it("should match snapshot", () => {
    const { container } = render(<GlobalSpinner />);
    expect(container).toMatchSnapshot();
  });
});
