import { relations } from "drizzle-orm";

import { articleTags, articleTopics, articles } from "./articles";
import {
  learningArticles,
  learningEntries,
  learningNotes,
  learningProjects,
  learningTopics,
} from "./learning";
import { noteTags, noteTopics, notes } from "./notes";
import { projects } from "./projects";
import { tags, topics } from "./taxonomy";

export const articlesRelations = relations(articles, ({ many }) => ({
  articleTopics: many(articleTopics),
  articleTags: many(articleTags),
  learningArticles: many(learningArticles),
}));

export const articleTopicsRelations = relations(articleTopics, ({ one }) => ({
  article: one(articles, {
    fields: [articleTopics.articleId],
    references: [articles.id],
  }),
  topic: one(topics, {
    fields: [articleTopics.topicId],
    references: [topics.id],
  }),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const notesRelations = relations(notes, ({ many }) => ({
  noteTopics: many(noteTopics),
  noteTags: many(noteTags),
  learningNotes: many(learningNotes),
}));

export const noteTopicsRelations = relations(noteTopics, ({ one }) => ({
  note: one(notes, {
    fields: [noteTopics.noteId],
    references: [notes.id],
  }),
  topic: one(topics, {
    fields: [noteTopics.topicId],
    references: [topics.id],
  }),
}));

export const noteTagsRelations = relations(noteTags, ({ one }) => ({
  note: one(notes, {
    fields: [noteTags.noteId],
    references: [notes.id],
  }),
  tag: one(tags, {
    fields: [noteTags.tagId],
    references: [tags.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  learningProjects: many(learningProjects),
}));

export const learningEntriesRelations = relations(
  learningEntries,
  ({ many }) => ({
    learningTopics: many(learningTopics),
    learningArticles: many(learningArticles),
    learningNotes: many(learningNotes),
    learningProjects: many(learningProjects),
  }),
);

export const learningTopicsRelations = relations(learningTopics, ({ one }) => ({
  learningEntry: one(learningEntries, {
    fields: [learningTopics.learningEntryId],
    references: [learningEntries.id],
  }),
  topic: one(topics, {
    fields: [learningTopics.topicId],
    references: [topics.id],
  }),
}));

export const learningArticlesRelations = relations(
  learningArticles,
  ({ one }) => ({
    learningEntry: one(learningEntries, {
      fields: [learningArticles.learningEntryId],
      references: [learningEntries.id],
    }),
    article: one(articles, {
      fields: [learningArticles.articleId],
      references: [articles.id],
    }),
  }),
);

export const learningNotesRelations = relations(learningNotes, ({ one }) => ({
  learningEntry: one(learningEntries, {
    fields: [learningNotes.learningEntryId],
    references: [learningEntries.id],
  }),
  note: one(notes, {
    fields: [learningNotes.noteId],
    references: [notes.id],
  }),
}));

export const learningProjectsRelations = relations(
  learningProjects,
  ({ one }) => ({
    learningEntry: one(learningEntries, {
      fields: [learningProjects.learningEntryId],
      references: [learningEntries.id],
    }),
    project: one(projects, {
      fields: [learningProjects.projectId],
      references: [projects.id],
    }),
  }),
);

export const topicsRelations = relations(topics, ({ many }) => ({
  articleTopics: many(articleTopics),
  noteTopics: many(noteTopics),
  learningTopics: many(learningTopics),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
  noteTags: many(noteTags),
}));
