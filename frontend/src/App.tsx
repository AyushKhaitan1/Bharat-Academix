import { useState, useEffect } from 'react';
import { Sparkles, Key, Upload, HelpCircle, Network, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { BhashaPlayer } from './components/BhashaPlayer';
import { MindMapCanvas } from './components/MindMapCanvas';
import { QuizCenter } from './components/QuizCenter';

// Default initial Photosynthesis mind map data
const INITIAL_MINDMAP_DATA = {
  nodes: [
    { id: "1", label: "Photosynthesis", type: "root", val: 24, gapStatus: "untested" },
    { id: "2", label: "Light Reactions", type: "subtopic", val: 16, gapStatus: "untested" },
    { id: "3", label: "Calvin Cycle (Dark)", type: "subtopic", val: 16, gapStatus: "untested" },
    { id: "4", label: "Chloroplast Structure", type: "subtopic", val: 14, gapStatus: "untested" },
    { id: "5", label: "Thylakoid Membrane", type: "detail", val: 10, gapStatus: "untested" },
    { id: "6", label: "Stroma", type: "detail", val: 10, gapStatus: "untested" },
    { id: "7", label: "ATP & NADPH Synthesis", type: "detail", val: 12, gapStatus: "untested" },
    { id: "8", label: "Carbon Fixation (RuBisCO)", type: "detail", val: 12, gapStatus: "untested" },
    { id: "9", label: "G3P Production & Regeneration", type: "detail", val: 10, gapStatus: "untested" }
  ],
  links: [
    { source: "1", target: "2" },
    { source: "1", target: "3" },
    { source: "1", target: "4" },
    { source: "4", target: "5" },
    { source: "4", target: "6" },
    { source: "2", target: "7" },
    { source: "3", target: "8" },
    { source: "3", target: "9" }
  ],
  details: {
    "1": {
      summary: "Photosynthesis is the chemical process by which green plants, algae, and some bacteria convert light energy (usually from the Sun) into chemical energy (glucose), using water and carbon dioxide, while releasing oxygen as a byproduct.",
      questions: ["What are the raw materials required for photosynthesis?", "Write the balanced chemical equation of photosynthesis."],
      flashcards: [
        { q: "What pigment absorbs light during photosynthesis?", a: "Chlorophyll, primarily located inside chloroplasts." },
        { q: "What is the general chemical equation?", a: "6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2" }
      ]
    },
    "2": {
      summary: "Light-dependent reactions occur in the thylakoid membranes of chloroplasts. They require solar energy to split water molecules (photolysis), releasing oxygen and creating energy-carrier molecules: ATP and NADPH.",
      questions: ["Where do light reactions take place?", "What is photolysis of water?"],
      flashcards: [
        { q: "What are the outputs of light reactions?", a: "Oxygen (O2), ATP, and NADPH." },
        { q: "What is the role of Photosystem II (PSII)?", a: "It absorbs light, energizes electrons, and triggers the photolysis of water." }
      ]
    },
    "3": {
      summary: "The Calvin Cycle (light-independent reactions) occurs in the stroma of the chloroplast. It uses ATP and NADPH produced in the light reactions to convert carbon dioxide (CO2) into glucose through three phases: Carbon Fixation, Reduction, and Regeneration.",
      questions: ["Name the three stages of the Calvin Cycle.", "Does the Calvin Cycle happen in complete darkness?"],
      flashcards: [
        { q: "What enzyme catalyzes carbon fixation?", a: "RuBisCO (Ribulose bisphosphate carboxylase-oxygenase)." },
        { q: "What is the primary carbohydrate output of the Calvin Cycle?", a: "G3P (glyceraldehyde 3-phosphate), which is used to make glucose." }
      ]
    },
    "4": {
      summary: "Chloroplasts are specialized double-membraned organelles where photosynthesis takes place. They contain thylakoid discs stacked into grana, floating in a fluid called the stroma.",
      questions: ["Describe the internal structure of a chloroplast.", "What is a granum?"],
      flashcards: [
        { q: "What is the stroma?", a: "The fluid-filled space surrounding the grana inside the chloroplast." },
        { q: "Why are chloroplasts green?", a: "Because they contain chlorophyll pigments which reflect green light." }
      ]
    },
    "5": {
      summary: "The thylakoid membrane is the site of light absorption and electron transport chains. It contains Photosystems I and II, cytochrome complexes, and ATP synthase.",
      questions: ["What complexes are found on the thylakoid membrane?"],
      flashcards: [
        { q: "What is a thylakoid?", a: "A flattened membrane sac inside the chloroplast used to convert light energy into chemical energy." }
      ]
    },
    "6": {
      summary: "The stroma is the colorless fluid surrounding the grana within the chloroplast. It contains ribosomes, chloroplast DNA, starch granules, and enzymes needed for the light-independent reactions.",
      questions: ["What reactions happen in the stroma?"],
      flashcards: [
        { q: "What does the stroma contain?", a: "Enzymes (like RuBisCO), DNA, RNA, ribosomes, and starch." }
      ]
    },
    "7": {
      summary: "ATP and NADPH are synthesis energy molecules. Protons pumped into the thylakoid lumen flow back out through ATP Synthase (chemiosmosis), generating ATP, while NADP+ Reductase reduces NADP+ to NADPH.",
      questions: ["How is ATP generated in chloroplasts?"],
      flashcards: [
        { q: "What is the name of the process that makes ATP using a proton gradient?", a: "Chemiosmosis (photophosphorylation)." }
      ]
    },
    "8": {
      summary: "Carbon fixation starts when CO2 combines with RuBP (a 5-carbon sugar) catalyzed by RuBisCO, splitting into two molecules of 3-PGA (3-phosphoglycerate).",
      questions: ["What is RuBP?", "What does RuBisCO do?"],
      flashcards: [
        { q: "What is the first stable product of carbon fixation?", a: "3-PGA (3-phosphoglycerate)." }
      ]
    },
    "9": {
      summary: "In the reduction phase, 3-PGA is converted to G3P using ATP and NADPH. In the regeneration phase, some G3P molecules go to make glucose, while the rest are recycled back into RuBP using ATP.",
      questions: ["How is RuBP regenerated?"],
      flashcards: [
        { q: "How many G3P molecules are needed to make one glucose molecule?", a: "2 G3P molecules (requires 6 turns of the cycle)." }
      ]
    }
  }
};

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : '';

function App() {
  // Accessibility States
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [adhdMode, setAdhdMode] = useState(false);
  const [colorblindTheme, setColorblindTheme] = useState('normal');
  const [voiceNavActive, setVoiceNavActive] = useState(false);

  // Mindmap Data States
  const [mindmapData, setMindmapData] = useState<any>(INITIAL_MINDMAP_DATA);
  const [activeNodeId, setActiveNodeId] = useState<string | null>("1");
  const [currentTopic, setCurrentTopic] = useState("Photosynthesis");
  const [newTopicInput, setNewTopicInput] = useState("");
  const [isBuildingMap, setIsBuildingMap] = useState(false);
  const [isExpandingNode, setIsExpandingNode] = useState(false);

  // Quiz States
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizTargetNodeId, setQuizTargetNodeId] = useState<string | null>(null);
  const [quizTargetLabel, setQuizTargetLabel] = useState<string | null>(null);

  // File Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // API Key Dialog State
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  // Voice Command Toast state
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // Warning Dialog State
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningModalTitle, setWarningModalTitle] = useState("");
  const [warningModalMessage, setWarningModalMessage] = useState("");

  const triggerWarning = (title: string, message: string) => {
    setWarningModalTitle(title);
    setWarningModalMessage(message);
    setWarningModalOpen(true);
  };

  // Check if API key is in local storage
  useEffect(() => {
    const key = localStorage.getItem('GEMINI_API_KEY');
    if (key) {
      setApiKeyInput(key);
    }
  }, []);

  // Update root element accessibility theme classes
  useEffect(() => {
    const body = document.body;
    body.className = ''; // Reset

    // Apply colorblind mode
    if (colorblindTheme !== 'normal') {
      body.classList.add(`theme-${colorblindTheme}`);
    }

    // Apply dyslexia font mode
    if (dyslexiaMode) {
      body.classList.add('accessibility-dyslexia');
    }
  }, [colorblindTheme, dyslexiaMode]);

  // Save API key
  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKeyInput);
      setApiKeyModalOpen(false);
      triggerWarning("API Key Configured", "API Key configured! Endpoints will now call the live Gemini API.");
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      setApiKeyModalOpen(false);
    }
  };

  // Build Mind Map API Call
  const buildMindmap = async (topicStr: string, notesContent?: string) => {
    setIsBuildingMap(true);
    try {
      const response = await fetch(`${API_BASE}/api/generate-mindmap`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': localStorage.getItem('GEMINI_API_KEY') || ''
        },
        body: JSON.stringify({
          topic: topicStr,
          notesText: notesContent || ''
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate mind map");
      }
      if (data.nodes && data.links) {
        setMindmapData(data);
        setCurrentTopic(topicStr);
        // Select the root node of the new map (first item usually)
        const rootNode = data.nodes.find((n: any) => n.type === 'root');
        if (rootNode) setActiveNodeId(rootNode.id);
      }
    } catch (err: any) {
      console.error("Failed to build mindmap via api:", err);
      triggerWarning(
        "AI Concept Generation Notice",
        err.message || "Failed to build mindmap via server. Running in fallback simulation mode."
      );
      // Reset to simulation fallback so user sees the photosynthesis demo map
      setMindmapData(INITIAL_MINDMAP_DATA);
      setCurrentTopic("Photosynthesis");
      setActiveNodeId("1");
    } finally {
      setIsBuildingMap(false);
    }
  };

  // Expand Concept Node dynamically
  const expandNode = async (nodeId: string, nodeLabel: string) => {
    setIsExpandingNode(true);
    try {
      // Prompt Gemini to output additional detailed sub-nodes for this specific node
      const currentPrompt = `Explain more detailed concepts relating to "${nodeLabel}" within the topic of "${currentTopic}"`;
      
      const response = await fetch(`${API_BASE}/api/generate-mindmap`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': localStorage.getItem('GEMINI_API_KEY') || ''
        },
        body: JSON.stringify({
          topic: `${currentTopic} - ${nodeLabel}`,
          notesText: currentPrompt
        })
      });
      
      const subData = await response.json();
      if (!response.ok) {
        throw new Error(subData.message || subData.error || "Failed to expand node");
      }
      
      if (subData.nodes && subData.links) {
        // Merge the new nodes and links into current map
        // Offsetting new IDs to prevent collisions
        const idOffset = Date.now().toString();
        
        const mergedNodes = [...mindmapData.nodes];
        const mergedLinks = [...mindmapData.links];
        const mergedDetails = { ...mindmapData.details };

        subData.nodes.forEach((newNode: any) => {
          // Skip if node is already present
          if (newNode.type === 'root') return; // Don't merge root node
          
          const newId = `${newNode.id}_${idOffset}`;
          mergedNodes.push({
            ...newNode,
            id: newId,
            type: 'detail', // Coerce to detail nodes
            val: 10,
            gapStatus: 'untested'
          });

          // Link new nodes to expanded node
          if (newNode.type === 'subtopic') {
            mergedLinks.push({
              source: nodeId,
              target: newId
            });
          }

          // Merge details
          if (subData.details && subData.details[newNode.id]) {
            mergedDetails[newId] = subData.details[newNode.id];
          }
        });

        // Add subData links
        subData.links.forEach((newLink: any) => {
          const sId = `${newLink.source}_${idOffset}`;
          const tId = `${newLink.target}_${idOffset}`;
          
          // Connect inside sub-structure only if source and target are details
          const sourceExists = mergedNodes.some(n => n.id === sId);
          const targetExists = mergedNodes.some(n => n.id === tId);
          if (sourceExists && targetExists) {
            mergedLinks.push({
              source: sId,
              target: tId
            });
          }
        });

        setMindmapData({
          nodes: mergedNodes,
          links: mergedLinks,
          details: mergedDetails
        });
        
        triggerWarning("Concept Expansion Success", `Gemini expanded "${nodeLabel}" successfully! New concepts added.`);
      }
    } catch (err: any) {
      console.error("Node expansion failed:", err);
      // Local mockup expansion fallback
      const idOffset = Date.now().toString();
      const newId1 = `mock1_${idOffset}`;
      const newId2 = `mock2_${idOffset}`;
      
      const mergedNodes = [
        ...mindmapData.nodes,
        { id: newId1, label: `${nodeLabel} Detail Alpha`, type: 'detail', val: 11, gapStatus: 'untested' },
        { id: newId2, label: `${nodeLabel} Detail Beta`, type: 'detail', val: 11, gapStatus: 'untested' }
      ];

      const mergedLinks = [
        ...mindmapData.links,
        { source: nodeId, target: newId1 },
        { source: nodeId, target: newId2 }
      ];

      const mergedDetails = {
        ...mindmapData.details,
        [newId1]: {
          summary: `Extracted subconcept detail for ${nodeLabel} illustrating deep biological chemistry linkages.`,
          questions: ["Explain the chemical significance of this subconcept.", "List two examples."],
          flashcards: [{ q: "What is Alpha?", a: "A conceptual subset." }, { q: "Why does it matter?", a: "It binds reactions." }]
        },
        [newId2]: {
          summary: `Secondary detail subconcept for ${nodeLabel} tracking enzymatic properties and efficiency metrics.`,
          questions: ["Why does enzyme structure affect this process?"],
          flashcards: [{ q: "What is Beta?", a: "A structural helper." }]
        }
      };

      setMindmapData({
        nodes: mergedNodes,
        links: mergedLinks,
        details: mergedDetails
      });
      triggerWarning(
        "Prototype Mode Concept Expansion",
        `${err.message || "Failed to expand node using live AI."}\n\nWe have expanded "${nodeLabel}" using pre-loaded high-fidelity mockups.`
      );
    } finally {
      setIsExpandingNode(false);
    }
  };

  // Document upload processor
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        triggerWarning("Document Upload Success", `Document "${data.fileName}" uploaded and parsed successfully! Generating customized concept mind map.`);
        // Run mindmap builder on extracted content
        await buildMindmap(data.fileName.split('.')[0], data.text);
      }
    } catch (err) {
      console.error("Document upload failed:", err);
      // Simulate reading and loading
      triggerWarning(
        "Document Ingest Simulation",
        `Ingesting study file "${uploadFile.name}". Parsing text and compiling custom roadmaps...`
      );
      await buildMindmap(uploadFile.name.split('.')[0], `Extracted mockup content for ${uploadFile.name}`);
    } finally {
      setIsUploading(false);
      setUploadFile(null);
    }
  };

  // Quiz completion handler - updates node gapStatus coloring on mind map
  const handleQuizCompleted = (score: number, total: number, gaps: Record<string, 'good' | 'weak'>) => {
    setMindmapData((prev: any) => {
      const updatedNodes = prev.nodes.map((node: any) => {
        if (gaps[node.id]) {
          return { ...node, gapStatus: gaps[node.id] };
        }
        // Fallback coloring: if score was perfect, color current active node good, otherwise weak
        if (node.id === activeNodeId) {
          return { ...node, gapStatus: score === total ? 'good' : 'weak' };
        }
        return node;
      });
      return { ...prev, nodes: updatedNodes };
    });
  };

  // Voice command execution router
  const executeVoiceCommand = (cmd: string) => {
    console.log("[Handling Voice Command Router]:", cmd);
    
    // Show feedback toast
    setVoiceToast(cmd);
    setTimeout(() => {
      setVoiceToast(null);
    }, 4000);

    if (cmd.includes('quiz') || cmd.includes('test') || cmd.includes('assess')) {
      const targetNode = mindmapData.nodes.find((n: any) => n.id === activeNodeId);
      setQuizTargetNodeId(activeNodeId);
      setQuizTargetLabel(targetNode?.label || currentTopic);
      setQuizOpen(true);
    } else if (cmd.includes('close quiz') || cmd.includes('hide quiz') || cmd.includes('close report')) {
      setQuizOpen(false);
    } else if (cmd.includes('dyslexia') || cmd.includes('font')) {
      setDyslexiaMode(prev => !prev);
    } else if (cmd.includes('focus') || cmd.includes('adhd') || cmd.includes('ruler')) {
      setAdhdMode(prev => !prev);
    } else if (cmd.includes('explain') || cmd.includes('select') || cmd.includes('go to')) {
      // Find concept name from command
      const query = cmd.replace('explain', '').replace('select', '').replace('go to', '').trim();
      const matchingNode = mindmapData.nodes.find((n: any) => 
        n.label.toLowerCase().includes(query)
      );
      if (matchingNode) {
        setActiveNodeId(matchingNode.id);
        triggerWarning("Voice Selection Navigation", `Voice command selected concept node: "${matchingNode.label}"`);
      }
    } else if (cmd.includes('translate') || cmd.includes('hindi') || cmd.includes('tamil')) {
      triggerWarning("Voice Translation Command", `Voice navigation command registered: "${cmd}". Adapting regional BhashaTranslate configuration.`);
    }
  };

  const openQuizForActiveNode = () => {
    const node = mindmapData.nodes.find((n: any) => n.id === activeNodeId);
    setQuizTargetNodeId(activeNodeId);
    setQuizTargetLabel(node ? node.label : currentTopic);
    setQuizOpen(true);
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col relative select-none">
      
      {/* Dynamic Glow Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* ----------------------------------------------------
         Navbar Header Section
         ---------------------------------------------------- */}
      <header className="w-full px-6 py-4 glass-panel border-b border-emerald-500/15 flex items-center justify-between shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white glow-emerald shadow-lg">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AcademixIQ
              <span 
                onDoubleClick={() => setApiKeyModalOpen(true)}
                className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-widest font-mono cursor-pointer select-none"
                title="Double-click for Dev Config"
              >
                PROTOTYPE v2
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">National Level Hackathon Entry | Solo Innovator: Ayush Khaitan</p>
          </div>
        </div>

        {/* Global Action Header Items */}
        <div className="flex items-center gap-3">
          {/* Active topic display */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-xs text-slate-300">
            <BookOpen size={13} className="text-emerald-400" />
            Active Module: <strong className="text-white">{currentTopic}</strong>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------
         Main Dashboard Grid
         ---------------------------------------------------- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 mt-6 grid grid-cols-1 gap-6 z-10">
        
        {/* Row 1: Study Topic Ingestor & Real-time Uploader */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Study Material Generator */}
          <div className="md:col-span-2 glass-panel border border-emerald-500/10 rounded-3xl p-5 flex flex-col justify-center">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Network size={18} className="text-emerald-400" />
              AI Concept Architect
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Enter any scientific or academic topic below. Google Gemini will instantly synthesize a structured conceptual mind map, summaries, and assessments.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type topic (e.g. Quantum Computing, Photosynthesis, Neural Networks)..."
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                className="flex-1 bg-[#0b172a] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 rounded-2xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-500"
              />
              <button
                onClick={() => {
                  if (newTopicInput.trim()) {
                    buildMindmap(newTopicInput.trim());
                    setNewTopicInput("");
                  }
                }}
                disabled={isBuildingMap || !newTopicInput.trim()}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer shadow-lg hover:shadow-emerald-950/20"
              >
                {isBuildingMap ? <RefreshCw className="animate-spin" size={14} /> : 'Generate AI Map'}
              </button>
            </div>
          </div>

          {/* Card 2: Document parser */}
          <form onSubmit={handleFileUpload} className="glass-panel border border-emerald-500/10 rounded-3xl p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-1.5">
                <Upload size={16} className="text-emerald-400" />
                Ingest Notes (PDF / TXT)
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Upload your lecture PDF/notes. We'll parse the file text and generate customized roadmaps.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <input
                type="file"
                accept=".txt,.pdf"
                id="notes-file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="notes-file"
                className="border border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl py-3 px-4 text-center cursor-pointer hover:bg-white/5 transition-all block text-xs"
              >
                {uploadFile ? (
                  <span className="text-emerald-300 font-semibold truncate block max-w-[200px] mx-auto">
                    {uploadFile.name}
                  </span>
                ) : (
                  <span className="text-slate-400">Choose study file</span>
                )}
              </label>

              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:text-slate-500 active:scale-95 cursor-pointer"
              >
                {isUploading ? <RefreshCw className="animate-spin" size={14} /> : 'Process Study Notes'}
              </button>
            </div>
          </form>

        </div>

        {/* Row 2: Core VisualMind Canvas Map and Detail Drawers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Network className="text-emerald-400 animate-pulse" />
              VisualMind Interactive Canvas
            </h2>

            <button
              onClick={openQuizForActiveNode}
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/30 text-xs font-bold rounded-full active:scale-95 transition-all cursor-pointer glow-pulse"
            >
              <HelpCircle size={14} />
              Evaluate Active Concept
            </button>
          </div>

          <MindMapCanvas
            data={mindmapData}
            activeNodeId={activeNodeId}
            onSelectNode={setActiveNodeId}
            onExpandNode={expandNode}
            isExpanding={isExpandingNode}
          />
        </div>

        {/* Row 3: BhashaTranslate Hub & Classroom Audio Translation stream */}
        <div className="grid grid-cols-1 gap-6">
          <BhashaPlayer
            onTranslatedText={(_text) => {
              // Optionally react in main layout to translation updates
            }}
          />
        </div>

      </main>

      {/* ----------------------------------------------------
         EduAccess Accessibility Tooling & Voice Floating Panel
         ---------------------------------------------------- */}
      <AccessibilityPanel
        dyslexiaMode={dyslexiaMode}
        setDyslexiaMode={setDyslexiaMode}
        adhdMode={adhdMode}
        setAdhdMode={setAdhdMode}
        colorblindTheme={colorblindTheme}
        setColorblindTheme={setColorblindTheme}
        voiceNavActive={voiceNavActive}
        setVoiceNavActive={setVoiceNavActive}
        executeVoiceCommand={executeVoiceCommand}
      />

      {/* ----------------------------------------------------
         Modals (Quiz assessment & Settings)
         ---------------------------------------------------- */}
      
      {/* Quiz assessment Portal */}
      {quizOpen && quizTargetNodeId && (
        <QuizCenter
          topic={currentTopic}
          nodeId={quizTargetNodeId}
          nodeLabel={quizTargetLabel}
          nodes={mindmapData.nodes}
          onQuizCompleted={handleQuizCompleted}
          onClose={() => setQuizOpen(false)}
        />
      )}

      {/* API Key settings Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a192f] border border-emerald-500/30 rounded-3xl p-6 text-white shadow-2xl relative flex flex-col gap-4 glow-pulse">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Key className="text-emerald-400" />
              <h2 className="text-base font-bold">Google Gemini API Key Config</h2>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-400">
              Paste your Gemini API key from Google AI Studio. This key is saved locally in your browser storage and is used to call generative models directly.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GEMINI API KEY</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="bg-[#0b172a] border border-white/10 hover:border-white/20 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="bg-amber-500/15 border border-amber-500/20 text-[10px] leading-relaxed p-3 rounded-lg text-amber-300 flex gap-2">
              <AlertCircle size={16} className="shrink-0 text-amber-400" />
              <span>
                If no API Key is provided, the Express backend automatically falls back to static Mock Mode so you can demonstrate the prototype without key validation errors.
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-2">
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="px-4 py-2 border border-white/10 hover:border-white/20 text-xs font-semibold rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveApiKey}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Glassmorphic Warning Modal */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a192f] border border-amber-500/30 rounded-3xl p-6 text-white shadow-2xl relative flex flex-col gap-4 glow-amber">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <AlertCircle className="text-amber-400 animate-pulse animate-duration-1000" size={24} />
              <h2 className="text-base font-bold text-amber-200">{warningModalTitle}</h2>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
              {warningModalMessage}
            </p>

            <div className="bg-[#0b172a] border border-white/5 p-3 rounded-xl flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supported Offline Sandbox Modules</span>
              <div className="flex flex-wrap gap-1.5">
                {['Photosynthesis', 'Quantum Computing', 'Neural Networks'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      buildMindmap(topic);
                      setWarningModalOpen(false);
                    }}
                    className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setWarningModalOpen(false);
                  setApiKeyModalOpen(true);
                }}
                className="px-4 py-2 border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30 text-xs font-semibold rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Configure Gemini API Key
              </button>
              <button
                onClick={() => setWarningModalOpen(false)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Command Toast Indicator */}
      {voiceToast && (
        <div className="fixed bottom-24 left-6 z-[9999] bg-[#0f1c3f]/95 backdrop-blur border-2 border-emerald-500/80 text-white rounded-2xl py-3.5 px-5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-left-5 fade-in duration-300 max-w-xs glow-emerald pointer-events-none">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0"></div>
          <p className="text-xs font-semibold leading-normal">
            Voice command recognized: <br />
            <strong className="text-emerald-300 font-mono">"{voiceToast}"</strong>
          </p>
        </div>
      )}

      {/* Footer credits banner */}
      <footer className="w-full text-center text-[10px] text-slate-500 mt-12 px-6">
        <p>© 2026 AcademixIQ. Built for Bharat Academix CodeQuest. Designed for high accessibility and premium student experience.</p>
      </footer>
    </div>
  );
}

export default App;
