# Diary App

## Overview

This is a modern, multi-modal diary application built with React and Express. The app allows users to create diary entries using various media types including text, voice recordings, photos, and videos. It features a mobile-first design with a calendar view, gallery, and settings management. The application enforces temporal restrictions to prevent future entries and implements a yearly diary system.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 23, 2025)

✓ Implemented conditional floating action button that only appears when viewing current date
✓ Added temporal restrictions preventing future date navigation and entry creation
✓ Implemented yearly diary limitation system with backend validation
✓ Simplified home page date UI by removing date input field, keeping only calendar icon
✓ Fixed audio player progress bar jumping issue by implementing proper drag state management
✓ Enhanced calendar navigation with disabled states for future dates
✓ Updated entry creation modal with date restrictions (current year only, no future dates)

## System Architecture

### Full-Stack TypeScript Application
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state

### Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── migrations/      # Database migrations
└── uploads/         # File storage
```

## Key Components

### Frontend Architecture
- **React Router**: Uses Wouter for client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Responsive Design**: Mobile-first approach with max-width container
- **Media Handling**: Custom hooks for voice recording and photo capture
- **Real-time Updates**: TanStack Query for data fetching and caching

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Database Layer**: Drizzle ORM with PostgreSQL adapter
- **File Upload**: Multer for handling media file uploads
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
- **Users**: Basic user authentication
- **Entries**: Diary entries with support for different types (text, voice, photo, mixed)
- **Media Files**: File storage with metadata (filename, size, mime type, thumbnails)
- **Transcriptions**: Speech-to-text transcription data for audio files

## Data Flow

### Entry Creation
1. User selects entry type (text, voice, photo, mixed)
2. Frontend captures/uploads media using custom hooks
3. Files are uploaded to server via multer
4. Entry metadata is stored in database
5. Media files are linked to entries
6. Real-time UI updates via TanStack Query

### Media Processing
- Voice recordings are captured using Web Audio API
- Photos can be captured via camera or uploaded from gallery
- Automatic thumbnail generation for images and videos
- Speech-to-text transcription for audio files (placeholder implementation)

### Data Retrieval
- Entries are fetched with associated media files
- Calendar view groups entries by date
- Gallery view filters media by type
- Search functionality across entry content and transcriptions

## External Dependencies

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### State Management and Data
- **TanStack Query**: Server state management
- **React Hook Form**: Form state management
- **Zod**: Runtime type validation
- **date-fns**: Date manipulation utilities

### Media and File Handling
- **Multer**: File upload middleware
- **Web Audio API**: Voice recording capabilities
- **Canvas API**: Image processing and thumbnails

### Database and Backend
- **Drizzle ORM**: Type-safe database queries
- **Neon Database**: PostgreSQL serverless database
- **Express Session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for running TypeScript server code
- Replit integration with development banner
- Environment variables for database connection

### Production Build
- Vite builds frontend to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Static file serving for uploads and built assets
- Database migrations via Drizzle Kit

### File Storage
- Local file system storage in `uploads/` directory
- Files served via Express static middleware
- Thumbnails generated on-demand
- File size limits enforced (50MB)

### Database Configuration
- PostgreSQL with Drizzle schema
- Connection pooling via Neon serverless
- Migrations managed through Drizzle Kit
- Foreign key constraints for data integrity

The application is designed to be easily deployable on platforms like Replit, with proper environment variable configuration and database provisioning.