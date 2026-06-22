import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN

# Target local paths
DASHBOARD_DEST = "mockup_dashboard.png"
ACCESSIBILITY_DEST = "mockup_accessibility.png"

# Color Scheme: AcademixIQ Brand Guidelines
DARK_BLUE = RGBColor(10, 25, 47)       # Premium background #0a192f
DARK_BLUE_LIGHT = RGBColor(23, 42, 69)  # Card background in dark slides #172a45
EMERALD = RGBColor(16, 185, 129)       # Primary accent #10b981
EMERALD_MUTED = RGBColor(13, 148, 136) # Teal accent #0d9488
WHITE = RGBColor(255, 255, 255)
OFF_WHITE = RGBColor(248, 250, 252)    # Light theme background #f8fafc
TEXT_DARK = RGBColor(30, 41, 59)       # Slate text #1e293b
TEXT_MUTED = RGBColor(100, 116, 139)   # Secondary text #64748b

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6] # Blank slide layout

def add_full_background(slide, color):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = color
    bg.line.color.rgb = color
    return bg

def add_header(slide, title_text, dark_mode=False):
    # Top Accent Bar
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.15))
    bar.fill.solid()
    bar.fill.fore_color.rgb = EMERALD
    bar.line.color.rgb = EMERALD
    
    # Title Text Box
    title_box = slide.shapes.add_textbox(Inches(0.6), Inches(0.4), Inches(12.0), Inches(0.8))
    tf = title_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = "Arial"
    p.font.size = Pt(32)
    p.font.bold = True
    p.font.color.rgb = WHITE if dark_mode else DARK_BLUE

def add_card(slide, left, top, width, height, bg_color, border_color=None):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
    else:
        card.line.color.rgb = bg_color
    return card

# ========================================================
# SLIDE 1: PITCH TITLE SLIDE (DARK THEME)
# ========================================================
slide1 = prs.slides.add_slide(blank_layout)
add_full_background(slide1, DARK_BLUE)

# Bottom Emerald line
line = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(7.3), Inches(13.333), Inches(0.2))
line.fill.solid()
line.fill.fore_color.rgb = EMERALD
line.line.color.rgb = EMERALD

# Title Frame
title_box = slide1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(3.2))
tf = title_box.text_frame
tf.word_wrap = True

# Main Title
p1 = tf.paragraphs[0]
p1.text = "AcademixIQ"
p1.font.name = "Arial"
p1.font.size = Pt(64)
p1.font.bold = True
p1.font.color.rgb = WHITE
p1.space_after = Pt(8)

# Subtitle
p2 = tf.add_paragraph()
p2.text = "Multi-Modal AI Classroom Accessibility Platform"
p2.font.name = "Arial"
p2.font.size = Pt(24)
p2.font.bold = True
p2.font.color.rgb = EMERALD
p2.space_after = Pt(12)

p3 = tf.add_paragraph()
p3.text = "Democratizing Academic Content through Adaptive Visualizations, Regional Translations, & Mastery Diagnostic Tools"
p3.font.name = "Arial"
p3.font.size = Pt(16)
p3.font.color.rgb = WHITE

# Team Info Box (Bottom Left)
team_box = slide1.shapes.add_textbox(Inches(1.0), Inches(5.2), Inches(6.5), Inches(1.5))
tf_team = team_box.text_frame
tf_team.word_wrap = True
pt1 = tf_team.paragraphs[0]
pt1.text = "Team ID: ayushkhaitan2004"
pt1.font.name = "Arial"
pt1.font.bold = True
pt1.font.size = Pt(14)
pt1.font.color.rgb = EMERALD
pt2 = tf_team.add_paragraph()
pt2.text = "Solo Innovator: Ayush Khaitan  |  SRMIST Ghaziabad"
pt2.font.name = "Arial"
pt2.font.size = Pt(13)
pt2.font.color.rgb = WHITE
pt3 = tf_team.add_paragraph()
pt3.text = "Bharat Academix CodeQuest 2026  |  Final Submission"
pt3.font.name = "Arial"
pt3.font.size = Pt(11)
pt3.font.color.rgb = TEXT_MUTED

# ========================================================
# SLIDE 2: THE PROBLEM STATEMENT (LIGHT THEME)
# ========================================================
slide2 = prs.slides.add_slide(blank_layout)
add_full_background(slide2, OFF_WHITE)
add_header(slide2, "The Problem Statement in Indian Classrooms")

# Left Challenges Card
add_card(slide2, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.2), WHITE, border_color=DARK_BLUE)
challenges_box = slide2.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(5.2), Inches(4.8))
tf_c = challenges_box.text_frame
tf_c.word_wrap = True

pc1 = tf_c.paragraphs[0]
pc1.text = "Core Accessibility Barriers:"
pc1.font.name = "Arial"
pc1.font.size = Pt(20)
pc1.font.bold = True
pc1.font.color.rgb = DARK_BLUE
pc1.space_after = Pt(16)

challenges = [
    ("Linguistic Exclusion:", " Over 80% of digital academic literature is in English. Vernacular medium students fall behind due to language comprehension gaps."),
    ("Cognitive Strain:", " Students with learning profiles like ADHD or Dyslexia face severe text fatigue when presented with long, unstructured slides or textbook chapters."),
    ("Diagnostic Mastery Gaps:", " Standard classrooms evaluate retrospectively. There is no real-time diagnostic pipeline to map exactly which subconcept a student struggles to master.")
]
for title, desc in challenges:
    p = tf_c.add_paragraph()
    p.space_after = Pt(12)
    run_title = p.add_run()
    run_title.text = "• " + title + " "
    run_title.font.bold = True
    run_title.font.size = Pt(13)
    run_title.font.color.rgb = DARK_BLUE
    run_desc = p.add_run()
    run_desc.text = desc
    run_desc.font.size = Pt(13)
    run_desc.font.color.rgb = TEXT_DARK

# Right Impact/Metrics Card
add_card(slide2, Inches(6.8), Inches(1.5), Inches(5.6), Inches(5.2), DARK_BLUE)
stat_box = slide2.shapes.add_textbox(Inches(7.0), Inches(1.7), Inches(5.2), Inches(4.8))
tf_s = stat_box.text_frame
tf_s.word_wrap = True

ps1 = tf_s.paragraphs[0]
ps1.text = "The Scale of Impact:"
ps1.font.name = "Arial"
ps1.font.size = Pt(20)
ps1.font.bold = True
ps1.font.color.rgb = EMERALD
ps1.space_after = Pt(20)

stats = [
    ("10M+ Students", "Studying in regional language mediums face technical language gaps annually."),
    ("< 5% of EdTech", "Provides customizable typographic or visual focus tools for neurodiverse students."),
    ("48 Hours", "Is the typical timeline where a student forgets 80% of unstructured text-based lessons.")
]
for title, desc in stats:
    p = tf_s.add_paragraph()
    p.space_after = Pt(14)
    run_title = p.add_run()
    run_title.text = title + "\n"
    run_title.font.bold = True
    run_title.font.size = Pt(22)
    run_title.font.color.rgb = WHITE
    run_desc = p.add_run()
    run_desc.text = desc
    run_desc.font.size = Pt(12)
    run_desc.font.color.rgb = EMERALD

# ========================================================
# SLIDE 3: PLATFORM ARCHITECTURE - 4 CORE PILLARS (LIGHT)
# ========================================================
slide3 = prs.slides.add_slide(blank_layout)
add_full_background(slide3, OFF_WHITE)
add_header(slide3, "AcademixIQ: The Four Multi-Modal Pillars")

pillars = [
    ("VisualMind Canvas", "Transforms complex technical documents or text notes into interactive, 3D conceptual mind maps. Features dynamic node expansion powered by Gemini 2.5 Flash.", Inches(0.8), Inches(1.6)),
    ("BhashaTranslate Live", "Captures classroom voice audio via browser microphone. Translates English lessons into 6 major regional Indian scripts (Hindi, Tamil, etc.) with synchronized TTS.", Inches(6.8), Inches(1.6)),
    ("SkillBridge Evaluation", "Contextual MCQ assessments mapped directly onto concept nodes. Identifies gaps, updates node colors (Mastered/Gap), and compiles customized study checklists.", Inches(0.8), Inches(4.2)),
    ("EduAccess Engine", "Accessibility settings offering OpenDyslexic fonts, mouse-guided focus rulers for ADHD, SVG colorblindness filters, and hands-free voice command navigation.", Inches(6.8), Inches(4.2))
]

for title, desc, left, top in pillars:
    add_card(slide3, left, top, Inches(5.6), Inches(2.2), WHITE, border_color=EMERALD)
    tb = slide3.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), Inches(5.2), Inches(1.8))
    tf_p = tb.text_frame
    tf_p.word_wrap = True
    
    p1 = tf_p.paragraphs[0]
    p1.text = title
    p1.font.name = "Arial"
    p1.font.bold = True
    p1.font.size = Pt(18)
    p1.font.color.rgb = DARK_BLUE
    p1.space_after = Pt(8)
    
    p2 = tf_p.add_paragraph()
    p2.text = desc
    p2.font.name = "Arial"
    p2.font.size = Pt(13)
    p2.font.color.rgb = TEXT_DARK

# ========================================================
# SLIDE 4: VISUALMIND - INTERACTIVE CONCEPT CANVAS (LIGHT)
# ========================================================
slide4 = prs.slides.add_slide(blank_layout)
add_full_background(slide4, OFF_WHITE)
add_header(slide4, "VisualMind: Interactive Concept Mapping")

# Left details
add_card(slide4, Inches(0.8), Inches(1.5), Inches(5.0), Inches(5.2), WHITE, border_color=DARK_BLUE)
vm_tb = slide4.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(4.6), Inches(4.8))
tf_vm = vm_tb.text_frame
tf_vm.word_wrap = True

pvm1 = tf_vm.paragraphs[0]
pvm1.text = "Conceptual Graph Modeling:"
pvm1.font.name = "Arial"
pvm1.font.size = Pt(20)
pvm1.font.bold = True
pvm1.font.color.rgb = DARK_BLUE
pvm1.space_after = Pt(15)

vm_pts = [
    ("Structured Graphing:", " Breaks arbitrary academic topics into Root, Subtopic, and Detail nodes on an interactive HTML5 canvas."),
    ("Self-Paced Navigation:", " Selecting a node displays summaries, flashcards, and conceptual study questions inside a sliding drawer panel."),
    ("Dynamic Node Expansion:", " Students double-click subtopics to prompt Gemini to generate and branch out further detail nodes on the fly.")
]
for title, desc in vm_pts:
    p = tf_vm.add_paragraph()
    p.space_after = Pt(12)
    r1 = p.add_run()
    r1.text = "• " + title + " "
    r1.font.bold = True
    r1.font.size = Pt(13)
    r1.font.color.rgb = DARK_BLUE
    r2 = p.add_run()
    r2.text = desc
    r2.font.size = Pt(13)
    r2.font.color.rgb = TEXT_DARK

# Right image placeholder
if os.path.exists(DASHBOARD_DEST):
    slide4.shapes.add_picture(DASHBOARD_DEST, Inches(6.1), Inches(1.5), Inches(6.4), Inches(5.2))
else:
    fallback = slide4.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(6.1), Inches(1.5), Inches(6.4), Inches(5.2))
    fallback.fill.solid()
    fallback.fill.fore_color.rgb = DARK_BLUE_LIGHT
    fallback.line.color.rgb = EMERALD

# ========================================================
# SLIDE 5: BHASHATRANSLATE - REAL-TIME REGIONAL TRANSLATOR (LIGHT)
# ========================================================
slide5 = prs.slides.add_slide(blank_layout)
add_full_background(slide5, OFF_WHITE)
add_header(slide5, "BhashaTranslate: Regional Language Hub")

# Left Column: Features
add_card(slide5, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.2), WHITE, border_color=EMERALD)
bt_tb = slide5.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(5.2), Inches(4.8))
tf_bt = bt_tb.text_frame
tf_bt.word_wrap = True

pbt1 = tf_bt.paragraphs[0]
pbt1.text = "Classroom Audio Translation:"
pbt1.font.name = "Arial"
pbt1.font.size = Pt(20)
pbt1.font.bold = True
pbt1.font.color.rgb = DARK_BLUE
pbt1.space_after = Pt(15)

bt_pts = [
    ("Live Vernacular Script Output:", " Captures English lecture audio and instantly translates it into standard regional scripts (Devanagari, Tamil, etc.), rather than phonetic English letters."),
    ("SpeechSynthesis (TTS) Vocalizer:", " Integrates system regional voices (Hindi, Tamil, Kannada, Telugu, Bengali, Marathi) to speak translations aloud with local accent profiles."),
    ("Asynchronous Voice Loading:", " Subscribes to browser voice-change triggers to prevent silent audio execution on page startup.")
]
for title, desc in bt_pts:
    p = tf_bt.add_paragraph()
    p.space_after = Pt(12)
    r1 = p.add_run()
    r1.text = "• " + title + " "
    r1.font.bold = True
    r1.font.size = Pt(13)
    r1.font.color.rgb = DARK_BLUE
    r2 = p.add_run()
    r2.text = desc
    r2.font.size = Pt(13)
    r2.font.color.rgb = TEXT_DARK

# Right Column: The preloaded modules
add_card(slide5, Inches(6.8), Inches(1.5), Inches(5.6), Inches(5.2), DARK_BLUE)
pt_tb2 = slide5.shapes.add_textbox(Inches(7.0), Inches(1.7), Inches(5.2), Inches(4.8))
tf_bt2 = pt_tb2.text_frame
tf_bt2.word_wrap = True

pbt2 = tf_bt2.paragraphs[0]
pbt2.text = "High-Fidelity Sandbox Mockups:"
pbt2.font.name = "Arial"
pbt2.font.size = Pt(20)
pbt2.font.bold = True
pbt2.font.color.rgb = EMERALD
pbt2.space_after = Pt(20)

bt_pts2 = [
    ("Photosynthesis Lesson Module", "Full 5-page text stream translating scientific processes like Calvin Cycle and RuBisCO into actual Indian scripts."),
    ("Quantum Computing Module", "Superposition and Shor's Algorithm explanations in native script templates."),
    ("Neural Network Module", "Backpropagation and Convolutional edge detections mapped into regional vernaculars.")
]
for title, desc in bt_pts2:
    p = tf_bt2.add_paragraph()
    p.space_after = Pt(14)
    r1 = p.add_run()
    r1.text = title + "\n"
    r1.font.bold = True
    r1.font.size = Pt(14)
    r1.font.color.rgb = WHITE
    r2 = p.add_run()
    r2.text = desc
    r2.font.size = Pt(12)
    r2.font.color.rgb = EMERALD

# ========================================================
# SLIDE 6: SKILLBRIDGE - DIAGNOSING MASTERY GAPS (LIGHT)
# ========================================================
slide6 = prs.slides.add_slide(blank_layout)
add_full_background(slide6, OFF_WHITE)
add_header(slide6, "SkillBridge: Dynamic Mastery Diagnostics")

# Left Column: Assessment Flow
add_card(slide6, Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.2), WHITE, border_color=DARK_BLUE)
sb_tb = slide6.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(5.2), Inches(4.8))
tf_sb = sb_tb.text_frame
tf_sb.word_wrap = True

psb1 = tf_sb.paragraphs[0]
psb1.text = "Evaluation & Feedback Loop:"
psb1.font.name = "Arial"
psb1.font.size = Pt(20)
psb1.font.bold = True
psb1.font.color.rgb = DARK_BLUE
psb1.space_after = Pt(15)

sb_pts = [
    ("Adaptive Quiz Generation:", " Automatically extracts key concepts from Gemini JSON structures to test memory, recall, and application."),
    ("Real-Time Mastery Mapping:", " Missed questions are linked to specific node labels. The canvas updates node gap status automatically."),
    ("Mastery Color Coding:", " Mastered nodes turn green (Mastery); weak nodes turn orange (Mastery Gap) to direct student focus.")
]
for title, desc in sb_pts:
    p = tf_sb.add_paragraph()
    p.space_after = Pt(12)
    r1 = p.add_run()
    r1.text = "• " + title + " "
    r1.font.bold = True
    r1.font.size = Pt(13)
    r1.font.color.rgb = DARK_BLUE
    r2 = p.add_run()
    r2.text = desc
    r2.font.size = Pt(13)
    r2.font.color.rgb = TEXT_DARK

# Right Column: Visual Checklists
add_card(slide6, Inches(6.8), Inches(1.5), Inches(5.6), Inches(5.2), DARK_BLUE)
sb_tb2 = slide6.shapes.add_textbox(Inches(7.0), Inches(1.7), Inches(5.2), Inches(4.8))
tf_sb2 = sb_tb2.text_frame
tf_sb2.word_wrap = True

psb2 = tf_sb2.paragraphs[0]
psb2.text = "Mastery Output Features:"
psb2.font.name = "Arial"
psb2.font.size = Pt(20)
psb2.font.bold = True
psb2.font.color.rgb = EMERALD
psb2.space_after = Pt(20)

sb_pts2 = [
    ("SVG Concept Mastery Chart", "Renders dynamic visual bar charts tracking core subconcepts and percentage scores automatically."),
    ("Adaptive Study Checklist", "Builds a checklist of missed nodes (e.g. 'Review Calvin Cycle' or 'Examine thylakoid'), giving students targeted study instructions.")
]
for title, desc in sb_pts2:
    p = tf_sb2.add_paragraph()
    p.space_after = Pt(14)
    r1 = p.add_run()
    r1.text = title + "\n"
    r1.font.bold = True
    r1.font.size = Pt(15)
    r1.font.color.rgb = WHITE
    r2 = p.add_run()
    r2.text = desc
    r2.font.size = Pt(12)
    r2.font.color.rgb = EMERALD

# ========================================================
# SLIDE 7: EDUACCESS - UNIVERSAL ACCESSIBILITY TOOLKIT (LIGHT)
# ========================================================
slide7 = prs.slides.add_slide(blank_layout)
add_full_background(slide7, OFF_WHITE)
add_header(slide7, "EduAccess: Inclusivity & Accessibility Panel")

# Left Image
if os.path.exists(ACCESSIBILITY_DEST):
    slide7.shapes.add_picture(ACCESSIBILITY_DEST, Inches(0.8), Inches(1.5), Inches(5.0), Inches(5.2))
else:
    fallback = slide7.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(5.0), Inches(5.2))
    fallback.fill.solid()
    fallback.fill.fore_color.rgb = DARK_BLUE_LIGHT
    fallback.line.color.rgb = EMERALD

# Right details
add_card(slide7, Inches(6.2), Inches(1.5), Inches(6.3), Inches(5.2), WHITE, border_color=DARK_BLUE)
ea_tb = slide7.shapes.add_textbox(Inches(6.4), Inches(1.7), Inches(5.9), Inches(4.8))
tf_ea = ea_tb.text_frame
tf_ea.word_wrap = True

pea1 = tf_ea.paragraphs[0]
pea1.text = "Accessibility Enhancements:"
pea1.font.name = "Arial"
pea1.font.size = Pt(20)
pea1.font.bold = True
pea1.font.color.rgb = DARK_BLUE
pea1.space_after = Pt(12)

ea_pts = [
    ("Dyslexia Font Mode:", " Switches styles to OpenDyslexic character spacing with heavier bottom weights, decreasing letter confusion."),
    ("ADHD Focus Ruler:", " Darkens screen segments and renders a horizontal highlighting ruler following the mouse cursor to boost concentration."),
    ("Contrast & Color Blind Filters:", " Injects real-time SVG matrix color filters (Protanopia, Deuteranopia, Tritanopia) directly into the DOM."),
    ("Voice Command Navigation:", " Captures commands like 'open quiz', 'explain superposition' to control the interface hands-free.")
]
for title, desc in ea_pts:
    p = tf_ea.add_paragraph()
    p.space_after = Pt(10)
    r1 = p.add_run()
    r1.text = "• " + title + " "
    r1.font.bold = True
    r1.font.size = Pt(13)
    r1.font.color.rgb = DARK_BLUE
    r2 = p.add_run()
    r2.text = desc
    r2.font.size = Pt(13)
    r2.font.color.rgb = TEXT_DARK

# ========================================================
# SLIDE 8: SYSTEM ARCHITECTURE & SCALABILITY (LIGHT)
# ========================================================
slide8 = prs.slides.add_slide(blank_layout)
add_full_background(slide8, OFF_WHITE)
add_header(slide8, "System Architecture & Scalability")

# Column 1: Ingestion
add_card(slide8, Inches(0.8), Inches(1.8), Inches(3.6), Inches(4.8), WHITE, border_color=DARK_BLUE)
col1_tb = slide8.shapes.add_textbox(Inches(0.9), Inches(2.0), Inches(3.4), Inches(4.4))
tf_col1 = col1_tb.text_frame
tf_col1.word_wrap = True
pcol1 = tf_col1.paragraphs[0]
pcol1.text = "1. INGESTION LAYER"
pcol1.font.bold = True
pcol1.font.size = Pt(15)
pcol1.font.color.rgb = DARK_BLUE
pcol1.space_after = Pt(12)

col1_pts = [
    "• HTML5 Audio Microphone Input",
    "• PDF/TXT Study Notes uploads",
    "• SpeechRecognition voice command capture (native browser API)",
    "• Stored environment API keys"
]
for pt in col1_pts:
    p = tf_col1.add_paragraph()
    p.text = pt
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

# Column 2: Backend/AI Processing
add_card(slide8, Inches(4.8), Inches(1.8), Inches(3.6), Inches(4.8), DARK_BLUE)
col2_tb = slide8.shapes.add_textbox(Inches(4.9), Inches(2.0), Inches(3.4), Inches(4.4))
tf_col2 = col2_tb.text_frame
tf_col2.word_wrap = True
pcol2 = tf_col2.paragraphs[0]
pcol2.text = "2. AI ORCHESTRATION"
pcol2.font.bold = True
pcol2.font.size = Pt(15)
pcol2.font.color.rgb = EMERALD
pcol2.space_after = Pt(12)

col2_pts = [
    "• Node.js & Express.js server",
    "• Google Generative AI v1beta SDK",
    "• Gemini 2.5 Flash model",
    "• Custom prompts extracting structured JSON graphs & MCQ datasets",
    "• Keyword-based Mock Sandbox routers"
]
for pt in col2_pts:
    p = tf_col2.add_paragraph()
    p.text = pt
    p.font.size = Pt(12)
    p.font.color.rgb = WHITE
    p.space_after = Pt(8)

# Column 3: Presentation
add_card(slide8, Inches(8.8), Inches(1.8), Inches(3.7), Inches(4.8), WHITE, border_color=EMERALD)
col3_tb = slide8.shapes.add_textbox(Inches(8.9), Inches(2.0), Inches(3.5), Inches(4.4))
tf_col3 = col3_tb.text_frame
tf_col3.word_wrap = True
pcol3 = tf_col3.paragraphs[0]
pcol3.text = "3. PRESENTATION LAYER"
pcol3.font.bold = True
pcol3.font.size = Pt(15)
pcol3.font.color.rgb = DARK_BLUE
pcol3.space_after = Pt(12)

col3_pts = [
    "• React dynamic canvas canvas nodes",
    "• Dynamic color state variables mapping mastery metrics",
    "• Asynchronous voice loader triggering SpeechSynthesis (TTS)",
    "• Inline SVG color matrix filters"
]
for pt in col3_pts:
    p = tf_col3.add_paragraph()
    p.text = pt
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(8)

# Save the presentation
output_name = "AcademixIQ_Pitch_Deck.pptx"
try:
    prs.save(output_name)
    print(f"Presentation generated successfully: {output_name}")
except Exception as e:
    print(f"Error saving presentation: {e}")
