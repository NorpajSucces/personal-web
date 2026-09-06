import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: text("role").notNull(),
    organization: text("organization").notNull(),
    startDate: date("start_date", { mode: "date" }).notNull(),
    endDate: date("end_date", { mode: "date" }),
    isCurrent: boolean("is_current").default(false).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check("experiences_role_not_blank", sql`length(btrim(${table.role})) > 0`),
    check(
      "experiences_organization_not_blank",
      sql`length(btrim(${table.organization})) > 0`,
    ),
    check(
      "experiences_date_state_valid",
      sql`(
        (${table.isCurrent} = true and ${table.endDate} is null)
        or
        (${table.isCurrent} = false and ${table.endDate} is not null and ${table.endDate} >= ${table.startDate})
      )`,
    ),
    index("experiences_start_date_idx").on(table.startDate.desc()),
  ],
).enableRLS();
