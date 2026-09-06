import type { ReactNode } from "react";

import {
  isRichTextDocument,
  isSafeHttpUrl,
  type RichTextDocument,
  type RichTextMark,
  type RichTextNode,
} from "./contract";

function renderMarkedText(text: string, marks: RichTextMark[] = []) {
  return marks.reduce<ReactNode>((content, mark, index) => {
    if (mark.type === "bold") return <strong key={index}>{content}</strong>;
    if (mark.type === "italic") return <em key={index}>{content}</em>;
    if (mark.type === "strike") return <s key={index}>{content}</s>;
    if (mark.type === "code")
      return (
        <code
          key={index}
          className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]"
        >
          {content}
        </code>
      );
    if (mark.type === "link" && isSafeHttpUrl(mark.attrs?.href))
      return (
        <a
          key={index}
          href={mark.attrs.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4"
        >
          {content}
        </a>
      );
    return content;
  }, text);
}

function renderChildren(node: RichTextNode) {
  return node.content?.map((child, index) => renderNode(child, index));
}

function renderNode(node: RichTextNode, key: number): ReactNode {
  if (node.type === "text")
    return (
      <span key={key}>{renderMarkedText(node.text ?? "", node.marks)}</span>
    );
  if (node.type === "hardBreak") return <br key={key} />;
  if (node.type === "paragraph") return <p key={key}>{renderChildren(node)}</p>;
  if (node.type === "heading") {
    const level = node.attrs?.level;
    if (level === 3) return <h3 key={key}>{renderChildren(node)}</h3>;
    return <h2 key={key}>{renderChildren(node)}</h2>;
  }
  if (node.type === "bulletList")
    return <ul key={key}>{renderChildren(node)}</ul>;
  if (node.type === "orderedList")
    return <ol key={key}>{renderChildren(node)}</ol>;
  if (node.type === "listItem")
    return <li key={key}>{renderChildren(node)}</li>;
  if (node.type === "blockquote")
    return <blockquote key={key}>{renderChildren(node)}</blockquote>;
  if (node.type === "codeBlock")
    return (
      <pre key={key}>
        <code>{node.content?.map((child) => child.text ?? "").join("")}</code>
      </pre>
    );
  if (node.type === "horizontalRule") return <hr key={key} />;
  if (node.type === "table")
    return (
      <div key={key} className="overflow-x-auto">
        <table>
          <tbody>{renderChildren(node)}</tbody>
        </table>
      </div>
    );
  if (node.type === "tableRow")
    return <tr key={key}>{renderChildren(node)}</tr>;
  if (node.type === "tableHeader")
    return <th key={key}>{renderChildren(node)}</th>;
  if (node.type === "tableCell")
    return <td key={key}>{renderChildren(node)}</td>;
  if (node.type === "callout")
    return (
      <aside key={key} className="rich-text-callout">
        {renderChildren(node)}
      </aside>
    );
  return null;
}

export function RichTextRenderer({ content }: { content: unknown }) {
  if (!isRichTextDocument(content)) return null;
  const document: RichTextDocument = content;
  return (
    <div className="rich-text-content">
      {document.content.map((node, index) => renderNode(node, index))}
    </div>
  );
}
