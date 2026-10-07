import { act, render, screen } from "@testing-library/react";
import i18n from "i18next";

import {
  englishSchemaText,
  useSchemaText,
} from "@/components/schemaForm/schemaText";

import en from "@/locales/schema.en.json";

// The strings of the language are the ones of the locale file, these two keys
// are made to differ from English
vi.mock("@/locales/schema.de.json", () => ({
  default: { "schema.game.exports.layouts": "Deutscher Text" },
}));

vi.mock("@/locales/schema.zh.json", () => ({
  default: { "schema.game.exports.layouts": "中文文本" },
}));

const layouts = "schema.game.exports.layouts";
const background = "schema.game.exports.background";

const Text = ({ value }) => <p>{useSchemaText()(value)}</p>;

describe("the text of a schema description", () => {
  afterEach(() => act(() => i18n.changeLanguage("en")));

  it("is English by default", () => {
    render(<Text value={layouts} />);
    expect(screen.getByText(en[layouts])).toBeInTheDocument();
  });

  it("follows a switch from one language to the next", async () => {
    // runs before any other test loads German: the cache is per module
    render(<Text value={layouts} />);
    await act(() => i18n.changeLanguage("de"));
    expect(await screen.findByText("Deutscher Text")).toBeInTheDocument();
    await act(() => i18n.changeLanguage("zh"));
    expect(await screen.findByText("中文文本")).toBeInTheDocument();
  });

  it("is the text of the language once it is loaded", async () => {
    await act(() => i18n.changeLanguage("de"));
    render(<Text value={layouts} />);
    expect(await screen.findByText("Deutscher Text")).toBeInTheDocument();
  });

  it("falls back to English for a key the language has no text for", async () => {
    await act(() => i18n.changeLanguage("de"));
    render(<Text value={background} />);
    expect(screen.getByText(en[background])).toBeInTheDocument();
  });

  it("passes on text that is not a key", () => {
    render(<Text value="Plain text." />);
    expect(screen.getByText("Plain text.")).toBeInTheDocument();
  });
});

describe("englishSchemaText", () => {
  it("is the English text, whatever the language", () => {
    expect(englishSchemaText(layouts)).toBe(en[layouts]);
    expect(englishSchemaText("Plain text.")).toBe("Plain text.");
  });
});
