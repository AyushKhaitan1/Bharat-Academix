# AcademixIQ: AI-Powered Smart Learning Companion & Accessibility Hub

Developed for the **Bharat Academix CodeQuest 2026 Hackathon**.

AcademixIQ is a next-generation academic dashboard designed to make learning active, vernacular, and physically/neurodiversely accessible. It utilizes generative AI to convert passive educational materials into structured, interactive environments.

---

## 🌟 Core Pillars

### 1. 🗺️ VisualMind Canvas (Concept Mapping)
*   **Dynamic Interactive Graph**: An SVG-rendered concept map featuring zoom/pan and node drag physics.
*   **Gemini Subnode Expansion**: Instantly expand any concept node with deeper AI-generated subtopics on click.
*   **Integrated Drawers**: Select a node to instantly view summary notes, QA exam preps, and interactive flashcards.

### 2. 🗣️ BhashaTranslate (Vernacular Hub)
*   **Microphone Audio Capture**: Captures real-time classroom speech and transcribes it on-screen.
*   **Real-time Indian Translations**: Translates transcription instantly into regional languages like **Hindi, Tamil, Telugu, Bengali, Marathi, and Kannada** using Gemini 1.5 Flash.
*   **Text-to-Speech (TTS)**: Synthesizes translated regional audio with Indian local voices for auditory accessibility.

### 3. 🎯 SkillBridge AI (Adaptive Test Center)
*   **Custom MCQ Generation**: Dynamically evaluates the user's focus concepts.
*   **Confetti Animations**: Gamified feedback elements for correct responses.
*   **Visual Gap Analytics**: Plots an SVG graph summarizing concept mastery levels.
*   **Adaptive Study Checklists**: Provides actionable roadmaps to resolve weak gaps.

### 4. ⚡ EduAccess Engine (Accessibility Controls)
*   **Dyslexia Font Mode**: Adjusts typeface tracking, letter-spacing, and line-heights for visual comfort.
*   **ADHD Focus Ruler**: Dims background segments and activates a cursor-aligned scanning viewport.
*   **Voice Navigation**: Command router listening for keywords (e.g., "open quiz", "show mind map", "explain chloroplast").
*   **Contrast Themes**: Pre-built matrix filters for Protanopia, Deuteranopia, Tritanopia, and Monochromatic High Contrast.

---

## 🏗️ Architecture Stack

*   **Frontend**: React.js, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
*   **Backend**: Node.js, Express.js, Cors, Multer, Google Gen AI SDK (`@google/generative-ai`).

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   NPM (v9+)

### Installation
1.  Clone this repository to your workspace folder.
2.  Install all dependencies across root, frontend, and backend packages:
    ```bash
    npm run install:all
    ```

### Configuration
1.  Create a `.env` file inside the `backend/` directory:
    ```bash
    cp backend/.env.example backend/.env
    ```
2.  Add your Google Gemini API Key:
    ```env
    GEMINI_API_KEY=AIzaSy...
    ```
    *Note: If no API key is specified, the server will operate in **Mock Simulation Mode** for a seamless, immediate out-of-the-box demonstration.*

### Running the App
Start both frontend and backend concurrently with a single command:
```bash
npm run dev
```

*   **Frontend Dashboard**: http://localhost:5173
*   **Backend API Service**: http://localhost:5000
