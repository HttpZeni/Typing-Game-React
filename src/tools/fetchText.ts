import texts from "../data/texts.json";

type TextLength = "short" | "medium" | "long";
type TextEntry = {
  title: string;
  short: string;
  medium: string;
  long: string;
};

const typedTexts = texts as TextEntry[];

export type TextSelection = {
  title: string;
  text: string;
};

export function get_text(length: TextLength): TextSelection {
  const randomIndex = Math.floor(Math.random() * typedTexts.length);
  const entry = typedTexts[randomIndex];
  return { title: entry.title, text: entry[length] };
}
