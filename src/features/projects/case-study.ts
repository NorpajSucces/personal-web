export type CaseStudyBlock = {
  type: "heading" | "paragraph" | "quote" | "code" | "bullet" | "ordered";
  text?: string;
  items?: string[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textFromNode(node: unknown): string {
  if (!isObject(node)) return "";
  const ownText = typeof node.text === "string" ? node.text : "";
  const children = Array.isArray(node.content) ? node.content : [];
  return ownText + children.map(textFromNode).join("");
}

export function parseCaseStudy(value: unknown): CaseStudyBlock[] {
  if (!isObject(value) || value.type !== "doc" || !Array.isArray(value.content))
    return [];

  return value.content.flatMap((node): CaseStudyBlock[] => {
    if (!isObject(node) || typeof node.type !== "string") return [];
    const text = textFromNode(node).trim();
    if (
      ["paragraph", "heading", "blockquote", "codeBlock"].includes(node.type)
    ) {
      if (!text) return [];
      const type =
        node.type === "blockquote"
          ? "quote"
          : node.type === "codeBlock"
            ? "code"
            : node.type;
      return [{ type: type as CaseStudyBlock["type"], text }];
    }
    if (node.type === "bulletList" || node.type === "orderedList") {
      const content = Array.isArray(node.content) ? node.content : [];
      const items = content
        .map(textFromNode)
        .map((item) => item.trim())
        .filter(Boolean);
      return items.length
        ? [{ type: node.type === "bulletList" ? "bullet" : "ordered", items }]
        : [];
    }
    return [];
  });
}
