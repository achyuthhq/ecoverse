🚀 Ecoverse - Tech Stack Overview
For Ideathon Competition Presentation

Core Framework & Language

Frontend Framework
- Next.js 14 (App Router) - React-based full-stack framework
- TypeScript - Type-safe JavaScript for reliability
- React 18 - Modern UI library with hooks and concurrent features

Styling & UI
- Tailwind CSS - Utility-first CSS framework
- shadcn/ui - High-quality React component library (Radix UI primitives)
- Framer Motion - Smooth animations and transitions
- Three.js - 3D graphics for shader animations
- GSAP - Advanced animation library

Database & ORM

- PostgreSQL - Production-grade relational database (hosted on Render)
- Prisma ORM - Type-safe database client with migrations
- NextAuth.js - Authentication & session management

AI & Machine Learning

Image Recognition
- Moondream API - Vision AI for image captioning and object detection
  - Analyzes uploaded waste items
  - Generates detailed descriptions

Multi-Model AI Analysis (via Pollinations API)
We support 14 different AI models for comprehensive analysis:

1. GPT-5 (OpenAI) - Default model
2. GPT-5.2 Max (OpenAI Large)
3. Claude 4.5 Sonnet (Anthropic)
4. Claude 4.5 Opus (Anthropic Large)
5. Gemini 3.0 Pro (Google)
6. Gemini 3.0 Ultra (Google Large)
7. Gemini Search (Google with search)
8. Mistral 7B (Mistral AI)
9. Grok 4 (xAI)
10. Perplexity Sonar (Fast search)
11. Perplexity Reasoning (Deep reasoning)
12. DeepSeek R1 (Reasoning model)
13. Kimi K2 (Thinking model)
14. GPT-4o Mini (Fast & efficient)

What AI Does:
- Environmental impact analysis (CO2, water, energy)
- Toxicity level assessment
- Decomposition time calculations
- Recyclability percentages
- Microplastics risk analysis
- Disposal instructions
- Eco-friendly alternatives
- Material composition analysis

Text-to-Speech (TTS)
- Pollinations API with OpenAI Audio model
- 6 voice options: Nova, Shimmer, Alloy, Echo, Fable, Onyx
- Converts analysis to audio for accessibility

Third-Party APIs & Services

Image Hosting
- ImgBB API - Image upload and hosting service
  - Stores user-uploaded waste item images
  - Provides public URLs for analysis

AI Gateway
- Pollinations.ai - Unified API gateway for multiple AI models
  - Single API endpoint for 14+ AI models
  - Handles rate limiting and error handling
  - Cost-effective multi-model access

Authentication
- Google OAuth 2.0 - Social login integration
- NextAuth.js - Secure session management
- bcryptjs - Password hashing for email/password auth

Analytics & Monitoring
- Firebase - Analytics and measurement
- Firebase Admin SDK - Server-side Firebase operations

Key Libraries & Tools

PDF Generation
- jsPDF - Client-side PDF creation
- html2canvas - HTML to image conversion
- Server-side HTML-to-PDF for printing

Maps & Location
- Leaflet - Interactive maps
- react-leaflet - React wrapper for Leaflet
- City-based leaderboard and metrics

Data Visualization
- Recharts - Chart library for analytics
- react-globe.gl - 3D globe visualizations

Form Handling
- React Hook Form - Form state management
- Zod - Schema validation
- @hookform/resolvers - Form validation integration

File Handling
- react-dropzone - Drag-and-drop file uploads
- react-webcam - Camera capture functionality
- react-easy-crop - Image cropping tool

Content Rendering
- react-markdown - Markdown rendering for AI responses
- date-fns - Date formatting utilities

Architecture & Patterns

State Management
- React Hooks (useState, useEffect, useContext)
- Zustand (for global state if needed)
- Server Components - Next.js 14 App Router

API Architecture
- Next.js API Routes - Serverless backend endpoints
- RESTful API design
- Error handling with retry logic
- Rate limiting considerations

Security
- NextAuth.js - Secure authentication
- Environment variables - API keys protection
- Server-side validation - Input sanitization
- CORS protection

Deployment & Hosting

- Vercel - Frontend deployment (Next.js optimized)
- Render - PostgreSQL database hosting
- Environment-based config - Separate dev/prod settings

Data Flow

1. User uploads image → ImgBB (hosting)
2. Image analysis → Moondream API (object detection)
3. AI processing → Pollinations API (selected model)
4. Data storage → PostgreSQL via Prisma
5. TTS generation → Pollinations API (OpenAI Audio)
6. Response delivery → Next.js API routes → Frontend

UI/UX Features

- Glassmorphism design - Modern glass-like UI
- Responsive design - Mobile-first approach
- Dark/Light mode - Theme switching
- Loading animations - Shader-based 3D animations
- Real-time updates - Live analysis progress
- Accessibility - TTS, keyboard navigation

Key Differentiators

1. Multi-Model AI - Not locked to one AI provider
2. Real Environmental Metrics - CO2, water, energy calculations
3. Accessibility - Text-to-speech for all users
4. City-Based Impact - Community leaderboards
5. Production-Ready - TypeScript, error handling, scalability
6. Modern Stack - Latest Next.js 14, React 18, Prisma

For Judges - Quick Answers

Q: Why multiple AI models?
A: Different models excel at different tasks. Users can choose based on speed vs. accuracy needs. We aggregate insights for comprehensive analysis.

Q: How do you calculate environmental impact?
A: AI models analyze material composition, manufacturing processes, and disposal methods to calculate CO2 equivalent, water usage, energy consumption, and decomposition time.

Q: Is this scalable?
A: Yes. Next.js serverless functions auto-scale. PostgreSQL on Render handles concurrent users. Pollinations API manages AI rate limits.

Q: What's the tech stack complexity?
A: Modern but proven stack. Next.js 14 for full-stack, Prisma for type-safe DB, Pollinations for AI gateway. All production-ready technologies.

Q: How do you ensure accuracy?
A: Multi-model validation, structured prompts, JSON schema validation, and fallback mechanisms. Real-time error detection and retry logic.

Performance Metrics

- Image Analysis: ~3-5 seconds (Moondream + AI)
- AI Response: ~5-15 seconds (depending on model)
- TTS Generation: ~2-4 seconds
- Database Queries: <100ms (Prisma optimized)
- Page Load: <2s (Next.js optimization)

Security Measures

- API keys stored in environment variables
- NextAuth.js secure session management
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS protection
- Server-side API routes (no client exposure)

Built with ❤️ for a sustainable future
