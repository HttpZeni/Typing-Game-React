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

export function getAllTitle(): string[] {
  const output: string[] = [];

  for (const option in texts) {
    const entry = texts[option] as TextEntry | undefined;
    if (entry?.title) output.push(entry.title);
  }

  return output;
}

export function get_text(length: TextLength): TextSelection {
  const randomIndex = Math.floor(Math.random() * typedTexts.length);
  const entry = typedTexts[randomIndex];
  return { title: entry.title, text: entry[length] };
}

export function getTextByTitle( title: string, length: TextLength): TextSelection | any {
  const entry = typedTexts.find(t => t.title === title);
  if (!entry) return null;
  return { title: entry.title,  text: entry[length] };
}
