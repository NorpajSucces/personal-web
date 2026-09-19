import { mergeAttributes, Node } from "@tiptap/core";

import { getMediaUrl, isValidMediaPath } from "@/features/media/config";

export const MediaImage = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      path: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-media-path") ?? "",
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") ?? "",
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-media-path]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const path =
      typeof HTMLAttributes.path === "string" ? HTMLAttributes.path : "";
    if (!isValidMediaPath(path))
      return ["span", { "data-invalid-media": "true" }];
    const attributes = { ...HTMLAttributes };
    delete attributes.path;
    return [
      "img",
      mergeAttributes(attributes, {
        src: getMediaUrl(path),
        "data-media-path": path,
        loading: "lazy",
      }),
    ];
  },
});
