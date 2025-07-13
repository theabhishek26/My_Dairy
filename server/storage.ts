import { users, entries, mediaFiles, transcriptions, type User, type InsertUser, type Entry, type InsertEntry, type MediaFile, type InsertMediaFile, type Transcription, type InsertTranscription, type EntryWithMedia } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Entry methods
  getEntriesByUserId(userId: number, limit?: number, offset?: number): Promise<EntryWithMedia[]>;
  getEntryById(id: number): Promise<EntryWithMedia | undefined>;
  getEntriesByDate(userId: number, date: Date): Promise<EntryWithMedia[]>;
  getEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<EntryWithMedia[]>;
  createEntry(entry: InsertEntry): Promise<Entry>;
  updateEntry(id: number, entry: Partial<InsertEntry>): Promise<Entry>;
  deleteEntry(id: number): Promise<void>;
  searchEntries(userId: number, query: string): Promise<EntryWithMedia[]>;
  
  // Media file methods
  createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile>;
  getMediaFilesByEntryId(entryId: number): Promise<MediaFile[]>;
  deleteMediaFile(id: number): Promise<void>;
  
  // Transcription methods
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  getTranscriptionByMediaFileId(mediaFileId: number): Promise<Transcription | undefined>;
  updateTranscription(id: number, transcription: Partial<InsertTranscription>): Promise<Transcription>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getEntriesByUserId(userId: number, limit: number = 50, offset: number = 0): Promise<EntryWithMedia[]> {
    const entriesWithMedia = await db.query.entries.findMany({
      where: eq(entries.userId, userId),
      with: {
        mediaFiles: {
          with: {
            transcriptions: true,
          },
        },
      },
      orderBy: [desc(entries.entryDate)],
      limit,
      offset,
    });
    
    return entriesWithMedia as EntryWithMedia[];
  }

  async getEntryById(id: number): Promise<EntryWithMedia | undefined> {
    const entry = await db.query.entries.findFirst({
      where: eq(entries.id, id),
      with: {
        mediaFiles: {
          with: {
            transcriptions: true,
          },
        },
      },
    });
    
    return entry as EntryWithMedia | undefined;
  }

  async getEntriesByDate(userId: number, date: Date): Promise<EntryWithMedia[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.getEntriesByDateRange(userId, startOfDay, endOfDay);
  }

  async getEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<EntryWithMedia[]> {
    const entriesWithMedia = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, userId),
        gte(entries.entryDate, startDate),
        lte(entries.entryDate, endDate)
      ),
      with: {
        mediaFiles: {
          with: {
            transcriptions: true,
          },
        },
      },
      orderBy: [desc(entries.entryDate)],
    });
    
    return entriesWithMedia as EntryWithMedia[];
  }

  async createEntry(entry: InsertEntry): Promise<Entry> {
    const [newEntry] = await db
      .insert(entries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async updateEntry(id: number, entry: Partial<InsertEntry>): Promise<Entry> {
    const [updatedEntry] = await db
      .update(entries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(entries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteEntry(id: number): Promise<void> {
    await db.delete(entries).where(eq(entries.id, id));
  }

  async searchEntries(userId: number, query: string): Promise<EntryWithMedia[]> {
    const searchTerm = `%${query}%`;
    
    const entriesWithMedia = await db.query.entries.findMany({
      where: and(
        eq(entries.userId, userId),
        or(
          like(entries.title, searchTerm),
          like(entries.content, searchTerm)
        )
      ),
      with: {
        mediaFiles: {
          with: {
            transcriptions: true,
          },
        },
      },
      orderBy: [desc(entries.entryDate)],
    });
    
    return entriesWithMedia as EntryWithMedia[];
  }

  async createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile> {
    const [newMediaFile] = await db
      .insert(mediaFiles)
      .values(mediaFile)
      .returning();
    return newMediaFile;
  }

  async getMediaFilesByEntryId(entryId: number): Promise<MediaFile[]> {
    return await db.select().from(mediaFiles).where(eq(mediaFiles.entryId, entryId));
  }

  async deleteMediaFile(id: number): Promise<void> {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
  }

  async createTranscription(transcription: InsertTranscription): Promise<Transcription> {
    const [newTranscription] = await db
      .insert(transcriptions)
      .values(transcription)
      .returning();
    return newTranscription;
  }

  async getTranscriptionByMediaFileId(mediaFileId: number): Promise<Transcription | undefined> {
    const [transcription] = await db.select().from(transcriptions).where(eq(transcriptions.mediaFileId, mediaFileId));
    return transcription || undefined;
  }

  async updateTranscription(id: number, transcription: Partial<InsertTranscription>): Promise<Transcription> {
    const [updatedTranscription] = await db
      .update(transcriptions)
      .set(transcription)
      .where(eq(transcriptions.id, id))
      .returning();
    return updatedTranscription;
  }
}

export const storage = new DatabaseStorage();
