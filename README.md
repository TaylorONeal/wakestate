# WakeState

WakeState is a **narcolepsy-first, pattern-tracking web app** designed to help people living with narcolepsy (and related sleep–wake conditions) understand and communicate their lived experience more clearly.

It focuses on **wake-state instability, events, medications, and last night’s sleep** — not diagnosis, not treatment, and not wearable-grade sleep scoring.

WakeState is built for real humans on low-energy days.

---

## What WakeState Is (and Is Not)

**WakeState is:**
- A self-tracking and pattern-recognition tool
- Designed primarily for people with narcolepsy
- Optimized for clarity, speed, and low cognitive load
- Event-first (naps, cataplexy) rather than score-first
- Local-first and privacy-respecting
- Built to support better conversations with clinicians, employers, and support groups

**WakeState is not:**
- A diagnostic tool
- A medical device
- A treatment recommendation engine
- A wearable replacement
- A sleep score app

All insights are framed as **observations**, not conclusions.

---

## Core Concepts

WakeState separates tracking into **four distinct layers** to avoid signal contamination:

1. **Wake State**  
   Continuous, quick check-ins focused on narcolepsy-relevant symptoms  
   (e.g. sleep pressure, microsleeps, cognitive fog, effort aversion)

2. **Events**  
   Discrete occurrences that should never be averaged  
   (e.g. naps, cataplexy)

3. **Medications**  
   What was taken and when — logged simply, without advice or interpretation

4. **Last Night’s Sleep**  
   A single daily snapshot focused on narcolepsy-relevant sleep features  
   (not a full sleep tracker)

These layers are intentionally kept separate and only combined carefully in reporting.

---

## Key Features

### Wake State Logging
- 30-second check-ins
- Narcolepsy-related symptoms clearly separated from overlapping symptoms
- Designed for repeated use throughout the day
- No clinical language, no scoring pressure

### Event Logging
- One-tap logging for naps and cataplexy
- Event-first analytics (frequency, timing, clustering)
- Never averaged or reduced to scores

### Medication Logging
- First-time setup to define a regimen
- One-tap “Taken” logging from the home screen
- Structured dose and frequency inputs (no free-text chaos)
- Manufacturer links for reference only
- Supports stimulants, Wakix, oxybates, and emerging orexin therapies

### Last Night’s Sleep
- One entry per day (editable)
- Focused on what matters for narcolepsy:
  - Total sleep time
  - Wakeups
  - Hypnagogic / hypnopompic hallucinations
  - Vivid dreams
  - AHI (if known)
- Explicitly **not** a wearable-style sleep tracker

### Dashboard
- Consumer-grade clarity inspired by Oura / Eight Sleep / Garmin
- Event-first overview
- Adaptive: shows only what’s relevant and logged
- Light gamification without shame or pressure
- Plain-language insights with explanations

### Reports & Export
- Human-readable reports are primary
- Raw data exports are available but de-emphasized
- Designed to answer: “What’s been happening lately?”
- Optional “Ask Your Provider About” section (non-diagnostic)

### Progressive Web App (PWA)
- Installable on mobile and desktop
- Works offline (local-first)
- “Add to Home Screen” for app-like experience
- No App Store required

---

## Design Philosophy

WakeState is designed for people who are:
- cognitively fatigued
- easily overwhelmed
- tired of explaining themselves

Principles:
- **Low friction over completeness**
- **Patterns over precision**
- **Events over averages**
- **Explanation over interpretation**
- **Calm over clinical**

If a feature adds cognitive load without adding clarity, it doesn’t belong.

---

## Tech Stack

This project is built with:

- **Vite**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- Progressive Web App (PWA) support
- Local-first storage (no required backend)

---

## Working on the Project

### Editing via Lovable (Recommended)

WakeState is designed to be edited primarily through **Lovable**.

- Open the project in Lovable
- Prompt changes in natural language
- Lovable commits changes automatically to this repo

This is the fastest way to iterate on UX and logic.

### Editing Locally

If you prefer working locally:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate into the project
cd wakestate

# Install dependencies
npm install

# Run the dev server
npm run dev
````

Requirements:

* Node.js (recommended via nvm)
* npm

### Editing on GitHub

You can also:

* Edit files directly via GitHub’s web editor
* Use GitHub Codespaces for a full cloud IDE

All changes pushed here will sync back into Lovable.

---

## Deployment

Publishing is handled through Lovable:

* Open the project in Lovable
* Click **Share → Publish**
* Optional: connect a custom domain via Project Settings

WakeState is deployed as a web app and can be installed as a PWA.

---

## Privacy & Data

* WakeState is **local-first**
* No data is sent to third parties by default
* Export/import is fully user-controlled
* There is no analytics tracking user behavior

Users own their data.

---

## About the Project

WakeState was created out of lived experience with narcolepsy and ongoing participation in narcolepsy support communities.

The goal is simple:

> Make it easier for people to understand their own patterns — and explain them to others — without turning their life into a spreadsheet or a diagnosis.

---

## Status

WakeState is under active development and iteration.
Expect rapid UX evolution and careful expansion, not feature bloat.

Thoughtful feedback — especially from people living with narcolepsy — is welcome.

