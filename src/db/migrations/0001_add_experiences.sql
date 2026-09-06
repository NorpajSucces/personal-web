CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"organization" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"is_current" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiences_role_not_blank" CHECK (length(btrim("experiences"."role")) > 0),
	CONSTRAINT "experiences_organization_not_blank" CHECK (length(btrim("experiences"."organization")) > 0),
	CONSTRAINT "experiences_date_state_valid" CHECK ((
        ("experiences"."is_current" = true and "experiences"."end_date" is null)
        or
        ("experiences"."is_current" = false and "experiences"."end_date" is not null and "experiences"."end_date" >= "experiences"."start_date")
      ))
);
--> statement-breakpoint
ALTER TABLE "experiences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "experiences_start_date_idx" ON "experiences" USING btree ("start_date" DESC NULLS LAST);