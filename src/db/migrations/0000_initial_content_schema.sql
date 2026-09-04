CREATE TYPE "public"."learning_status" AS ENUM('exploring', 'learning', 'practicing');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "article_tags_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "article_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "article_topics" (
	"article_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	CONSTRAINT "article_topics_pk" PRIMARY KEY("article_id","topic_id")
);
--> statement-breakpoint
ALTER TABLE "article_topics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" jsonb NOT NULL,
	"cover_image_path" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "articles_title_not_blank" CHECK (length(btrim("articles"."title")) > 0),
	CONSTRAINT "articles_slug_not_blank" CHECK (length(btrim("articles"."slug")) > 0)
);
--> statement-breakpoint
ALTER TABLE "articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "home_content" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"hero_title" text NOT NULL,
	"hero_description" text NOT NULL,
	"about_title" text NOT NULL,
	"about_content" text NOT NULL,
	"contact_title" text NOT NULL,
	"contact_description" text NOT NULL,
	"public_email" text,
	"github_url" text,
	"linkedin_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "home_content_singleton" CHECK ("home_content"."id" = 1),
	CONSTRAINT "home_content_hero_title_not_blank" CHECK (length(btrim("home_content"."hero_title")) > 0),
	CONSTRAINT "home_content_about_title_not_blank" CHECK (length(btrim("home_content"."about_title")) > 0),
	CONSTRAINT "home_content_contact_title_not_blank" CHECK (length(btrim("home_content"."contact_title")) > 0)
);
--> statement-breakpoint
ALTER TABLE "home_content" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "learning_articles" (
	"learning_entry_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	CONSTRAINT "learning_articles_pk" PRIMARY KEY("learning_entry_id","article_id")
);
--> statement-breakpoint
ALTER TABLE "learning_articles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "learning_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"learning_status" "learning_status" DEFAULT 'exploring' NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_entries_title_not_blank" CHECK (length(btrim("learning_entries"."title")) > 0)
);
--> statement-breakpoint
ALTER TABLE "learning_entries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "learning_notes" (
	"learning_entry_id" uuid NOT NULL,
	"note_id" uuid NOT NULL,
	CONSTRAINT "learning_notes_pk" PRIMARY KEY("learning_entry_id","note_id")
);
--> statement-breakpoint
ALTER TABLE "learning_notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "learning_projects" (
	"learning_entry_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	CONSTRAINT "learning_projects_pk" PRIMARY KEY("learning_entry_id","project_id")
);
--> statement-breakpoint
ALTER TABLE "learning_projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "learning_topics" (
	"learning_entry_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	CONSTRAINT "learning_topics_pk" PRIMARY KEY("learning_entry_id","topic_id")
);
--> statement-breakpoint
ALTER TABLE "learning_topics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "note_tags" (
	"note_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "note_tags_pk" PRIMARY KEY("note_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "note_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "note_topics" (
	"note_id" uuid NOT NULL,
	"topic_id" uuid NOT NULL,
	CONSTRAINT "note_topics_pk" PRIMARY KEY("note_id","topic_id")
);
--> statement-breakpoint
ALTER TABLE "note_topics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" jsonb NOT NULL,
	"cover_image_path" text,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notes_slug_unique" UNIQUE("slug"),
	CONSTRAINT "notes_title_not_blank" CHECK (length(btrim("notes"."title")) > 0),
	CONSTRAINT "notes_slug_not_blank" CHECK (length(btrim("notes"."slug")) > 0)
);
--> statement-breakpoint
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"screenshot_path" text,
	"github_url" text,
	"live_demo_url" text,
	"technologies" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"project_status" "project_status" DEFAULT 'in_progress' NOT NULL,
	"publication_status" "publication_status" DEFAULT 'draft' NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"case_study" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_name_not_blank" CHECK (length(btrim("projects"."name")) > 0),
	CONSTRAINT "projects_slug_not_blank" CHECK (length(btrim("projects"."slug")) > 0)
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tags_name_not_blank" CHECK (length(btrim("tags"."name")) > 0),
	CONSTRAINT "tags_slug_not_blank" CHECK (length(btrim("tags"."slug")) > 0)
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug"),
	CONSTRAINT "topics_name_not_blank" CHECK (length(btrim("topics"."name")) > 0),
	CONSTRAINT "topics_slug_not_blank" CHECK (length(btrim("topics"."slug")) > 0)
);
--> statement-breakpoint
ALTER TABLE "topics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_articles" ADD CONSTRAINT "learning_articles_learning_entry_id_learning_entries_id_fk" FOREIGN KEY ("learning_entry_id") REFERENCES "public"."learning_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_articles" ADD CONSTRAINT "learning_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_notes" ADD CONSTRAINT "learning_notes_learning_entry_id_learning_entries_id_fk" FOREIGN KEY ("learning_entry_id") REFERENCES "public"."learning_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_notes" ADD CONSTRAINT "learning_notes_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_projects" ADD CONSTRAINT "learning_projects_learning_entry_id_learning_entries_id_fk" FOREIGN KEY ("learning_entry_id") REFERENCES "public"."learning_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_projects" ADD CONSTRAINT "learning_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_learning_entry_id_learning_entries_id_fk" FOREIGN KEY ("learning_entry_id") REFERENCES "public"."learning_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_topics" ADD CONSTRAINT "learning_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_tags" ADD CONSTRAINT "note_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_topics" ADD CONSTRAINT "note_topics_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_topics" ADD CONSTRAINT "note_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_tags_tag_id_idx" ON "article_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "article_topics_topic_id_idx" ON "article_topics" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "articles_publication_visibility_published_at_idx" ON "articles" USING btree ("publication_status","visibility","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "learning_articles_article_id_idx" ON "learning_articles" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "learning_entries_publication_visibility_date_idx" ON "learning_entries" USING btree ("publication_status","visibility","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "learning_notes_note_id_idx" ON "learning_notes" USING btree ("note_id");--> statement-breakpoint
CREATE INDEX "learning_projects_project_id_idx" ON "learning_projects" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "learning_topics_topic_id_idx" ON "learning_topics" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "note_tags_tag_id_idx" ON "note_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "note_topics_topic_id_idx" ON "note_topics" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "notes_publication_visibility_published_at_idx" ON "notes" USING btree ("publication_status","visibility","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "projects_publication_visibility_updated_at_idx" ON "projects" USING btree ("publication_status","visibility","updated_at" DESC NULLS LAST);