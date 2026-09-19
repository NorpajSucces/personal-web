"use client";

import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEffect, useRef, useState } from "react";

import { uploadMedia } from "@/features/media/actions";
import { isSafeHttpUrl, type RichTextDocument } from "./contract";
import { createRichTextExtensions } from "./extensions";

type ToolbarButtonProps = {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

function ToolbarButton({
  active,
  children,
  disabled = false,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      className="min-h-9 rounded-md border px-2.5 text-sm font-medium aria-pressed:border-primary aria-pressed:bg-accent aria-pressed:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function deleteSlash(editor: Editor) {
  const position = editor.state.selection.from;
  return editor
    .chain()
    .focus()
    .deleteRange({ from: position - 1, to: position });
}

const slashCommands = [
  {
    label: "Heading 2",
    description: "Start a main section",
    run: (editor: Editor) => deleteSlash(editor).setHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    description: "Start a subsection",
    run: (editor: Editor) => deleteSlash(editor).setHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet list",
    description: "Create an unordered list",
    run: (editor: Editor) => deleteSlash(editor).toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    description: "Create an ordered list",
    run: (editor: Editor) => deleteSlash(editor).toggleOrderedList().run(),
  },
  {
    label: "Quote",
    description: "Highlight a quotation",
    run: (editor: Editor) => deleteSlash(editor).toggleBlockquote().run(),
  },
  {
    label: "Code block",
    description: "Insert preformatted code",
    run: (editor: Editor) => deleteSlash(editor).toggleCodeBlock().run(),
  },
  {
    label: "Divider",
    description: "Separate two sections",
    run: (editor: Editor) => deleteSlash(editor).setHorizontalRule().run(),
  },
  {
    label: "Callout",
    description: "Emphasize supporting context",
    run: (editor: Editor) => deleteSlash(editor).wrapIn("callout").run(),
  },
] as const;

export function RichTextEditor({
  ariaDescribedBy,
  ariaInvalid = false,
  ariaLabel = "Rich text content",
  value,
  onChange,
}: {
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
  ariaLabel?: string;
  value: RichTextDocument;
  onChange: (value: RichTextDocument) => void;
}) {
  const [slashOpen, setSlashOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: createRichTextExtensions(),
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
        role: "textbox",
        "aria-label": ariaLabel,
        "aria-multiline": "true",
      },
    },
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getJSON() as RichTextDocument);
      const { $from, empty } = currentEditor.state.selection;
      const previousCharacter = $from.parent.textBetween(
        Math.max(0, $from.parentOffset - 1),
        $from.parentOffset,
      );
      setSlashOpen(empty && previousCharacter === "/");
    },
    onSelectionUpdate({ editor: currentEditor }) {
      const { $from, empty } = currentEditor.state.selection;
      const previousCharacter = $from.parent.textBetween(
        Math.max(0, $from.parentOffset - 1),
        $from.parentOffset,
      );
      setSlashOpen(empty && previousCharacter === "/");
    },
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor?.isActive("bold") ?? false,
      italic: currentEditor?.isActive("italic") ?? false,
      strike: currentEditor?.isActive("strike") ?? false,
      code: currentEditor?.isActive("code") ?? false,
      heading2: currentEditor?.isActive("heading", { level: 2 }) ?? false,
      heading3: currentEditor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: currentEditor?.isActive("bulletList") ?? false,
      orderedList: currentEditor?.isActive("orderedList") ?? false,
      blockquote: currentEditor?.isActive("blockquote") ?? false,
      codeBlock: currentEditor?.isActive("codeBlock") ?? false,
      callout: currentEditor?.isActive("callout") ?? false,
      table: currentEditor?.isActive("table") ?? false,
      canUndo: currentEditor?.can().chain().focus().undo().run() ?? false,
      canRedo: currentEditor?.can().chain().focus().redo().run() ?? false,
    }),
  });

  useEffect(() => {
    if (!editor) return;
    const element = editor.view.dom;
    element.setAttribute("aria-label", ariaLabel);
    element.setAttribute("aria-invalid", String(ariaInvalid));
    if (ariaDescribedBy)
      element.setAttribute("aria-describedby", ariaDescribedBy);
    else element.removeAttribute("aria-describedby");
  }, [ariaDescribedBy, ariaInvalid, ariaLabel, editor]);

  if (!editor || !state) {
    return (
      <div
        role="status"
        className="min-h-64 rounded-lg border bg-background p-4 text-sm text-muted-foreground"
      >
        Loading editor…
      </div>
    );
  }
  const currentEditor = editor;

  async function insertImage(file: File | undefined) {
    if (!file || imageUploading) return;
    setImageUploading(true);
    setImageMessage("");
    const formData = new FormData();
    formData.set("category", "editor");
    formData.set("file", file);
    try {
      const result = await uploadMedia(formData);
      setImageMessage(result.message);
      if (result.status === "success" && result.path) {
        currentEditor
          .chain()
          .focus()
          .insertContent({
            type: "image",
            attrs: { path: result.path, alt: file.name, title: null },
          })
          .run();
      }
    } catch {
      setImageMessage("The image could not be uploaded. Try again.");
    } finally {
      setImageUploading(false);
    }
  }

  function closeLinkEditor() {
    setLinkOpen(false);
    currentEditor.commands.focus();
  }

  function applyLink() {
    const href = linkUrl.trim();
    if (!isSafeHttpUrl(href)) {
      setLinkError("Enter a valid http:// or https:// URL.");
      return;
    }
    currentEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href })
      .run();
    setLinkError("");
    setLinkOpen(false);
  }

  function openLinkEditor() {
    const currentHref = currentEditor.getAttributes("link").href;
    setLinkUrl(typeof currentHref === "string" ? currentHref : "https://");
    setLinkError("");
    setLinkOpen(true);
  }

  return (
    <div
      className="relative rounded-lg border bg-background"
      onDragOver={(event) => {
        if (
          Array.from(event.dataTransfer.items).some(
            (item) => item.kind === "file",
          )
        ) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        const file = Array.from(event.dataTransfer.files).find((item) =>
          item.type.startsWith("image/"),
        );
        if (!file) return;
        event.preventDefault();
        void insertImage(file);
      }}
      onPasteCapture={(event) => {
        const file = Array.from(event.clipboardData.files).find((item) =>
          item.type.startsWith("image/"),
        );
        if (!file) return;
        event.preventDefault();
        void insertImage(file);
      }}
    >
      <div
        role="toolbar"
        aria-label="Rich text formatting"
        className="flex flex-wrap gap-2 border-b p-3"
      >
        <ToolbarButton
          active={state.heading2}
          label="Heading 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={state.heading3}
          label="Heading 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={state.bold}
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={state.italic}
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          active={state.strike}
          label="Strike"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </ToolbarButton>
        <ToolbarButton
          active={state.code}
          label="Inline code"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          Code
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("link")}
          label="Add or edit link"
          onClick={openLinkEditor}
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          active={state.bulletList}
          label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </ToolbarButton>
        <ToolbarButton
          active={state.orderedList}
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbers
        </ToolbarButton>
        <ToolbarButton
          active={state.blockquote}
          label="Blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </ToolbarButton>
        <ToolbarButton
          active={state.codeBlock}
          label="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code block
        </ToolbarButton>
        <ToolbarButton
          label="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Divider
        </ToolbarButton>
        <ToolbarButton
          active={state.callout}
          label="Callout"
          onClick={() => {
            if (state.callout) editor.chain().focus().lift("callout").run();
            else editor.chain().focus().wrapIn("callout").run();
          }}
        >
          Callout
        </ToolbarButton>
        <ToolbarButton
          label="Insert table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Table
        </ToolbarButton>
        <ToolbarButton
          disabled={imageUploading}
          label="Insert image"
          onClick={() => imageInputRef.current?.click()}
        >
          {imageUploading ? "Uploading…" : "Image"}
        </ToolbarButton>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            void insertImage(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <ToolbarButton
          disabled={!state.canUndo}
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          disabled={!state.canRedo}
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </ToolbarButton>
      </div>

      {linkOpen ? (
        <div
          role="group"
          aria-label="Link settings"
          className="flex flex-wrap items-start gap-2 border-b bg-card p-3"
        >
          <div className="min-w-52 flex-1">
            <label htmlFor="rich-text-link" className="sr-only">
              Link URL
            </label>
            <input
              id="rich-text-link"
              value={linkUrl}
              type="url"
              autoFocus
              aria-invalid={Boolean(linkError)}
              aria-describedby={linkError ? "rich-text-link-error" : undefined}
              className="min-h-10 w-full rounded-md border bg-background px-3 text-sm"
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
                if (event.key === "Escape") closeLinkEditor();
              }}
            />
            {linkError ? (
              <p
                id="rich-text-link-error"
                className="mt-1 text-sm text-destructive"
              >
                {linkError}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="min-h-10 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
            onClick={applyLink}
          >
            Apply
          </button>
          {editor.isActive("link") ? (
            <button
              type="button"
              className="min-h-10 rounded-md border px-3 text-sm"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setLinkOpen(false);
              }}
            >
              Remove
            </button>
          ) : null}
          <button
            type="button"
            className="min-h-10 rounded-md px-3 text-sm text-muted-foreground"
            onClick={closeLinkEditor}
          >
            Cancel
          </button>
        </div>
      ) : null}

      {state.table ? (
        <div
          className="flex flex-wrap gap-2 border-b bg-card p-3"
          aria-label="Table controls"
        >
          <ToolbarButton
            label="Add column"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            Add column
          </ToolbarButton>
          <ToolbarButton
            label="Delete column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            Delete column
          </ToolbarButton>
          <ToolbarButton
            label="Add row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            Add row
          </ToolbarButton>
          <ToolbarButton
            label="Delete row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            Delete row
          </ToolbarButton>
          <ToolbarButton
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Delete table
          </ToolbarButton>
        </div>
      ) : null}

      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: currentEditor, from, to }) =>
          from !== to && !currentEditor.isActive("codeBlock")
        }
      >
        <div className="flex gap-1 rounded-lg border bg-popover p-1 shadow-lg">
          <ToolbarButton
            active={state.bold}
            label="Bold selection"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            active={state.italic}
            label="Italic selection"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            I
          </ToolbarButton>
          <ToolbarButton
            active={state.strike}
            label="Strike selection"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            S
          </ToolbarButton>
          <ToolbarButton label="Link selection" onClick={openLinkEditor}>
            Link
          </ToolbarButton>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />

      {slashOpen ? (
        <div
          role="region"
          aria-label="Insert block commands"
          className="absolute right-3 left-3 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover p-2 shadow-xl sm:right-auto sm:w-80"
        >
          <p className="px-2 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Insert block
          </p>
          {slashCommands.map((command) => (
            <button
              key={command.label}
              type="button"
              className="block w-full rounded-md px-2 py-2 text-left hover:bg-accent"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                command.run(editor);
                setSlashOpen(false);
              }}
            >
              <span className="block text-sm font-medium">{command.label}</span>
              <span className="block text-xs text-muted-foreground">
                {command.description}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="border-t px-3 py-2 text-xs text-muted-foreground">
        {imageMessage ||
          "Type / to insert a block. Drop or paste an image anywhere in the editor."}
      </p>
    </div>
  );
}
