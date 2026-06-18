import { render, screen } from "@testing-library/react";
import DecksPage from "./page";

describe("Decks page", () => {
  it("renders the Decks heading", () => {
    render(<DecksPage />);
    expect(
      screen.getByRole("heading", { name: "Decks" }),
    ).toBeInTheDocument();
  });
});
