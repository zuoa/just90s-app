# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimal emotional support web app based on the "90-second emotional physiological cycle" theory. The app guides users through a timed 90-second process to help navigate emotional waves.

**Core philosophy**: Zero learning curve, zero choice pressure, body-first approach, no tracking/analysis.

## Commands

```bash
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## Architecture

### State Machine Flow

The entire app is a single-component state machine (`App.tsx`) with 5 phases:

1. **start** - Initial state, button to begin session
2. **acknowledge** (0-10s) - "You're in an emotional response, this is normal"
3. **breathing** (10-60s) - Breath guidance: 4s inhale, 6s exhale with animated circles
4. **waiting** (60-90s) - "This feeling is naturally declining" with fading animation
5. **complete** - End state with choice to continue or restart

A single `useEffect` timer increments `elapsedTime` every second and transitions phases based on thresholds. The phase ref (`phaseRef`) keeps phase state accessible inside interval closures.

### Key Patterns

- **Phase-based rendering**: Each phase returns its own JSX layout with phase-specific background gradients (Chinese classical colors)
- **Text cycling**: Breathing phase cycles "吸气"/"呼气" every 10s (4s inhale + 6s exhale). Waiting phase cycles through 5 comfort texts every 8s.
- **Interruption detection**: Visibility API detects when user locks screen/switches apps, sets `interruption` flag to show prompt to restart

### Audio System

`useAudioGuide` hook manages Web Audio API:
- `initAudio()` - Creates AudioContext (must be triggered by user interaction)
- `playAmbientSound()` - Dual sine wave oscillator (80Hz + 120Hz) for ambient drone during breathing phase
- `stopAudio()` - Fades out over 1s
- Audio is opt-in via toggle on start screen

### Mobile Optimizations

`mobileUtils.ts` provides:
- `isIOS()` / `isMobile()` - Device detection
- `preventIOSLock()` - Plays silent audio every 30s to delay iOS auto-lock
- `getSafeAreaInsets()` - Safe area for notched devices
- `vibrate()` - Haptic feedback

### Styling Approach

- **Tailwind CSS** for utility classes
- **App.css** for complex animations and phase-specific gradient backgrounds
- Large, translucent countdown display (`opacity: 0.08`, `font-size: 12rem`) centered as background element
- Breath circles use multi-layer radial gradients with staggered animations (inner/middle/outer)
- Touch-friendly buttons (min 44px) for thumb-zone interaction

### Design Principles (from README)

**Explicitly NOT done** (do not add):
- ❌ Emotion categorization
- ❌ Journaling/logging
- ❌ Data statistics
- ❌ AI analysis/sermonizing
- ❌ Gamification/achievements

Reason: These pull users back into "thinking mind" rather than safely experiencing the emotional wave.

## Browser Support

Primary: iOS Safari 14+, Android Chrome 90+
Secondary: Desktop browsers

Target is mobile-first PWA (add to home screen).
