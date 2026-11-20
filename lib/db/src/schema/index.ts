import {
  boolean,
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

const resumeBytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

export const userRoleEnum = pgEnum("user_role", ["admin", "staff", "customer"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "converted", "closed"]);
export const newsletterStatusEnum = pgEnum("newsletter_status", ["active", "unsubscribed"]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("customer"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const contactLeadsTable = pgTable("contact_leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceInterest: text("service_interest"),
  subject: text("subject"),
  message: text("message").notNull(),
  source: text("source").notNull().default("website"),
  status: leadStatusEnum("status").notNull().default("new"),
  assignedEmployee: text("assigned_employee"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quoteRequestsTable = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  company: text("company"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  requirements: text("requirements"),
  location: text("location"),
  status: leadStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const websiteEnquiriesTable = pgTable("website_enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  pageSource: text("page_source"),
  status: leadStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribersTable = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: newsletterStatusEnum("status").notNull().default("active"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }).notNull().defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

export const trackingSearchesTable = pgTable("tracking_searches", {
  id: serial("id").primaryKey(),
  trackingNumber: text("tracking_number").notNull(),
  searchTimestamp: timestamp("search_timestamp", { withTimezone: true }).notNull().defaultNow(),
  searchSource: text("search_source").notNull().default("website"),
  resultStatus: text("result_status").notNull().default("unknown"),
  resultSummary: text("result_summary"),
});

export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => usersTable.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  description: text("description"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const careersJobsTable = pgTable("careers_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull(),
  experienceRequired: text("experience_required").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().notNull().default([]),
  published: boolean("published").notNull().default(false),
  filled: boolean("filled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_careers_jobs_visibility").on(table.published, table.filled),
]);

export const careerApplicationsTable = pgTable("career_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").references(() => careersJobsTable.id, { onDelete: "set null" }),
  jobTitle: text("job_title").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  experience: text("experience").notNull(),
  coverLetter: text("cover_letter"),
  resumeOriginalName: text("resume_original_name").notNull(),
  resumeMimeType: text("resume_mime_type").notNull(),
  resumeData: resumeBytea("resume_data").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_career_applications_created_at").on(table.createdAt),
  index("idx_career_applications_job_id").on(table.jobId),
  index("idx_career_applications_status").on(table.status),
]);

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertContactLeadSchema = createInsertSchema(contactLeadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebsiteEnquirySchema = createInsertSchema(websiteEnquiriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribersTable).omit({
  id: true,
  subscribedAt: true,
  unsubscribedAt: true,
});

export const insertTrackingSearchSchema = createInsertSchema(trackingSearchesTable).omit({
  id: true,
  searchTimestamp: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogsTable).omit({
  id: true,
  createdAt: true,
});

export const insertCareersJobSchema = createInsertSchema(careersJobsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareerApplicationSchema = createInsertSchema(careerApplicationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof insertUserSchema>;
export type ContactLead = z.infer<typeof insertContactLeadSchema>;
export type QuoteRequest = z.infer<typeof insertQuoteRequestSchema>;
export type WebsiteEnquiry = z.infer<typeof insertWebsiteEnquirySchema>;
export type Service = z.infer<typeof insertServiceSchema>;
export type NewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type TrackingSearch = z.infer<typeof insertTrackingSearchSchema>;
export type ActivityLog = z.infer<typeof insertActivityLogSchema>;
export type CareersJob = z.infer<typeof insertCareersJobSchema>;
export type CareerApplication = z.infer<typeof insertCareerApplicationSchema>;