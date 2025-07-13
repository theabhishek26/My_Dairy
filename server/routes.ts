import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEntrySchema, insertMediaFileSchema, insertTranscriptionSchema } from "@shared/schema";
import { transcribeAudio } from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user for now (in a real app, this would come from authentication)
  const mockUserId = 1;
  
  // Ensure mock user exists
  try {
    await storage.createUser({ username: "testuser", password: "password" });
  } catch (error) {
    // User might already exist, ignore error
  }

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Get all entries
  app.get('/api/entries', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const entries = await storage.getEntriesByUserId(mockUserId, limit, offset);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get entry by ID
  app.get('/api/entries/:id', async (req, res) => {
    try {
      const entry = await storage.getEntryById(parseInt(req.params.id));
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get entries by date
  app.get('/api/entries/date/:date', async (req, res) => {
    try {
      const date = new Date(req.params.date);
      const entries = await storage.getEntriesByDate(mockUserId, date);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Search entries
  app.get('/api/entries/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      const entries = await storage.searchEntries(mockUserId, query);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Create new entry
  app.post('/api/entries', async (req, res) => {
    try {
      console.log('Creating entry with data:', req.body);
      
      const entryData = insertEntrySchema.parse({
        ...req.body,
        userId: mockUserId,
      });
      
      const entry = await storage.createEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error('Entry creation error:', error);
      if (error instanceof Error && error.message.includes('ZodError')) {
        res.status(400).json({ message: 'Invalid entry data provided' });
      } else {
        res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  });

  // Update entry
  app.patch('/api/entries/:id', async (req, res) => {
    try {
      const entryData = insertEntrySchema.partial().parse(req.body);
      const entry = await storage.updateEntry(parseInt(req.params.id), entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete entry
  app.delete('/api/entries/:id', async (req, res) => {
    try {
      await storage.deleteEntry(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Upload media file
  app.post('/api/media', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const mediaData = insertMediaFileSchema.parse({
        entryId: parseInt(req.body.entryId),
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        caption: req.body.caption || null,
      });

      const mediaFile = await storage.createMediaFile(mediaData);
      
      // Auto-transcribe audio files
      if (req.file.mimetype.startsWith('audio/')) {
        try {
          const transcriptionResult = await transcribeAudio(req.file.path);
          const transcriptionData = insertTranscriptionSchema.parse({
            mediaFileId: mediaFile.id,
            text: transcriptionResult.text,
            confidence: 0.95, // OpenAI Whisper is generally very confident
            language: 'en',
          });
          
          await storage.createTranscription(transcriptionData);
          console.log('Audio transcription completed for file:', req.file.filename);
        } catch (transcriptionError) {
          console.error('Transcription failed:', transcriptionError);
          // Don't fail the upload if transcription fails
        }
      }
      
      res.status(201).json(mediaFile);
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Create transcription
  app.post('/api/transcriptions', async (req, res) => {
    try {
      const transcriptionData = insertTranscriptionSchema.parse(req.body);
      const transcription = await storage.createTranscription(transcriptionData);
      res.status(201).json(transcription);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get transcription by media file ID
  app.get('/api/transcriptions/media/:mediaFileId', async (req, res) => {
    try {
      const transcription = await storage.getTranscriptionByMediaFileId(parseInt(req.params.mediaFileId));
      if (!transcription) {
        return res.status(404).json({ message: 'Transcription not found' });
      }
      res.json(transcription);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
