import React, { useState, useRef, useEffect } from 'react';
import { Network, Sparkles, BookOpen, HelpCircle, Layers, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'root' | 'subtopic' | 'detail';
  val: number;
  x?: number;
  y?: number;
  gapStatus?: 'good' | 'weak' | 'untested';
}

interface Link {
  source: string;
  target: string;
}

interface NodeDetails {
  summary: string;
  questions: string[];
  flashcards: Array<{ q: string; a: string }>;
}

interface MindMapData {
  nodes: Node[];
  links: Link[];
  details: Record<string, NodeDetails>;
}

interface MindMapCanvasProps {
  data: MindMapData;
  activeNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onExpandNode: (nodeId: string, nodeLabel: string) => void;
  isExpanding: boolean;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  data,
  activeNodeId,
  onSelectNode,
  onExpandNode,
  isExpanding
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'questions'>('summary');
  const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);

  // Canvas Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Position nodes inside the viewport when data changes
  useEffect(() => {
    if (!data.nodes || data.nodes.length === 0) return;

    // Detect if the topic has changed by comparing root node labels
    const currentRoot = nodes.find(n => n.type === 'root');
    const newRoot = data.nodes.find(n => n.type === 'root');
    const topicChanged = !!(currentRoot && newRoot && currentRoot.label !== newRoot.label);

    if (topicChanged) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }

    // Build standard positions if not defined
    const center = { x: 380, y: 250 };
    const radiusSub = 140;
    const radiusDet = 240;

    const subtopics = data.nodes.filter(n => n.type === 'subtopic');
    const details = data.nodes.filter(n => n.type === 'detail');

    const positionedNodes = data.nodes.map(node => {
      // Find existing coordinates to preserve dragging (only if topic didn't change)
      if (!topicChanged) {
        const existing = nodes.find(n => n.id === node.id);
        if (existing && existing.x !== undefined && existing.y !== undefined) {
          return { ...node, x: existing.x, y: existing.y };
        }
      }

      // Root node at the center
      if (node.type === 'root') {
        return { ...node, x: center.x, y: center.y };
      }

      // Arrange subtopics circularly around root
      if (node.type === 'subtopic') {
        const idx = subtopics.findIndex(s => s.id === node.id);
        const count = subtopics.length || 1;
        const angle = (idx / count) * 2 * Math.PI;
        return {
          ...node,
          x: center.x + radiusSub * Math.cos(angle),
          y: center.y + radiusSub * Math.sin(angle)
        };
      }

      // Arrange details around subtopics
      const idx = details.findIndex(d => d.id === node.id);
      const count = details.length || 1;
      const angle = (idx / count) * 2 * Math.PI;

      return {
        ...node,
        x: center.x + radiusDet * Math.cos(angle + (idx * 0.1)),
        y: center.y + radiusDet * Math.sin(angle + (idx * 0.1))
      };
    });

    setNodes(positionedNodes);
    setLinks(data.links);
  }, [data]);

  // Handle Canvas panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking directly on a node, don't pan canvas
    if ((e.target as SVGElement).classList.contains('node-circle')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      // Update dragged node position
      const bounds = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - bounds.left;
      const clientY = e.clientY - bounds.top;

      // Unproject mouse coordinates from current zoom/pan
      const x = (clientX - pan.x) / zoom;
      const y = (clientY - pan.y) / zoom;

      setNodes(prev => prev.map(n => n.id === draggedNodeId ? { ...n, x, y } : n));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggedNodeId(id);
    onSelectNode(id);
    setFlippedCardIndex(null); // Reset flashcard flip
  };

  // Helper for drawing links
  const getCoordinates = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return { x: node?.x || 0, y: node?.y || 0 };
  };

  // Selected Node Data
  const activeNode = nodes.find(n => n.id === activeNodeId);
  const activeDetails = activeNodeId ? data.details[activeNodeId] : null;

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') setZoom(z => Math.min(z + 0.15, 2));
    if (type === 'out') setZoom(z => Math.max(z - 0.15, 0.5));
    if (type === 'reset') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  // Color mappings based on gapStatus or type
  const getNodeColor = (node: Node) => {
    if (node.id === activeNodeId) return '#10b981'; // Active node is emerald green glow
    if (node.gapStatus === 'good') return '#10b981'; // Mastered concept
    if (node.gapStatus === 'weak') return '#f97316'; // Weak concept gap (orange/red)
    
    if (node.type === 'root') return '#0f1c3f';
    if (node.type === 'subtopic') return '#1e293b';
    return '#0d1527';
  };

  const getNodeStroke = (node: Node) => {
    if (node.id === activeNodeId) return '#34d399';
    if (node.gapStatus === 'good') return '#059669';
    if (node.gapStatus === 'weak') return '#ea580c';
    if (node.type === 'root') return '#10b981';
    if (node.type === 'subtopic') return '#3b82f6';
    return '#475569';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
      {/* Mind Map Canvas (Left 2 columns) */}
      <div className="lg:col-span-2 glass-panel border border-emerald-500/20 rounded-3xl p-4 flex flex-col h-[520px] relative overflow-hidden group select-none">
        {/* Canvas Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-[#0b172a]/80 backdrop-blur border border-white/5 rounded-xl p-1 shadow-md">
          <button
            onClick={() => handleZoom('in')}
            title="Zoom In"
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg active:scale-95 transition-all cursor-pointer"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg active:scale-95 transition-all cursor-pointer"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => handleZoom('reset')}
            title="Reset Pan/Zoom"
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg active:scale-95 transition-all cursor-pointer"
          >
            <Maximize size={16} />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1"></div>
          <span className="text-[10px] text-slate-400 font-mono px-2">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-[#0a192f]/70 border border-emerald-500/20 px-3 py-1.5 rounded-full shadow text-[10px] text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block animate-pulse"></span>
          Drag Nodes to Organize
        </div>

        {/* SVG Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="flex-1 w-full h-full cursor-grab active:cursor-grabbing rounded-2xl bg-[#070f1e]/80"
        >
          <svg className="w-full h-full">
            {/* Grid pattern background */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Draw Connector Links */}
              {links.map((link, idx) => {
                const sourceCoord = getCoordinates(link.source);
                const targetCoord = getCoordinates(link.target);
                const targetNode = nodes.find(n => n.id === link.target);
                
                const isWeak = targetNode?.gapStatus === 'weak';
                const isGood = targetNode?.gapStatus === 'good';
                
                let strokeColor = 'rgba(255, 255, 255, 0.1)';
                if (isWeak) strokeColor = 'rgba(249, 115, 22, 0.4)';
                else if (isGood) strokeColor = 'rgba(16, 185, 129, 0.4)';
                
                return (
                  <line
                    key={idx}
                    x1={sourceCoord.x}
                    y1={sourceCoord.y}
                    x2={targetCoord.x}
                    y2={targetCoord.y}
                    className="link-line"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Draw Nodes */}
              {nodes.map((node) => (
                <g
                  key={node.id}
                  transform={`translate(${node.x || 0}, ${node.y || 0})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  className="cursor-pointer"
                >
                  {/* Glowing halo behind active/important nodes */}
                  {(node.id === activeNodeId || node.gapStatus === 'weak') && (
                    <circle
                      r={node.val + 8}
                      fill="none"
                      stroke={node.gapStatus === 'weak' ? '#ea580c' : '#10b981'}
                      strokeWidth="2"
                      className="animate-ping opacity-25"
                    />
                  )}

                  {/* Core Node Circle */}
                  <circle
                    r={node.val}
                    fill={getNodeColor(node)}
                    stroke={getNodeStroke(node)}
                    strokeWidth={node.id === activeNodeId ? "3" : "2"}
                    className="node-circle transition-all hover:scale-110 duration-200"
                  />

                  {/* Inner center dot for detail nodes */}
                  {node.type === 'detail' && (
                    <circle r="4" fill="#3b82f6" opacity="0.6" />
                  )}

                  {/* Node Label Text */}
                  <text
                    y={node.val + 16}
                    textAnchor="middle"
                    fill={node.id === activeNodeId ? '#34d399' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight={node.type === 'root' ? 'bold' : 'normal'}
                    className="select-none pointer-events-none drop-shadow-lg"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      {/* Concept Detail View (Right 1 column) */}
      <div className="glass-panel border border-emerald-500/20 rounded-3xl p-5 text-white flex flex-col h-[520px]">
        {activeNode && activeDetails ? (
          <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {activeNode.type} Concept
                </span>
                
                {/* Node Status Pill */}
                {activeNode.gapStatus === 'weak' && (
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md uppercase">
                    Knowledge Gap
                  </span>
                )}
                {activeNode.gapStatus === 'good' && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
                    Mastered
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-1.5 glow-emerald-text truncate">
                {activeNode.label}
              </h3>
            </div>

            {/* Selector Tabs */}
            <div className="flex bg-white/5 border border-white/5 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all font-semibold cursor-pointer ${
                  activeTab === 'summary' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen size={13} />
                Summary
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all font-semibold cursor-pointer ${
                  activeTab === 'flashcards' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={13} />
                Flashcards
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all font-semibold cursor-pointer ${
                  activeTab === 'questions' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle size={13} />
                QA Prep
              </button>
            </div>

            {/* Tab content panel */}
            <div className="flex-1 overflow-y-auto bg-[#081121] border border-white/5 rounded-2xl p-4 text-sm text-slate-300">
              {activeTab === 'summary' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <p className="leading-relaxed text-slate-200">{activeDetails.summary}</p>
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="space-y-3 h-full flex flex-col items-center justify-center animate-in fade-in duration-200">
                  {activeDetails.flashcards && activeDetails.flashcards.length > 0 ? (
                    <div className="w-full flex-1 flex flex-col justify-center gap-3">
                      {activeDetails.flashcards.map((fc, idx) => (
                        <div
                          key={idx}
                          onClick={() => setFlippedCardIndex(flippedCardIndex === idx ? null : idx)}
                          className="h-24 perspective cursor-pointer"
                        >
                          <div
                            className={`relative w-full h-full transition-transform duration-500 transform-style-3d border border-white/10 rounded-xl bg-white/5 flex items-center justify-center p-3 text-center text-xs text-slate-300 font-semibold ${
                              flippedCardIndex === idx ? 'rotate-y-180 bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : ''
                            }`}
                          >
                            {/* Front side */}
                            <div className={`absolute backface-hidden flex flex-col items-center gap-1.5 ${flippedCardIndex === idx ? 'hidden' : ''}`}>
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Question</span>
                              <span>{fc.q}</span>
                            </div>
                            {/* Back side */}
                            <div className={`absolute backface-hidden rotate-y-180 flex flex-col items-center gap-1.5 ${flippedCardIndex !== idx ? 'hidden' : ''}`}>
                              <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold">Answer</span>
                              <span className="text-emerald-100">{fc.a}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">No flashcards for this concept.</div>
                  )}
                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-1 mb-2">
                    Key Conceptual Questions:
                  </h4>
                  <ul className="space-y-2.5">
                    {activeDetails.questions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-xs">
                        <span className="text-emerald-400 font-bold font-mono">{i + 1}.</span>
                        <span className="leading-relaxed text-slate-300">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AI Node Expansion Control */}
            <button
              onClick={() => onExpandNode(activeNode.id, activeNode.label)}
              disabled={isExpanding || activeNode.type === 'detail'}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-semibold rounded-xl text-xs active:scale-95 transition-all shadow-lg shadow-emerald-950/20 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles size={14} className={isExpanding ? 'animate-spin' : ''} />
              {isExpanding ? 'AI Generating Subtopics...' : 'Expand Concept with Gemini'}
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 border border-white/5 animate-pulse">
              <Network size={28} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300">Select a Node</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Click on any concept node on the visual mind-map to inspect summary notes, active flashcards, and conceptual QA reviews.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
