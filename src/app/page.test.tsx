import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";
import DecksPage from "./page";

describe("Decks page", () => {
  it("renders the Decks heading", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <DecksPage />
      </NextIntlClientProvider>,
    );
    expect(
      screen.getByRole("heading", { name: "Decks" }),
    ).toBeInTheDocument();
  });
});
