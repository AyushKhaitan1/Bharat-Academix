import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, Award, ArrowRight, RefreshCw, BarChart2, Star, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  concept?: string;
}

interface Node {
  id: string;
  label: string;
  type: 'root' | 'subtopic' | 'detail';
  val: number;
  gapStatus?: 'good' | 'weak' | 'untested';
}

interface QuizCenterProps {
  topic: string;
  nodeId: string | null;
  nodeLabel: string | null;
  nodes: Node[];
  onQuizCompleted: (score: number, total: number, gaps: Record<string, 'good' | 'weak'>) => void;
  onClose: () => void;
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:5000' : '';

export const QuizCenter: React.FC<QuizCenterProps> = ({
  topic,
  nodeId,
  nodeLabel,
  nodes,
  onQuizCompleted,
  onClose
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Post quiz results state
  const [quizFinished, setQuizFinished] = useState(false);
  const [answersLog, setAnswersLog] = useState<boolean[]>([]);

  // Fetch Quiz API from Backend
  const startQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/generate-quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': localStorage.getItem('GEMINI_API_KEY') || ''
        },
        body: JSON.stringify({ topic, nodeId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load quiz");
      }
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data);
        setStarted(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to load quiz from API, falling back to mock quiz:", err);
      // Fallback mock questions list
      const fallbackMCQs = [
        {
          "question": "What is the primary role of RuBisCO in the Calvin Cycle?",
          "options": [
            "Splitting water into oxygen and hydrogen",
            "Synthesizing ATP from ADP",
            "Catalyzing the fixation of carbon dioxide to RuBP",
            "Transporting electrons to Photosystem I"
          ],
          "answer": 2,
          "explanation": "RuBisCO binds carbon dioxide to Ribulose bisphosphate (RuBP), initiating the carbon fixation stage.",
          "concept": "Carbon Fixation (RuBisCO)"
        },
        {
          "question": "Which of the following is produced during the light-dependent reactions?",
          "options": [
            "Glucose and RuBP",
            "ATP, NADPH, and Oxygen",
            "G3P and Carbon Dioxide",
            "Water and NADP+"
          ],
          "answer": 1,
          "explanation": "Light reactions use water and sunlight to synthesize ATP and NADPH, releasing Oxygen as a gaseous byproduct.",
          "concept": "Light Reactions"
        },
        {
          "question": "Where are the pigments responsible for absorbing light energy located?",
          "options": [
            "Floating in the chloroplast Stroma",
            "Within the Thylakoid Membrane",
            "In the Outer Chloroplast Membrane",
            "In the Cytoplasm"
          ],
          "answer": 1,
          "explanation": "Pigments like Chlorophyll are embedded within the thylakoid membranes in complexes called photosystems.",
          "concept": "Thylakoid Membrane"
        },
        {
          "question": "During photolysis, water is split into which components?",
          "options": [
            "Carbon dioxide, sugars, and energy",
            "Oxygen, hydrogen ions (protons), and electrons",
            "ATP and NADPH",
            "Hydrogen gas and nitrogen oxide"
          ],
          "answer": 1,
          "explanation": "Photolysis splits H2O into oxygen (O2), protons (H+), and electrons to replace those lost in Photosystem II.",
          "concept": "Light Reactions"
        },
        {
          "question": "In which phase of the Calvin Cycle is G3P synthesized?",
          "options": [
            "Regeneration Phase",
            "Light Absorption Phase",
            "Carbon Fixation Phase",
            "Reduction Phase"
          ],
          "answer": 3,
          "explanation": "In the reduction phase, ATP and NADPH reduce 3-PGA to form glyceraldehyde 3-phosphate (G3P) molecules.",
          "concept": "G3P Production & Regeneration"
        }
      ];
      setQuestions(fallbackMCQs);
      setStarted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || answered) return;
    
    const isCorrect = selectedOption === questions[currentIndex].answer;
    setAnswered(true);
    setAnswersLog(prev => [...prev, isCorrect]);

    if (isCorrect) {
      setScore(s => s + 1);
      // Play premium confetti explosion on correct answer!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#34d399', '#a7f3d0']
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);

    const gapReport: Record<string, 'good' | 'weak'> = {};
    
    // Dynamically map evaluated question concepts back to node IDs
    questions.forEach((q, idx) => {
      if (!q.concept) return;
      const isCorrect = answersLog[idx] !== false;

      // Find any node that matches the concept name
      const matchedNode = nodes.find(n => 
        n.label.toLowerCase().includes(q.concept!.toLowerCase()) ||
        q.concept!.toLowerCase().includes(n.label.toLowerCase())
      );

      if (matchedNode) {
        // If we already marked a node as weak, keep it weak
        if (gapReport[matchedNode.id] === 'weak') return;
        gapReport[matchedNode.id] = isCorrect ? 'good' : 'weak';
      }
    });

    // Also mark the primary target node (if selected)
    if (nodeId) {
      gapReport[nodeId] = score >= 4 ? 'good' : 'weak';
    }

    // Call callback
    onQuizCompleted(score, questions.length, gapReport);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setAnswersLog([]);
    setQuizFinished(false);
    setStarted(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0a192f] border border-emerald-500/30 rounded-3xl p-6 text-white shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto glow-pulse">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-emerald-400" />
            <h2 className="text-lg font-bold">SkillBridge AI Eval Center</h2>
          </div>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold">
            {nodeLabel ? `Topic: ${nodeLabel}` : 'Core Quiz'}
          </span>
        </div>

        {/* 1. NOT STARTED SCREEN */}
        {!started && !quizFinished && (
          <div className="text-center py-8 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner glow-emerald animate-pulse">
              <Star size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Adaptive Concept Assessment</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Test your understanding of <strong className="text-emerald-400">"{nodeLabel || topic}"</strong>. 
                Our AI-evaluator will map your responses to identify specific learning gaps and customize your visual mind map nodes.
              </p>
            </div>

            <div className="flex gap-3 justify-center w-full mt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-white/10 hover:border-white/20 text-xs font-semibold rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={startQuiz}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-semibold text-xs rounded-xl active:scale-95 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : 'Begin Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* 2. ACTIVE QUIZ PORTAL */}
        {started && !quizFinished && questions.length > 0 && (
          <div className="flex flex-col gap-4 flex-1">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="font-mono text-emerald-400 font-bold">Score: {score}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <p className="text-base font-bold text-slate-100 mt-2 leading-relaxed">
              {questions[currentIndex].question}
            </p>

            {/* Options List */}
            <div className="space-y-2 mt-2">
              {questions[currentIndex].options.map((option, idx) => {
                let borderStyle = 'border-white/10 hover:border-emerald-500/30 hover:bg-white/5';
                let checkIcon = null;

                if (answered) {
                  const isCorrect = idx === questions[currentIndex].answer;
                  const isSelected = idx === selectedOption;

                  if (isCorrect) {
                    borderStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
                    checkIcon = <CheckCircle size={14} className="text-emerald-400 shrink-0" />;
                  } else if (isSelected) {
                    borderStyle = 'border-red-500 bg-red-500/10 text-red-300';
                    checkIcon = <XCircle size={14} className="text-red-400 shrink-0" />;
                  } else {
                    borderStyle = 'border-white/5 opacity-50';
                  }
                } else if (idx === selectedOption) {
                  borderStyle = 'border-emerald-500 bg-emerald-500/5 text-emerald-400';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(idx)}
                    disabled={answered}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 active:scale-99 ${borderStyle} ${!answered ? 'cursor-pointer' : ''}`}
                  >
                    <span>{option}</span>
                    {checkIcon}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {answered && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-[11px] leading-relaxed p-3.5 rounded-xl text-emerald-300 animate-in slide-in-from-top-2 duration-200">
                <span className="font-bold block text-[10px] text-emerald-400 uppercase tracking-widest mb-0.5">EXPLANATION</span>
                {questions[currentIndex].explanation}
              </div>
            )}

            {/* Submission / Next buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/10">
              {!answered ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedOption === null}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  {currentIndex === questions.length - 1 ? 'Analyze Gaps' : 'Next Question'}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. REPORT CARD & CONCEPT GAP ANALYSIS SCREEN */}
        {quizFinished && (
          <div className="flex flex-col gap-5 py-2">
            {/* Score Showcase */}
            <div className="flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 glow-emerald">
                <Award size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Assessment Complete!</h4>
                <p className="text-xs text-emerald-300 mt-0.5 font-semibold">
                  You scored {score} out of {questions.length} questions correctly.
                </p>
              </div>
            </div>

            {/* Concept Gap Visual graph (Custom SVG Graph) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 size={14} className="text-emerald-400" />
                Concept Mastery Gaps
              </h4>
              
              <div className="bg-[#081121] border border-white/5 p-4 rounded-2xl space-y-4">
                {/* SVG Visual graph */}
                <div className="h-28 flex items-end justify-around border-b border-white/10 pb-2 relative">
                  {/* Radial lines for reference */}
                  <div className="absolute left-0 right-0 top-0 border-t border-white/5 text-[9px] text-slate-600 font-mono">100% Mastery</div>
                  <div className="absolute left-0 right-0 top-1/2 border-t border-white/5 text-[9px] text-slate-600 font-mono">50%</div>

                  {/* Bars */}
                  {(() => {
                    // Collect concepts from questions
                    const conceptMap: Record<string, { correctCount: number; totalCount: number }> = {};
                    questions.forEach((q, idx) => {
                      const concept = q.concept || "General Concept";
                      if (!conceptMap[concept]) {
                        conceptMap[concept] = { correctCount: 0, totalCount: 0 };
                      }
                      conceptMap[concept].totalCount += 1;
                      if (answersLog[idx] === true) {
                        conceptMap[concept].correctCount += 1;
                      }
                    });

                    return Object.entries(conceptMap).map(([conceptName, stats]) => {
                      const pct = Math.round((stats.correctCount / stats.totalCount) * 100);
                      const isGood = pct >= 80;
                      // Fallback value for visual clarity if 0% correct
                      const val = pct === 0 ? 25 : pct; 
                      return {
                        label: conceptName,
                        val: val,
                        color: isGood ? '#10b981' : '#f97316'
                      };
                    });
                  })().map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 z-10 w-24">
                      <div className="w-6 bg-white/5 h-20 rounded-t-lg relative overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-1000"
                          style={{
                            height: `${bar.val}%`,
                            backgroundColor: bar.color,
                            boxShadow: `0 0 10px ${bar.color}44`
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium text-center truncate w-full" title={bar.label}>{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personalized Learning Checklist (SkillBridge Roadmaps) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare size={14} className="text-emerald-400" />
                Adaptive Study Checklist
              </h4>

              <div className="bg-[#081121] border border-white/5 p-4 rounded-2xl text-xs space-y-2.5 max-h-[160px] overflow-y-auto">
                {score === questions.length ? (
                  <p className="text-slate-400 italic">Excellent work! You have full conceptual clarity in this section. Explore subnode expansion on the mind map.</p>
                ) : (
                  <>
                    <p className="text-slate-400 italic">We've identified gaps. Follow this checklist to improve your mastery levels:</p>
                    
                    {(() => {
                      // Collect indices of questions answered incorrectly
                      const wrongQuestions = questions.filter((_, idx) => answersLog[idx] === false);
                      // Deduplicate concepts to study
                      const uniqueConcepts = Array.from(new Set(wrongQuestions.map(q => q.concept || "General Concept")));
                      
                      return uniqueConcepts.map((concept, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start animate-in fade-in duration-300">
                          <input type="checkbox" className="mt-0.5 accent-emerald-500 rounded cursor-pointer" />
                          <div>
                            <strong className="text-slate-200">Review "{concept}"</strong>
                            <p className="text-[10px] text-slate-500">
                              Examine the nodes and read detail summaries in the VisualMind Canvas drawer.
                            </p>
                          </div>
                        </div>
                      ));
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 border-t border-white/10 pt-4 mt-2">
              <button
                onClick={resetQuiz}
                className="px-5 py-2 border border-white/10 hover:border-emerald-500/30 text-xs font-semibold rounded-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} />
                Retake Quiz
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
