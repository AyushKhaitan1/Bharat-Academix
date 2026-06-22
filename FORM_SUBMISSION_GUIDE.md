# AcademixIQ: Google Form Submission Response Guide
**Hackathon**: Bharat Academix CodeQuest 2026

Use this guide to copy-paste responses directly into the Google Form. The answers are tailored to highlight the innovative architecture, accessibility features, and social impact of your project to the judges.

---

## Section 1: Team Leader Information

* **Team Name**: ayushkhaitan2004
* **Team Leader Name**: Ayush Khaitan
* **Team Leader Email Address**: ayushkhaitan2004@gmail.com
* **Phone Number**: 7667785849
* **University/Organization**: SRMIST Ghaziabad
* **Full Name Team Member 2**: [Leave Blank - Solo Innovator]
* **Phone Number Team Member 2**: [Leave Blank]
* **Email Address Team Member 2**: [Leave Blank]
* **Full Name Team Member 3**: [Leave Blank]
* **Phone Number Team Member 3**: [Leave Blank]
* **Email Address Team Member 3**: [Leave Blank]

---

## Section 2: Project Information

### Project Title
> AcademixIQ: Multi-Modal AI Classroom Accessibility Platform

### Domain
*Select:* **Artificial Intelligence** (or **Web Development**)

### Problem Statement Addressed
> Traditional classroom teaching follows a "one-size-fits-all" approach that fails to accommodate students with diverse cognitive, linguistic, and sensory needs. Specifically, three core barriers exist in Indian education today:
> 1. **Linguistic Barriers**: Over 80% of high-quality digital academic content is exclusively in English, leaving regional vernacular-medium students behind.
> 2. **Cognitive Hurdles**: Students with learning profiles like ADHD or dyslexia struggle with dense, text-heavy slides and notes, resulting in rapid loss of focus.
> 3. **Unidentified Mastery Gaps**: Standard examinations evaluate students retrospectively, failing to identify specific conceptual gaps in real-time, which leads to cumulative learning deficits.
> 
> AcademixIQ addresses these problems by creating a multi-modal, adaptive learning platform that converts classroom audio or text notes into visual concept maps, streams translation in regional Indian scripts, and highlights mastery gaps dynamically.

---

## Section 3: Project Description

### Abstract (Up to 250 words)
> AcademixIQ is an inclusive, multi-modal educational ecosystem powered by Google Gemini designed to democratize classroom learning. The platform converts lecture transcripts or uploaded study notes into interactive, three-dimensional conceptual mind maps. This visual roadmap enables students to bypass text fatigue, structure their study material logically, and expand concept nodes dynamically. 
> 
> To dismantle linguistic barriers, AcademixIQ features BhashaTranslate, a real-time transcription and translation hub. By utilizing the browser's Web Speech API and the high-speed Gemini 2.5 Flash SDK, the platform streams spoken classroom lectures into 6 major regional scripts (Hindi, Tamil, Telugu, Marathi, Kannada, Bengali) alongside synchronized text-to-speech reading in local accents. 
> 
> To reinforce mastery, the SkillBridge module generates custom concept-focused MCQ assessments. Upon completion, the system maps performance directly onto the mind map, coloring mastered concepts green and highlighting gaps in orange, while compiling a personalized study checklist. 
> 
> Finally, the EduAccess engine provides visual and cognitive overlays, including OpenDyslexic high-readability spacing, mouse-guided ADHD focus rulers, SVG-based colorblind filters (Protanopia, Deuteranopia, Tritanopia), and hands-free voice command navigation. 
> 
> AcademixIQ presents a highly scalable, low-latency, and cost-effective EdTech solution that bridges accessibility gaps and empowers learners of all abilities.

### Detailed Description
> AcademixIQ is structured around four tightly integrated core modules:
> 
> 1. **VisualMind Concept Canvas**: Users enter a topic or upload note files (PDF/TXT). Node.js parses the content and queries the Gemini 2.5 Flash API to generate a structured JSON concept graph. The graph renders dynamically on a custom HTML canvas. Clicking a node opens a drawer with summaries, conceptual questions, and interactive flashcards. Students can double-click a node to expand it, adding new sub-nodes dynamically using generative models.
> 
> 2. **BhashaTranslate Hub**: The browser microphone captures live classroom speech. BhashaTranslate transcribes and translates the speech in real-time. For offline demonstration, a preloaded demo lecture streams standard sentences. The backend converts these sentences into native regional scripts, maintaining technical terminology, and feeds them into the system's reactive SpeechSynthesis TTS engine to read the text in natural regional accents.
> 
> 3. **SkillBridge AI Evaluations**: Adaptive MCQ quizzes are generated based on the concept nodes. Upon submission, the engine maps incorrect answers back to the corresponding node labels, changing their visual status on the canvas. It renders an SVG mastery bar chart and creates an actionable checklist for targeted review.
> 
> 4. **EduAccess Accessibility Panel**: Tailors the interface in real-time.
>    - **Dyslexia Font Mode**: Adjusts spacing, font-weights, and alignment.
>    - **ADHD Focus Ruler**: Dimmer panels block visual clutter, leaving a mouse-guided highlighting ruler.
>    - **Contrast/Color Filters**: Custom inline SVG matrix filters simulate/correct color blindness (Protanopia, Deuteranopia, Tritanopia).
>    - **Voice Navigation**: A speech listener interprets navigation commands (e.g., "open quiz", "explain photosynthesis") for hands-free control.

---

## Section 4: Technical Details

### Technologies Used
> - **Frontend**: React, Vite, TypeScript, Lucide Icons, HTML5 Canvas, HSL CSS variables, Web Speech API (SpeechRecognition & SpeechSynthesis).
> - **Backend**: Node.js, Express, Multer (multipart form handling), Cors, Dotenv.
> - **AI Orchestration**: Google Generative AI SDK (`@google/generative-ai` v1beta) calling the `gemini-2.5-flash` model.
> - **Packaging & Compilation**: reportlab & python-pptx (python data assets), powershell compression staging scripts.

### Platform Used
> Web Application (runs on Google Chrome, Microsoft Edge, and modern web browsers).

### Open Source Repository Link
> Provided in the upload submission package. *(Or paste your GitHub repo link if you have pushed it online)*

---

## Section 5: Project Demonstration

### Video Demo Link
> [Provide your Loom, YouTube, or Drive link here]

### Live Demo Link
> `http://localhost:5173` (Runs locally via npm run dev. Staged within the submission ZIP).

### Upload PPT
*Upload the generated PowerPoint presentation:* **`AcademixIQ_Pitch_Deck.pptx`**

---

## Section 6: Additional Information

### Future Improvements
> 1. **Real-time Classroom Streaming**: Integrating WebRTC and WebSockets to broadcast a teacher's translated lecture stream to hundreds of students concurrently.
> 2. **AI OCR & Handwriting Recognition**: Allowing students to take photos of handwritten notebooks and automatically generate concept roadmaps.
> 3. **Offline Voice Packs**: Integrating local machine-learning translation models to remove internet dependencies in remote schools.
> 4. **Gamification & Rewards**: A blockchain-based micro-incentive hub where peer tutors earn credits for creating accessibility resources.

### Additional Comments or Notes
> **Note to Judges / Evaluators**:
> AcademixIQ is packaged with a robust **Sandbox Prototype Mode**. If evaluated offline or without a configured API key, the system has built-in mock modules matching **Photosynthesis**, **Quantum Computing**, and **Neural Networks** which serve high-fidelity concept maps, regional script translations, voice TTS, and master-gap evaluations. 
> 
> To test the application live with any topic using your own Google AI Studio credentials, double-click the **`PROTOTYPE v2`** badge in the navbar header to open the secret developer configuration window and save your Gemini API Key.
