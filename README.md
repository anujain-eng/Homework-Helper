# EmeraldQuest — Homework Adventure! 💎

Turn homework into an adventure! A fun Socratic homework helper with pets, quests, and K-pop Demon Hunters.

## Quick Start

1. Open `index.html` in a browser, OR visit the hosted version at:
   **https://anujain-eng.github.io/Homework-Helper/**

2. Create a player profile and start solving homework!

## Parent Setup (one-time)

### 1. Claude API Key (for AI homework help)
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an API key
- Paste it in **Settings > Claude API Key** in the app

### 2. GitHub Token (for cloud save — optional)
- Go to GitHub > Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens
- Create a token for the `Homework-Helper` repo with "Contents" read/write permission
- Set expiration to "No expiration"
- Paste it in **Settings > GitHub Token** in the app

### 3. GitHub Pages (to host as a website)
- Go to repo Settings > Pages
- Source: branch `claude/homework-helper-app-jLTSe`, folder `/ (root)`
- Save — your app is live!

## Features
- Socratic homework helper (never gives answers — guides with questions)
- Photo upload for homework pages (Claude vision)
- K-pop Demon Hunter character dress-up
- Pet collection (16 pets: real + fantasy)
- Demon Hunt quest mode with battle animations
- Shop with shopkeeper, fashion, ears, accessories
- Multi-player profiles with secret questions
- Emerald currency system
- Birthday special (April 25th)
- Works offline (PWA with service worker)
- Saves to GitHub for cross-device sync

## Tech
- Pure HTML/CSS/JS — no build tools needed
- Claude API (Haiku) for Socratic tutoring + vision
- GitHub API for cloud saves
- PWA with service worker for offline support
