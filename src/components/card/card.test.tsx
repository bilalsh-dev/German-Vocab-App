import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import messages from "../../../messages/en.json";
import type { Card, Gender, PartOfSpeech } from "@/lib/content";

import { CardPrompt } from "./card-prompt";
import { CardReveal } from "./card-reveal";
import { GermanDetail } from "./german-detail";
import { GermanWord } from "./german-word";

function renderWithIntl(ui: ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "c1",
    deckId: "d1",
    partOfSpeech: "noun" as PartOfSpeech,
    english: "house",
    german: "Haus",
    vowelMarks: [],
    related: [],
    examples: [],
    topic: "Wohnen",
    tags: [],
    scheduling: {
      algorithm: "fsrs",
      due: 0,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: "new",
    },
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

const nounCard = makeCard({
  partOfSpeech: "noun",
  english: "house",
  german: "Haus",
  noun: { gender: "neuter", plural: "Häuser" },
  examples: [{ de: "Das Haus ist groß.", en: "The house is big." }],
});

const verbCard = makeCard({
  partOfSpeech: "verb",
  english: "to go",
  german: "gehen",
  verb: {
    praesens: "geht",
    praeteritum: "ging",
    perfekt: "gegangen",
    auxiliary: "sein",
  },
  examples: [
    { de: "Er geht nach Hause.", en: "He goes home.", verbForm: "praesens" },
  ],
});

const adjectiveCard = makeCard({
  partOfSpeech: "adjective",
  english: "big",
  german: "groß",
  adjective: { opposites: ["klein"], synonyms: ["riesig"] },
});

describe("GermanWord", () => {
  it("marks long and short vowels with the styling classes", () => {
    const { container } = render(
      <GermanWord
        word="Tag"
        vowelMarks={[{ index: 1, length: "long" }]}
      />,
    );
    const long = container.querySelector(".vowel-long");
    expect(long).not.toBeNull();
    expect(long?.textContent).toBe("a");
    expect(container.querySelector(".vowel-short")).toBeNull();
  });

  it("renders a short-vowel mark under the correct character", () => {
    const { container } = render(
      <GermanWord word="Mann" vowelMarks={[{ index: 1, length: "short" }]} />,
    );
    const short = container.querySelector(".vowel-short");
    expect(short?.textContent).toBe("a");
  });
});

describe("CardPrompt", () => {
  it("renders the English headword as plain text on the English side", () => {
    renderWithIntl(<CardPrompt card={nounCard} promptSide="english" />);
    expect(screen.getByText("house")).toBeInTheDocument();
    expect(screen.queryByText("Haus")).not.toBeInTheDocument();
  });

  it("renders the German headword with gender color on the German side", () => {
    const { container } = renderWithIntl(
      <CardPrompt card={nounCard} promptSide="german" />,
    );
    expect(container.querySelector(".text-gender-neuter")).not.toBeNull();
  });
});

describe("CardReveal — noun", () => {
  it("renders the full German block with article, plural, and examples", () => {
    renderWithIntl(<CardReveal card={nounCard} promptSide="english" />);
    expect(screen.getByText("das")).toBeInTheDocument();
    expect(screen.getByText(/Häuser/)).toBeInTheDocument();
    expect(screen.getByText("Das Haus ist groß.")).toBeInTheDocument();
  });

  it("shows the English headword on the reveal when prompting in German", () => {
    renderWithIntl(<CardReveal card={nounCard} promptSide="german" />);
    expect(screen.getByText("house")).toBeInTheDocument();
    expect(screen.getByText("das")).toBeInTheDocument();
  });
});

describe("CardReveal — verb", () => {
  it("renders Präsens / Präteritum / Perfekt with the auxiliary", () => {
    renderWithIntl(<CardReveal card={verbCard} promptSide="english" />);
    expect(screen.getAllByText("Präsens").length).toBeGreaterThan(0);
    expect(screen.getByText("Präteritum")).toBeInTheDocument();
    expect(screen.getByText("Perfekt")).toBeInTheDocument();
    expect(screen.getByText("geht")).toBeInTheDocument();
    expect(screen.getByText(/\(sein\)/)).toBeInTheDocument();
  });
});

describe("CardReveal — adjective", () => {
  it("renders opposites and synonyms as chips", () => {
    renderWithIntl(<CardReveal card={adjectiveCard} promptSide="english" />);
    expect(screen.getByText("Opposites")).toBeInTheDocument();
    expect(screen.getByText("klein")).toBeInTheDocument();
    expect(screen.getByText("Synonyms")).toBeInTheDocument();
    expect(screen.getByText("riesig")).toBeInTheDocument();
  });
});

describe("GermanDetail gender colors", () => {
  const cases: Array<{ gender: Gender; german: string; cls: string }> = [
    { gender: "masculine", german: "Mann", cls: ".text-gender-masc" },
    { gender: "feminine", german: "Frau", cls: ".text-gender-fem" },
    { gender: "neuter", german: "Kind", cls: ".text-gender-neuter" },
  ];

  it.each(cases)(
    "colors $gender nouns with $cls",
    ({ gender, german, cls }) => {
      const card = makeCard({
        partOfSpeech: "noun",
        german,
        noun: { gender, plural: "" },
      });
      const { container } = renderWithIntl(<GermanDetail card={card} />);
      expect(container.querySelector(cls)).not.toBeNull();
    },
  );

  it("shows the gender-ending hint when a suffix rule applies", () => {
    const card = makeCard({
      partOfSpeech: "noun",
      german: "Zeitung",
      noun: { gender: "feminine", plural: "Zeitungen" },
    });
    renderWithIntl(<GermanDetail card={card} />);
    expect(screen.getByText(/-ung/)).toBeInTheDocument();
  });
});

describe("shared German block", () => {
  it("renders identically whether German is the prompt or the reveal", () => {
    const { container: asReveal } = renderWithIntl(
      <CardReveal card={nounCard} promptSide="english" />,
    );
    const { container: asPrompt } = renderWithIntl(
      <CardReveal card={nounCard} promptSide="german" />,
    );

    const revealBlock = within(asReveal);
    const promptBlock = within(asPrompt);
    expect(revealBlock.getByText("das")).toBeInTheDocument();
    expect(promptBlock.getByText("das")).toBeInTheDocument();
    expect(revealBlock.getByText(/Häuser/)).toBeInTheDocument();
    expect(promptBlock.getByText(/Häuser/)).toBeInTheDocument();
    expect(revealBlock.getByText("Das Haus ist groß.")).toBeInTheDocument();
    expect(promptBlock.getByText("Das Haus ist groß.")).toBeInTheDocument();
  });
});
