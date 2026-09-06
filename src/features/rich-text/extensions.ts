import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

import { isSafeHttpUrl } from "./contract";
import { Callout } from "./callout";

export function createRichTextExtensions(placeholder = "Start writing…") {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: {
        openOnClick: false,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        validate: isSafeHttpUrl,
        shouldAutoLink: isSafeHttpUrl,
      },
      underline: false,
      undoRedo: { depth: 100 },
    }),
    TableKit,
    Callout,
    Placeholder.configure({ placeholder }),
  ];
}
