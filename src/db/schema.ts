import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "applied",
  "failed",
  "skipped",
  "interview",
  "rejected",
  "accepted",
]);

export const platformEnum = pgEnum("platform_name", [
  "linkedin",
  "indeed",
  "naukri",
  "pharmabharat",
]);

export const jobRunStatusEnum = pgEnum("job_run_status", [
  "idle",
  "running",
  "completed",
  "failed",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CV / Resume data
export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  skills: jsonb("skills").$type<string[]>().default([]),
  experience: jsonb("experience").$type<{ title: string; company: string; duration: string }[]>().default([]),
  education: jsonb("education").$type<{ degree: string; institution: string; year: string }[]>().default([]),
  summary: text("summary"),
  matchScore: integer("match_score").default(0),
  parsedData: jsonb("parsed_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Platform connections
export const platformConnections = pgTable("platform_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  platform: platformEnum("platform").notNull(),
  isConnected: boolean("is_connected").default(false).notNull(),
  profileUrl: varchar("profile_url", { length: 500 }),
  username: varchar("username", { length: 255 }),
  connectedAt: timestamp("connected_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Job search URLs submitted by users
export const jobSearchLinks = pgTable("job_search_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  url: text("url").notNull(),
  platform: platformEnum("platform").notNull(),
  label: varchar("label", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Discovered jobs
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  platform: platformEnum("platform").notNull(),
  externalId: varchar("external_id", { length: 255 }),
  title: varchar("title", { length: 500 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  matchScore: integer("match_score").default(0),
  matchReasons: jsonb("match_reasons").$type<string[]>().default([]),
  salary: varchar("salary", { length: 100 }),
  jobUrl: text("job_url"),
  status: applicationStatusEnum("status").default("pending").notNull(),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Automation runs
export const automationRuns = pgTable("automation_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  status: jobRunStatusEnum("status").default("idle").notNull(),
  jobsFound: integer("jobs_found").default(0),
  jobsApplied: integer("jobs_applied").default(0),
  jobsFailed: integer("jobs_failed").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
