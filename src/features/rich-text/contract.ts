export type RichTextMark = {
  type: "bold" | "italic" | "strike" | "code" | "link";
  attrs?: Record<string, unknown>;
};

export type RichTextNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
};

export type RichTextDocument = RichTextNode & {
  type: "doc";
  content: RichTextNode[];
};

export const emptyRichTextDocument: RichTextDocument = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const allowedNodes = new Set([
  "doc",
  "paragraph",
  "heading",
  "text",
  "hardBreak",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
  "callout",
]);

const allowedMarks = new Set(["bold", "italic", "strike", "code", "link"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidMark(value: unknown) {
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (!allowedMarks.has(value.type)) return false;
  if (value.type === "link")
    return isRecord(value.attrs) && isSafeHttpUrl(value.attrs.href);
  return true;
}

function isValidNode(value: unknown, depth = 0): value is RichTextNode {
  if (depth > 100 || !isRecord(value) || typeof value.type !== "string")
    return false;
  if (!allowedNodes.has(value.type)) return false;
  if (value.type === "text" && typeof value.text !== "string") return false;
  if (value.marks !== undefined) {
    if (!Array.isArray(value.marks) || !value.marks.every(isValidMark))
      return false;
  }
  if (value.content !== undefined) {
    if (
      !Array.isArray(value.content) ||
      !value.content.every((child) => isValidNode(child, depth + 1))
    )
      return false;
  }
  if (value.type === "heading") {
    if (!isRecord(value.attrs)) return false;
    const level = value.attrs.level;
    if (level !== 2 && level !== 3) return false;
  }
  return true;
}

export function isRichTextDocument(value: unknown): value is RichTextDocument {
  return (
    isValidNode(value) && value.type === "doc" && Array.isArray(value.content)
  );
}

export function hasMeaningfulRichText(document: RichTextDocument) {
  function hasText(node: RichTextNode): boolean {
    if (typeof node.text === "string" && node.text.trim().length > 0)
      return true;
    return node.content?.some(hasText) ?? false;
  }
  return document.content.some(hasText);
}

export function parseRichTextJson(value: string) {
  try {
    const parsed: unknown = JSON.parse(value);
    return isRichTextDocument(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
