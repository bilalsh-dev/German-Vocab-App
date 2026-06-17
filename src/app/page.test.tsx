import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the ghost AI label", () => {
    render(<Home />);
    expect(screen.getByText("ghost AI")).toBeInTheDocument();
  });
});
