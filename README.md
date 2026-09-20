# 🏫 Campus Compass

### Your campus. Your quest. Your compass.

[🚀 Live Demo](https://arcadiauniversity.vercel.app/) &nbsp;·&nbsp; [💻 GitHub](https://github.com/Humaima/Campus-Compass)

<!-- TODO: swap the Live Demo link above for your real Vercel URL once it's deployed. -->
<img width="1912" height="967" alt="image" src="https://github.com/user-attachments/assets/6d105094-75f1-4b5e-9136-1d87750871c8" />

<img width="1917" height="962" alt="image" src="https://github.com/user-attachments/assets/2520a80b-88be-4737-aa6b-9793dea670b4" />

<img width="1917" height="962" alt="image" src="https://github.com/user-attachments/assets/ff012cfb-8805-4d29-8748-b19d43f34e3c" />

<img width="1917" height="967" alt="image" src="https://github.com/user-attachments/assets/e82f360c-6a0f-4dbe-96f4-2a910c39c340" />


An interactive AI-powered pixel-art university campus that helps
students explore, navigate, and understand their campus.

<!-- TODO: drop a screenshot or GIF of the app here, e.g.: -->
<!-- ![Campus Compass](docs/screenshot.png) -->

## ✨ Features

- 🗺 **Interactive Campus** — a full pixel-art university, clickable buildings and all
- 🎮 **Pixel Exploration** — walk the campus yourself, WASD/arrows on desktop or on-screen controls on mobile
- 🧭 **Smart Navigation** — pathfinding routes you to any building, with live directions
- 🤖 **AI Campus Guide** — a conversational assistant that understands where you are and what you're asking
- 📚 **RAG Knowledge Base** — real answers grounded in actual campus documents, not hallucinated ones
- 🎒 **Orientation Quests** — multi-step campus checklists that teach the map as you play
- 🏆 **Achievements** — unlockable badges for exploring, asking questions, and finishing quests
- 🔎 **Semantic Search** — natural-language search across buildings, services, and knowledge
- 📱 **Mobile Controls** — a fully responsive HUD and touch d-pad, not just a shrunk desktop layout

## 🧠 Architecture

Campus Compass combines a deterministic campus engine with AI:

```
Student
  ↓
Campus Compass UI
  ↓
Shared Campus State
  ↓
Campus Engine + AI Guide
  ↓
Routing / Buildings / RAG / Quests
```

The AI interprets student requests while the campus engine remains
the source of truth for campus locations, routes, destinations, and
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
```

Open:

```
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
navigation assistance, and orientation support.

## 👩‍💻 Author

Humaima Anwar

---
