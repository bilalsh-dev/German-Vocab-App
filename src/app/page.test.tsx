import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the Wortbox label", () => {
    render(<Home />);
    expect(screen.getByText("Wortbox")).toBeInTheDocument();
  });
});
