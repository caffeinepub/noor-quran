# Noor Quran

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full Noor Quran app converted from the provided HTML to React
- Header: dark green (#1b5e20) background with gold (#c5a059) bottom border, title "Noor Quran", subtitle "India's First Quran on Multi-Language's On Lafzi Meaning"
- Language picker dropdown: Urdu, Kannada, Telugu, Hindi, Tamil, Malayalam, English
- Start Reading button that begins audio+TTS playback
- Progress bar showing % completed with localized praise text (MashaAllah)
- Ayah display list: Arabic text (Amiri font, right-aligned) + translation in selected language
- Active ayah highlight (green background) that scrolls into view during playback
- Playback: each ayah plays Quranic audio (from cdn.islamic.network), then word-by-word TTS in the selected language using Web Speech API (Lafzi effect, 400ms gap between words)
- Single ayah dataset: Bismillah (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ) with translations in all 7 languages
- Footer: dark navy (#0f172a) with designer credit to Shaik Munwarbhasha, Magic Advertising, WhatsApp link to +919390535070

### Modify
- None

### Remove
- None

## Implementation Plan
1. Minimal Motoko backend (greeting canister as placeholder)
2. React frontend replicating all HTML functionality exactly
3. Amiri + Inter fonts via Google Fonts
4. Web Speech API for Lafzi word-by-word TTS
5. Audio playback via HTMLAudioElement
