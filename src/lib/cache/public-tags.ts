export const PUBLIC_CACHE_REVALIDATE_SECONDS = 300;

export const PUBLIC_CACHE_TAGS = {
  home: "public:home",
  projects: "public:projects",
  articles: "public:articles",
  notes: "public:notes",
  learning: "public:learning",
  taxonomy: "public:taxonomy",
} as const;
