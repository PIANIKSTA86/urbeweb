# Overview

This is a comprehensive property management system (URBE) designed for managing residential buildings, commercial properties, and rental units. The application provides modules for managing third parties (propietarios, inquilinos, proveedores), housing units, accounting, invoicing, reservations, and reporting. Built as a full-stack web application with a React frontend and Express.js backend, it features role-based authentication and a complete accounting system with chart of accounts and financial reporting capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: JWT token-based authentication with localStorage persistence
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API Design**: RESTful API architecture with structured error handling
- **Middleware**: Custom authentication middleware and request logging

## Data Storage
- **Database**: PostgreSQL with Neon serverless connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: WebSocket-enabled connection via @neondatabase/serverless
- **Schema Design**: Comprehensive relational schema with enums for data consistency

## Database Schema Structure
- **Core Entities**: Users, Third parties (terceros), Housing units, Chart of accounts
- **Accounting Module**: Accounting periods, accounting vouchers, accounting movements
- **Business Logic**: Invoices, reservations, and financial reporting
- **Enums**: Strongly typed enums for person types, contributor types, unit types, and user roles

## Authentication & Authorization
- **JWT Implementation**: Stateless authentication with configurable secret
- **Role-based Access**: Multi-level user roles (superadmin, administrator, contador, revisor, auxiliar, propietario)
- **Session Management**: Token-based sessions with automatic refresh capability
- **Password Security**: Bcrypt hashing with salt rounds for secure password storage

## Key Architectural Decisions

### Monorepo Structure
- **Rationale**: Shared TypeScript interfaces and schemas between frontend/backend
- **Implementation**: Shared folder contains common types and database schema definitions
- **Benefits**: Type safety across the full stack and reduced code duplication

### Database-First Approach
- **Rationale**: Complex business domain with strict data relationships
- **Implementation**: Comprehensive schema with foreign keys, enums, and constraints
- **Benefits**: Data integrity and clear business rule enforcement at the database level

### Component-Based UI Architecture
- **Rationale**: Consistent design system and reusable components
- **Implementation**: Shadcn/ui component library with custom business components
- **Benefits**: Rapid development and consistent user experience

### Server-Side Rendering Ready
- **Rationale**: SEO and performance optimization potential
- **Implementation**: Vite SSR configuration with Express middleware integration
- **Benefits**: Future-proof architecture for SSR implementation

# External Dependencies

## Database Services
- **Neon**: Serverless PostgreSQL database with connection pooling
- **WebSocket Support**: Real-time database connections via ws library

## Authentication & Security
- **JWT**: JSON Web Token implementation via jsonwebtoken
- **Bcrypt**: Password hashing and verification
- **CORS**: Cross-origin resource sharing configuration

## UI & Styling
- **Radix UI**: Headless UI component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with design tokens
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

## Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Static type checking across the application
- **ESLint/Prettier**: Code formatting and linting (implied by structure)
- **Drizzle Kit**: Database migrations and introspection tools

## Replit Integration
- **Vite Plugin Runtime Error Modal**: Error overlay for development
- **Cartographer Plugin**: Development environment integration
- **Development Banner**: Replit environment detection and branding