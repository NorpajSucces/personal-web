ALTER TABLE "projects" ADD COLUMN "start_period" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "end_period" text;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_work_period_valid" CHECK ((
        ("projects"."start_period" is null or "projects"."start_period" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2]))?$')
        and ("projects"."end_period" is null or "projects"."end_period" ~ '^[1-9][0-9]{3}(-(0[1-9]|1[0-2]))?$')
        and ("projects"."project_status" <> 'in_progress' or "projects"."end_period" is null)
        and (
          "projects"."start_period" is null or "projects"."end_period" is null
          or substring("projects"."start_period" from 1 for 4) < substring("projects"."end_period" from 1 for 4)
          or (
            substring("projects"."start_period" from 1 for 4) = substring("projects"."end_period" from 1 for 4)
            and (
              char_length("projects"."start_period") = 4
              or char_length("projects"."end_period") = 4
              or substring("projects"."start_period" from 6 for 2) <= substring("projects"."end_period" from 6 for 2)
            )
          )
        )
      ));