# Sarvbhasa - India's Sovereign AI Platform

## Problem Statement
Build a complete multilingual AI platform with landing page, loading animation, and full-featured main app with chatbot, text translation, speech-to-text, sign-in, and collapsible sidebar.

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **Fonts**: Outfit (headings), Manrope (body)
- **Colors**: White, Saffron (#FF9933), India Green (#138808)

## User Personas
- Developers building with Indian language AI APIs
- General users wanting multilingual translation
- Users needing speech-to-text in Indian languages

## Core Requirements
- Landing page with Platform dropdown, hero section, Hindi tagline
- 2-second loading animation transition
- Collapsible sidebar with full navigation
- Multilingual AI Chatbot with language selector
- Text to Text Translation (source/target language selection)
- Speech to Text (browser Web Speech API)
- Sign In (Google, Telegram, X/Twitter, Email)
- User profile with Logout and Support/Help

## What's Been Implemented (Dec 2025)
- [x] Landing page with topbar, Platform dropdown, blur overlay
- [x] Hindi tagline: भाषा बदले, मतलब नहीं
- [x] Loading animation (2s) with tricolor progress bar
- [x] Collapsible sidebar: Home, New Chat, Chat, Translate, Speech, Upgrade, Sign In
- [x] Multilingual AI Chatbot with language selector + mic + translate button
- [x] Text to Text Translate with language dropdowns, swap, copy, speak
- [x] Speech to Text with browser Web Speech API (real mic recording)
- [x] Sign In modal (Google, Telegram, X, Email) - localStorage mock auth
- [x] User profile dropdown: Logout, Support (Indian phone number)
- [x] Backend: /api/chat, /api/translate endpoints (MOCKED responses)
- [x] All tests passing 100%

## MOCKED Features (need real backend integration)
- Chat responses (random predefined)
- Text translation (lookup table + fallback format)
- Sign in (localStorage, no real OAuth)

## Prioritized Backlog
### P0 (Critical)
- Integrate real Sarvam Maurya API for translation + chat
- Real Google OAuth sign in

### P1 (Important)
- Chat history persistence in MongoDB
- Real speech-to-text via Sarvam API
- Translation history per user

### P2 (Nice to have)
- Stripe payment for Premium upgrade
- Dark mode
- Mobile responsive polish
- More languages support
