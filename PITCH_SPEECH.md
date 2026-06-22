# AcademixIQ Pitch Presentation Speech Script
**Title**: AcademixIQ - democratizing education through adaptive AI multi-modal classroom tooling
**Duration**: ~5 Minutes
**Target Audience**: Hackathon Judges & Educational Technologists

---

## Slide 1: Title & The Hook (0:00 - 0:45)
* **Visual**: Show the AcademixIQ landing dashboard.
* **Verbal Cue**: Start with a warm greeting and an eye-opening question.
* **Script**:
> "Good morning, esteemed judges and fellow innovators. 
> 
> Close your eyes for a moment and imagine a typical classroom. In a room of forty students, you have one student struggling to read because of dyslexia, another who is spacing out due to ADHD, a third who doesn't speak English at home and is falling behind, and ten others with diverse conceptual learning gaps. 
> 
> Yet, the teacher speaks at one speed, in one language, using one static blackboard. This is the **accessibility gap** in Indian education. 
> 
> Today, I am proud to present **AcademixIQ**—an AI-powered, multi-modal classroom assistant designed to adapt standard lessons to *every* student’s cognitive, linguistic, and sensory needs in real-time."

---

## Slide 2: The Core Pillars (0:45 - 1:30)
* **Visual**: Point the judges to the primary sections on screen (VisualMind, BhashaTranslate, SkillBridge, EduAccess).
* **Script**:
> "AcademixIQ does not replace teachers; it supercharges the learning experience through four core pillars:
> 
> 1. **VisualMind**: Automatically turns lectures or text notes into interactive conceptual mind maps.
> 2. **BhashaTranslate**: Real-time voice transcription and translation into 6 major regional Indian languages.
> 3. **SkillBridge**: Adaptive quiz assessments that update the mind map to show mastery and gaps.
> 4. **EduAccess**: A suite of visual and cognitive accessibility overlays including high-contrast filters, ADHD reading dimmers, dyslexia spacing fonts, and voice navigation.
> 
> Let's walk through these features in action."

---

## Slide 3: VisualMind & Notes Ingestion Demo (1:30 - 2:30)
* **Visual**: Highlight the AI Concept Architect input box and the PDF/TXT note uploader. Generate or select the pre-loaded **Quantum Computing** concept mind map.
* **Action**: Drag nodes around, click a node to show the concept detail summary, and expand a node.
* **Script**:
> "On the dashboard, a student can type any topic or upload their lecture notes. Instantly, our backend queries Google Gemini using the high-performance `gemini-2.5-flash` model to return a structured JSON graph. 
> 
> As you can see on the canvas, we have a beautiful concept mind map. Instead of facing a 10-page text document, a student can visually trace how concepts link together. 
> 
> When I click on a subtopic like **Superposition**, the drawer updates with a concise summary, key conceptual questions, and instant flashcards. If a student wants to learn more, they can click **Expand Node** to prompt Gemini for deeper micro-concepts, merging them into the canvas dynamically. 
> 
> This turns learning into an active, self-paced exploration."

---

## Slide 4: BhashaTranslate & Live Lecture Feed (2:30 - 3:15)
* **Visual**: Scroll down to the BhashaTranslate Hub. Select "Hindi (हिन्दी)" or "Tamil (தமிழ்)" from the drop-down.
* **Action**: Click "Stream Demo Lecture" or speak into the microphone. Check the English Feed and Vernacular translation panels updating.
* **Script**:
> "Now let's address the linguistic barrier. In many Indian classrooms, the primary medium of instruction is English, which often creates a comprehension barrier. 
> 
> With **BhashaTranslate**, we capture the live microphone audio of the teacher or stream a demo lecture. The speech recognition captures the words, and the Gemini API translates them in real-time to regional languages. 
> 
> Notice how the scientific terms are kept intact or transliterated phonetically, so the technical meaning isn't lost. With our Auto-Speak text-to-speech option, students can listen to the translated audio through headphones. This allows vernacular medium students to study the exact same curriculum as English medium students side-by-side."

---

## Slide 5: SkillBridge Quiz & Accessibility Hub (3:15 - 4:15)
* **Visual**: Click "Evaluate Active Concept" to open the quiz overlay. Click correct/incorrect options, show the mastery mastery chart, and the accessibility panel.
* **Action**: Open the EduAccess Accessibility panel (bottom right). Toggle Dyslexia Font, ADHD Focus, and Deuteranopia (green) colorblind filters.
* **Script**:
> "To guarantee learning outcomes, we have the **SkillBridge Eval Center**. When a student completes a quiz, the system analyzes their answers and updates the mind map nodes. Correct concepts turn green (Mastered), and incorrect concepts turn orange (Mastery Gap). It then compiles a customized study checklist. 
> 
> Finally, we built the **EduAccess Accessibility Hub** for inclusive learning. 
> - Toggling **Dyslexia Font** changes the typography to use weighted bottoms and wider letter tracking to reduce reading strain.
> - Toggling **ADHD Focus Mode** creates a highlighting screen ruler that follows the student's mouse, blocking out visual distractions.
> - We also support custom SVG colorblind matrices, altering the styling dynamically for students with visual limitations.
> - And visually impaired students can enable **Voice Navigation** to control the screen hands-free by speaking simple commands like 'Open Quiz' or 'Select Photosynthesis'."

---

## Slide 6: Feasibility, Scalability & Conclusion (4:15 - 5:00)
* **Visual**: Display a summary slide with contact info.
* **Script**:
> "AcademixIQ is highly feasible and cost-effective. By using the lightning-fast `gemini-2.5-flash` model, we minimize translation and map generation latency to under two seconds, making it scalable for public schools and digital learning portals across India.
> 
> During this prototype phase, the system runs with a built-in sandbox mock mode. If a judge tests the app offline, they can explore our high-fidelity mockups of **Photosynthesis**, **Quantum Computing**, or **Neural Networks**. And with a double-click on the `PROTOTYPE v2` version badge, developers can configure their own Gemini API keys to unlock live concepts globally.
> 
> AcademixIQ is the bridge between static education and inclusive, adaptive learning. Thank you, and I am now open to your questions."
