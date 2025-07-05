# Quickpyx - Smart Notes & Expenses App

## Overview

Quickpyx is a Progressive Web App (PWA) that combines smart note-taking with expense tracking functionality. Built with modern web technologies, it features voice recognition, Material 3 design principles, and offline-first capabilities. The application is structured as a full-stack TypeScript project with React frontend and Express backend.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Design System**: Material 3 design principles with shadcn/ui component library

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with proper error handling
- **Development**: Hot reload with Vite middleware integration

### PWA Features
- **Service Worker**: Custom service worker for offline functionality
- **App Manifest**: Complete PWA manifest with icons and shortcuts
- **IndexedDB**: Local storage for offline data persistence
- **Push Notifications**: Browser notification support for reminders

## Key Components

### Data Models
- **Notes**: Supports plain text, checklist, and reminder types with voice note capability
- **Expenses**: Decimal precision amounts with category tracking and currency support
- **Reminders**: Scheduled notifications with completion tracking
- **Settings**: User preferences including dark mode, currency, and notification settings

### Storage Layer
- **Production**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development**: In-memory storage implementation for rapid prototyping
- **Offline**: IndexedDB for client-side data persistence

### Voice Integration
- **Speech Recognition**: Web Speech API integration for voice-to-text
- **Voice Notes**: Audio recording and transcription capabilities
- **Accessibility**: Voice commands for hands-free operation

### Theming System
- **Light/Dark Modes**: CSS custom properties for dynamic theming
- **Material 3**: Google's Material Design 3 color system
- **Responsive Design**: Mobile-first approach with desktop optimizations

## Data Flow

### Client-Server Communication
1. **API Requests**: TanStack React Query manages all server communication
2. **Error Handling**: Centralized error handling with user-friendly messages
3. **Optimistic Updates**: UI updates immediately with rollback on failure
4. **Caching Strategy**: Intelligent caching with background refresh

### Offline Synchronization
1. **Service Worker**: Intercepts network requests and serves cached responses
2. **IndexedDB**: Stores data locally for offline access
3. **Background Sync**: Synchronizes data when connection is restored
4. **Conflict Resolution**: Last-write-wins strategy for data conflicts

### Real-time Features
- **Live Updates**: Query invalidation for real-time data synchronization
- **Push Notifications**: Browser notifications for reminders and updates
- **Voice Processing**: Real-time speech-to-text conversion

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **wouter**: Lightweight React router
- **date-fns**: Date manipulation utilities

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **lucide-react**: Modern icon library

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the entire application
- **eslint**: Code linting and formatting
- **drizzle-kit**: Database schema management

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds optimized React application
2. **Backend Build**: ESBuild bundles Express server for production
3. **Database Setup**: Drizzle migrations ensure schema consistency
4. **Static Assets**: PWA assets and service worker registration

### Environment Configuration
- **Development**: Uses in-memory storage with hot reload
- **Production**: PostgreSQL database with optimized builds
- **Environment Variables**: DATABASE_URL for database connection

### Performance Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and lazy loading
- **Service Worker**: Aggressive caching for offline performance

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```