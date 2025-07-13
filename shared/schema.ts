import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  type: varchar("type", { length: 50 }).notNull(), // 'text', 'voice', 'photo', 'mixed'
  entryDate: timestamp("entry_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isFavorite: boolean("is_favorite").default(false),
  isBookmarked: boolean("is_bookmarked").default(false),
});

export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => entries.id, { onDelete: "cascade" }).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // For audio/video files in seconds
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  mediaFileId: integer("media_file_id").references(() => mediaFiles.id, { onDelete: "cascade" }).notNull(),
  text: text("text").notNull(),
  confidence: integer("confidence"), // 0-100
  language: varchar("language", { length: 10 }).default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  entries: many(entries),
}));

export const entriesRelations = relations(entries, ({ one, many }) => ({
  user: one(users, {
    fields: [entries.userId],
    references: [users.id],
  }),
  mediaFiles: many(mediaFiles),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one, many }) => ({
  entry: one(entries, {
    fields: [mediaFiles.entryId],
    references: [entries.id],
  }),
  transcriptions: many(transcriptions),
}));

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
  mediaFile: one(mediaFiles, {
    fields: [transcriptions.mediaFileId],
    references: [mediaFiles.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEntrySchema = createInsertSchema(entries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({
  id: true,
  createdAt: true,
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type Transcription = typeof transcriptions.$inferSelect;
export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;

// Combined types for API responses
export type EntryWithMedia = Entry & {
  mediaFiles: (MediaFile & { transcriptions: Transcription[] })[];
};
