# Sarvbhasa - India's Sovereign AI Platform

## Problem Statement
Build a complete multilingual AI platform with landing page, chatbot, text translation, speech-to-text, Google auth, and premium upgrade page. Tricolor theme (saffron/green/white). Real Sarvam Maurya API for translations.

## Architecture
- **Frontend**: React + Tailwind CSS + Framer Motion + Shadcn UI
- **Backend**: FastAPI + MongoDB + Sarvam AI API (real translation)
- **Auth**: Emergent-managed Google OAuth
- **Fonts**: Outfit (headings), Manrope (body)
- **Colors**: Saffron (#FF9933), India Green (#138808), White, Blue accents

## User Personas
- Developers building multilingual Indian apps
- Users needing real-time Indian language translation
- Users wanting speech-to-text in Indian languages

## Core Requirements
- Landing page with Hindi tagline and tricolor CTA
- Collapsible sidebar with all navigation
- Multilingual AI Chatbot with real Sarvam API translation
- Text to Text Translation with 12 language support
- Speech to Text via browser Web Speech API
- Google Sign In via Emergent OAuth
- Upgrade to Premium page
- Language-specific blurred cultural background images

## What's Been Implemented (Dec 2025)
- [x] Landing page with tricolor gradient CTA, Hindi tagline
- [x] 2-second loading animation with tricolor progress bar
- [x] Collapsible sidebar: Home, New Chat, Chat, Translate, Speech, Upgrade, Sign In
- [x] REAL Sarvam Maurya API translation (12+ languages)
- [x] Chat page with source/target language selectors + blurred cultural images
- [x] Text Translate page with swap, copy, speak buttons
- [x] Speech to Text (browser Web Speech API)
- [x] Google Auth via Emergent OAuth
- [x] Upgrade to Premium page (Free ₹0 / Premium ₹499)
- [x] User profile with Logout + Support (Indian phone number)
- [x] "Made with Emergent" badge hidden
- [x] All tests passing 100%

## Prioritized Backlog
### P0
- Stripe payment for Premium upgrade

### P1
- Chat history persistence per user
- Translation history dashboard
- More language support (22+ Indian languages)

### P2
- Document translation (PDF/DOCX)
- Dark mode
- Mobile responsive refinements
