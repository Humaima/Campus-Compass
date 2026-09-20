# 🏫 Campus Compass

> Your campus. Your quest. Your compass.

Campus Compass is an interactive 2D pixel-art university campus designed
to help students explore campus, find buildings and services, navigate
between locations, complete orientation quests, and interact with an
AI-powered Campus Guide.

## ✨ Features

- 🗺 Interactive pixel-art campus
- 🎮 Smooth player movement
- 🧭 Campus navigation and route visualization
- 🏫 Interactive buildings
- 🤖 AI Campus Guide
- 📚 RAG-powered university knowledge base
- 🎒 Orientation quests
- 🏆 Achievement system
- 🔎 Campus search
- 📱 Responsive/mobile controls
- 💾 Persistent student progress

## 🧠 Architecture

Campus Compass combines a deterministic campus engine with AI:

Student
↓
Campus Compass UI
↓
Shared Campus State
↓
Campus Engine + AI Guide
↓
Routing / Buildings / RAG / Quests

The AI interprets student requests while the campus engine remains
the source of truth for campus locations, routes, destinations and
structured campus state.

## 🛠 Tech Stack

- Next.js
- React
- TypeScript
- AI/LLM
- RAG
- Vector retrieval
- Tailwind CSS
- Pixel-art UI
- Vercel

## 🚀 Running Locally

```bash
npm install
npm run dev

Open:

http://localhost:3000

```
## 📁 Project Structure

```
app/
components/
data/
lib/
knowledge/
public/

```

## 🎓 Project Purpose

Campus Compass explores how AI can be integrated into an interactive
campus environment to provide students with contextual information,
navigation assistance and orientation support.

## 👩‍💻 Author

Humaima Anwar

---
