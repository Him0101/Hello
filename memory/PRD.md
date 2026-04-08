# Sarvbhasa - India's Sovereign AI Platform

## Problem Statement
Build a landing page for "Sarvbhasa" with topbar navigation (Platform dropdown with blur overlay), hero section, 2-second loading animation, and simple chatbot interface.

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **Fonts**: Outfit (headings), Manrope (body)
- **Colors**: White, Saffron (#FF9933), India Green (#138808), Zinc palette

## User Personas
- Developers exploring Indian language AI APIs
- General users wanting multilingual AI translation

## Core Requirements
- Landing page with glassmorphic topbar
- Platform dropdown with blur overlay (About API + Languages)
- Hero section with bold headline and CTA
- 2-second loading animation transition
- Simple chatbot interface

## What's Been Implemented (Dec 2025)
- [x] Landing page with Topbar, Hero Section
- [x] Platform dropdown with blur overlay and expandable items
- [x] Loading animation (2s) with tricolor progress bar
- [x] Simple chatbot interface (MOCKED responses)
- [x] Backend /api/chat endpoint with MongoDB logging
- [x] State management: landing -> loading -> chatbot views
- [x] Framer Motion animations throughout

## Prioritized Backlog
### P0 (Critical)
- Integrate real Sarvam Maurya API for actual translations

### P1 (Important)
- Language selection in chatbot
- Translation history persistence
- Mobile responsive polish

### P2 (Nice to have)
- Text-to-speech for translations
- Dark mode toggle
- User authentication

## Next Tasks
1. Integrate Sarvam Maurya API for real translation
2. Add language selector in chatbot
3. Mobile responsive improvements
