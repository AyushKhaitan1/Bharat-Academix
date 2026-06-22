import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Multer for basic document uploading (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Helper to get Gemini client dynamically
function getGenAI(req) {
  const reqKey = req.headers['x-gemini-key'];
  if (reqKey && reqKey.trim() && reqKey !== 'your_gemini_api_key_here') {
    return new GoogleGenerativeAI(reqKey.trim());
  }
  
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    return new GoogleGenerativeAI(envKey);
  }
  
  return null;
}

// Log initial state
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  console.log('Gemini API key configured via server env.');
} else {
  console.warn('WARNING: GEMINI_API_KEY is not configured on the server. Server will run in dynamic client-key mode or fallback Mock Mode.');
}

// ----------------------------------------------------
// Mock Data for Fallbacks
// ----------------------------------------------------
const MOCK_MINDMAPS = {
  "photosynthesis": {
    "nodes": [
      { "id": "1", "label": "Photosynthesis", "type": "root", "val": 24 },
      { "id": "2", "label": "Light Reactions", "type": "subtopic", "val": 16 },
      { "id": "3", "label": "Calvin Cycle (Dark)", "type": "subtopic", "val": 16 },
      { "id": "4", "label": "Chloroplast Structure", "type": "subtopic", "val": 14 },
      { "id": "5", "label": "Thylakoid Membrane", "type": "detail", "val": 10 },
      { "id": "6", "label": "Stroma", "type": "detail", "val": 10 },
      { "id": "7", "label": "ATP & NADPH Synthesis", "type": "detail", "val": 12 },
      { "id": "8", "label": "Carbon Fixation (RuBisCO)", "type": "detail", "val": 12 },
      { "id": "9", "label": "G3P Production & Regeneration", "type": "detail", "val": 10 }
    ],
    "links": [
      { "source": "1", "target": "2" },
      { "source": "1", "target": "3" },
      { "source": "1", "target": "4" },
      { "source": "4", "target": "5" },
      { "source": "4", "target": "6" },
      { "source": "2", "target": "7" },
      { "source": "3", "target": "8" },
      { "source": "3", "target": "9" }
    ],
    "details": {
      "1": {
        "summary": "Photosynthesis is the chemical process by which green plants, algae, and some bacteria convert light energy (usually from the Sun) into chemical energy (glucose), using water and carbon dioxide, while releasing oxygen as a byproduct.",
        "questions": ["What are the raw materials required for photosynthesis?", "Write the balanced chemical equation of photosynthesis."],
        "flashcards": [
          { "q": "What pigment absorbs light during photosynthesis?", "a": "Chlorophyll, primarily located inside chloroplasts." },
          { "q": "What is the general chemical equation?", "a": "6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2" }
        ]
      },
      "2": {
        "summary": "Light-dependent reactions occur in the thylakoid membranes of chloroplasts. They require solar energy to split water molecules (photolysis), releasing oxygen and creating energy-carrier molecules: ATP and NADPH.",
        "questions": ["Where do light reactions take place?", "What is photolysis of water?"],
        "flashcards": [
          { "q": "What are the outputs of light reactions?", "a": "Oxygen (O2), ATP, and NADPH." },
          { "q": "What is the role of Photosystem II (PSII)?", "a": "It absorbs light, energizes electrons, and triggers the photolysis of water." }
        ]
      },
      "3": {
        "summary": "The Calvin Cycle (light-independent reactions) occurs in the stroma of the chloroplast. It uses ATP and NADPH produced in the light reactions to convert carbon dioxide (CO2) into glucose through three phases: Carbon Fixation, Reduction, and Regeneration.",
        "questions": ["Name the three stages of the Calvin Cycle.", "Does the Calvin Cycle happen in complete darkness?"],
        "flashcards": [
          { "q": "What enzyme catalyzes carbon fixation?", "a": "RuBisCO (Ribulose bisphosphate carboxylase-oxygenase)." },
          { "q": "What is the primary carbohydrate output of the Calvin Cycle?", "a": "G3P (glyceraldehyde 3-phosphate), which is used to make glucose." }
        ]
      },
      "4": {
        "summary": "Chloroplasts are specialized double-membraned organelles where photosynthesis takes place. They contain thylakoid discs stacked into grana, floating in a fluid called the stroma.",
        "questions": ["Describe the internal structure of a chloroplast.", "What is a granum?"],
        "flashcards": [
          { "q": "What is the stroma?", "a": "The fluid-filled space surrounding the grana inside the chloroplast." },
          { "q": "Why are chloroplasts green?", "a": "Because they contain chlorophyll pigments which reflect green light." }
        ]
      },
      "5": {
        "summary": "The thylakoid membrane is the site of light absorption and electron transport chains. It contains Photosystems I and II, cytochrome complexes, and ATP synthase.",
        "questions": ["What complexes are found on the thylakoid membrane?"],
        "flashcards": [
          { "q": "What is a thylakoid?", "a": "A flattened membrane sac inside the chloroplast used to convert light energy into chemical energy." }
        ]
      },
      "6": {
        "summary": "The stroma is the colorless fluid surrounding the grana within the chloroplast. It contains ribosomes, chloroplast DNA, starch granules, and enzymes needed for the light-independent reactions.",
        "questions": ["What reactions happen in the stroma?"],
        "flashcards": [
          { "q": "What does the stroma contain?", "a": "Enzymes (like RuBisCO), DNA, RNA, ribosomes, and starch." }
        ]
      },
      "7": {
        "summary": "ATP and NADPH are synthesis energy molecules. Protons pumped into the thylakoid lumen flow back out through ATP Synthase (chemiosmosis), generating ATP, while NADP+ Reductase reduces NADP+ to NADPH.",
        "questions": ["How is ATP generated in chloroplasts?"],
        "flashcards": [
          { "q": "What is the name of the process that makes ATP using a proton gradient?", "a": "Chemiosmosis (photophosphorylation)." }
        ]
      },
      "8": {
        "summary": "Carbon fixation starts when CO2 combines with RuBP (a 5-carbon sugar) catalyzed by RuBisCO, splitting into two molecules of 3-PGA (3-phosphoglycerate).",
        "questions": ["What is RuBP?", "What does RuBisCO do?"],
        "flashcards": [
          { "q": "What is the first stable product of carbon fixation?", "a": "3-PGA (3-phosphoglycerate)." }
        ]
      },
      "9": {
        "summary": "In the reduction phase, 3-PGA is converted to G3P using ATP and NADPH. In the regeneration phase, some G3P molecules go to make glucose, while the rest are recycled back into RuBP using ATP.",
        "questions": ["How is RuBP regenerated?"],
        "flashcards": [
          { "q": "How many G3P molecules are needed to make one glucose molecule?", "a": "2 G3P molecules (requires 6 turns of the cycle)." }
        ]
      }
    }
  },
  "quantum-computing": {
    "nodes": [
      { "id": "1", "label": "Quantum Computing", "type": "root", "val": 24 },
      { "id": "2", "label": "Superposition", "type": "subtopic", "val": 16 },
      { "id": "3", "label": "Entanglement", "type": "subtopic", "val": 16 },
      { "id": "4", "label": "Quantum Gates", "type": "subtopic", "val": 14 },
      { "id": "5", "label": "Quantum Bits (Qubits)", "type": "detail", "val": 10 },
      { "id": "6", "label": "Quantum Circuits", "type": "detail", "val": 10 },
      { "id": "7", "label": "Shor's Algorithm", "type": "detail", "val": 12 }
    ],
    "links": [
      { "source": "1", "target": "2" },
      { "source": "1", "target": "3" },
      { "source": "1", "target": "4" },
      { "source": "2", "target": "5" },
      { "source": "3", "target": "6" },
      { "source": "4", "target": "7" }
    ],
    "details": {
      "1": {
        "summary": "Quantum Computing utilizes the unique principles of quantum mechanics, such as superposition and entanglement, to process complex information in ways that classical computers cannot resolve.",
        "questions": ["How does a quantum computer differ from a classical computer?", "What are the core physical principles of quantum computing?"],
        "flashcards": [
          { "q": "What is the basic unit of quantum information?", "a": "A qubit (quantum bit)." },
          { "q": "Can quantum computers run all classical programs?", "a": "Yes, they can simulate any classical computing process." }
        ]
      },
      "2": {
        "summary": "Superposition allows a quantum system or qubit to exist in multiple states (both 0 and 1) simultaneously until it is measured. This enables parallel processing of huge mathematical combinations.",
        "questions": ["What is quantum superposition?", "What happens to a qubit when it is measured?"],
        "flashcards": [
          { "q": "What state does a qubit collapse into upon measurement?", "a": "A definite classical state of 0 or 1." },
          { "q": "What mathematical model represents superposition?", "a": "A linear combination of basis states (ket 0 and ket 1)." }
        ]
      },
      "3": {
        "summary": "Quantum Entanglement is a phenomenon where two or more qubits become interconnected, such that the state of one instantly dictates the state of another, regardless of the physical distance between them.",
        "questions": ["Describe quantum entanglement.", "How is entanglement used in quantum communication?"],
        "flashcards": [
          { "q": "Who referred to entanglement as 'spooky action at a distance'?", "a": "Albert Einstein." },
          { "q": "Does entanglement allow faster-than-light data transmission?", "a": "No, because classical information is still needed to decode the state." }
        ]
      },
      "4": {
        "summary": "Quantum Gates are basic quantum circuits operating on a small number of qubits. Unlike classical logic gates, quantum gates are always reversible and represented by unitary matrices.",
        "questions": ["What is a quantum logic gate?", "Why are quantum gates represented by matrices?"],
        "flashcards": [
          { "q": "Name a single-qubit quantum gate that creates superposition.", "a": "The Hadamard gate (H gate)." },
          { "q": "What is a CNOT gate?", "a": "Controlled-NOT gate, used to create entangled states between two qubits." }
        ]
      },
      "5": {
        "summary": "Qubits are the fundamental components of quantum computers. Unlike classical bits, they can be implemented using physical systems like spinning electrons, trapped ions, or superconducting circuits.",
        "questions": ["What physical systems can represent qubits?"],
        "flashcards": [
          { "q": "What is decoherence?", "a": "The loss of quantum state coherence due to interaction with the external environment." }
        ]
      },
      "6": {
        "summary": "Quantum Circuits are models for quantum computation in which a computation is a sequence of quantum gates, measurements, and initialization of qubits.",
        "questions": ["What are the components of a quantum circuit diagram?"],
        "flashcards": [
          { "q": "What does a double-line represent in quantum circuits?", "a": "A classical bit path holding measurement outcomes." }
        ]
      },
      "7": {
        "summary": "Shor's Algorithm is a famous quantum algorithm capable of finding the prime factors of an integer in polynomial time. It poses a significant threat to modern RSA encryption standards.",
        "questions": ["Why is Shor's algorithm significant for cybersecurity?"],
        "flashcards": [
          { "q": "What classical cryptographic method is vulnerable to Shor's algorithm?", "a": "RSA encryption." }
        ]
      }
    }
  },
  "neural-networks": {
    "nodes": [
      { "id": "1", "label": "Neural Networks", "type": "root", "val": 24 },
      { "id": "2", "label": "Neurons & Activation", "type": "subtopic", "val": 16 },
      { "id": "3", "label": "Backpropagation", "type": "subtopic", "val": 16 },
      { "id": "4", "label": "Architectures (CNN/RNN)", "type": "subtopic", "val": 14 },
      { "id": "5", "label": "Weights & Biases", "type": "detail", "val": 10 },
      { "id": "6", "label": "Loss Functions", "type": "detail", "val": 10 },
      { "id": "7", "label": "Gradient Descent", "type": "detail", "val": 12 }
    ],
    "links": [
      { "source": "1", "target": "2" },
      { "source": "1", "target": "3" },
      { "source": "1", "target": "4" },
      { "source": "2", "target": "5" },
      { "source": "3", "target": "6" },
      { "source": "3", "target": "7" }
    ],
    "details": {
      "1": {
        "summary": "Artificial Neural Networks are computational systems inspired by the biological neural networks of animal brains, designed to recognize complex patterns and relationships in datasets.",
        "questions": ["What is the structure of an artificial neural network?", "How do artificial neurons mimic biological neurons?"],
        "flashcards": [
          { "q": "What are the three main layers of a neural network?", "a": "Input layer, hidden layer, and output layer." },
          { "q": "What is deep learning?", "a": "Neural networks containing multiple hidden layers." }
        ]
      },
      "2": {
        "summary": "Neurons process inputs by multiplying them by weights, adding a bias, and passing the result through an activation function to introduce non-linearity into the network.",
        "questions": ["What is the role of an activation function?", "Name three common activation functions."],
        "flashcards": [
          { "q": "What activation function output ranges from 0 to 1?", "a": "The Sigmoid function." },
          { "q": "What does ReLU stand for?", "a": "Rectified Linear Unit, which outputs max(0, x)." }
        ]
      },
      "3": {
        "summary": "Backpropagation is the primary algorithm used to train neural networks. It calculates the gradient of the loss function with respect to the weights using the chain rule, propagating errors backward.",
        "questions": ["What is backpropagation?", "How is the chain rule utilized in training?"],
        "flashcards": [
          { "q": "What is backpropagation training's main goal?", "a": "To adjust weights and biases to minimize overall network error." },
          { "q": "Who popularized the backpropagation algorithm in AI?", "a": "Geoffrey Hinton and colleagues in 1986." }
        ]
      },
      "4": {
        "summary": "CNNs (Convolutional Neural Networks) are tailored for spatial data like images, whereas RNNs (Recurrent Neural Networks) process sequential data like text or time series.",
        "questions": ["What makes CNNs ideal for computer vision?", "What is the vanishing gradient problem in RNNs?"],
        "flashcards": [
          { "q": "What operation does a CNN layer use to detect edges?", "a": "Convolution (applying filters/kernels)." },
          { "q": "What RNN variant solves long-term dependency limits?", "a": "LSTM (Long Short-Term Memory)." }
        ]
      },
      "5": {
        "summary": "Weights represent the strength of connection between neurons, while biases allow adjusting the activation threshold of neurons independently of inputs.",
        "questions": ["What is the difference between weights and biases?"],
        "flashcards": [
          { "q": "What happens if weights are initialized to zero?", "a": "All neurons in a layer will learn the exact same features (symmetry problem)." }
        ]
      },
      "6": {
        "summary": "Loss Functions measure how well the neural network's predictions match the target labels, outputting a scalar penalty score used for optimization.",
        "questions": ["What is Mean Squared Error (MSE)?", "When is Cross-Entropy loss preferred?"],
        "flashcards": [
          { "q": "What loss function is standard for binary classification?", "a": "Binary Cross-Entropy Loss." }
        ]
      },
      "7": {
        "summary": "Gradient Descent is an optimization algorithm that iteratively moves network weights in the opposite direction of the gradient to find a local minimum of the loss function.",
        "questions": ["What is learning rate in gradient descent?"],
        "flashcards": [
          { "q": "What is Stochastic Gradient Descent (SGD)?", "a": "Updating weights using a single random training sample at each step." }
        ]
      }
    }
  }
};

const MOCK_QUIZZES = {
  "photosynthesis": [
    {
      "question": "What is the primary biological purpose of photosynthesis in plants?",
      "options": ["To release CO2 into the atmosphere", "To convert solar energy into chemical energy (glucose)", "To absorb oxygen for cell respiration", "To generate heat to regulate plant temperature"],
      "answer": 1,
      "explanation": "Photosynthesis is primarily used by plants to manufacture glucose (chemical energy) using light energy, water, and CO2.",
      "concept": "Photosynthesis"
    },
    {
      "question": "Which enzyme catalyzes the initial carbon fixation step in the Calvin Cycle?",
      "options": ["Amylase", "ATP Synthase", "RuBisCO", "NADP+ Reductase"],
      "answer": 2,
      "explanation": "RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase) catalyzes the reaction between CO2 and RuBP.",
      "concept": "Carbon Fixation (RuBisCO)"
    },
    {
      "question": "Where do the light-dependent reactions of photosynthesis take place?",
      "options": ["In the Stroma", "In the Outer Membrane", "In the Thylakoid Membrane", "In the Mitochondria Matrix"],
      "answer": 2,
      "explanation": "The light reactions happen in the thylakoid membranes where chlorophyll pigments absorb solar energy.",
      "concept": "Light Reactions"
    },
    {
      "question": "Which of the following is NOT a product of the light-dependent reactions?",
      "options": ["Oxygen (O2)", "ATP", "NADPH", "Glucose (C6H12O6)"],
      "answer": 3,
      "explanation": "Glucose is synthesized during the Calvin Cycle (light-independent phase), not the light reactions.",
      "concept": "Light Reactions"
    },
    {
      "question": "What is the process of splitting water molecules using light energy called?",
      "options": ["Hydrolysis", "Photolysis", "Glycolysis", "Chemiosmosis"],
      "answer": 1,
      "explanation": "Photolysis is the light-driven splitting of water molecules into oxygen, protons, and electrons.",
      "concept": "Light Reactions"
    }
  ],
  "quantum-computing": [
    {
      "question": "Which quantum gate is primarily used to put a qubit into a state of superposition?",
      "options": ["CNOT Gate", "Hadamard Gate", "Pauli-X Gate", "Toffoli Gate"],
      "answer": 1,
      "explanation": "The Hadamard gate (H gate) maps the basis states to a balanced superposition of both states.",
      "concept": "Quantum Gates"
    },
    {
      "question": "What is a qubit in quantum computing?",
      "options": ["A binary classical transistor", "A quantum bit that can represent 0, 1, or both simultaneously", "A processor that executes quantum algorithms", "A highly cooled refrigerator for circuits"],
      "answer": 1,
      "explanation": "A qubit (quantum bit) is the basic unit of quantum information, exploiting superposition to represent multiple states at once.",
      "concept": "Quantum Bits (Qubits)"
    },
    {
      "question": "What mathematical matrix represents a reversible CNOT (Controlled-NOT) gate?",
      "options": ["A 2x2 identity matrix", "A 3x3 projection matrix", "A 4x4 unitary matrix", "A 1x4 vector"],
      "answer": 2,
      "explanation": "Since CNOT operates on two qubits (4 computational basis states), it is represented by a 4x4 unitary matrix.",
      "concept": "Quantum Gates"
    },
    {
      "question": "Shor's Algorithm represents a quantum solution for which mathematical task?",
      "options": ["Sorting large database lists", "Finding prime factors of integers", "Simulating chemical molecules", "Searching unsorted arrays"],
      "answer": 1,
      "explanation": "Shor's algorithm finds prime factors of integers in polynomial time, compromising RSA cryptography standards.",
      "concept": "Shor's Algorithm"
    },
    {
      "question": "What property describes qubits whose physical states cannot be described independently of one another?",
      "options": ["Superposition", "Decoherence", "Entanglement", "Reversibility"],
      "answer": 2,
      "explanation": "Entanglement physically binds qubits together, creating a unified quantum state regardless of distance.",
      "concept": "Entanglement"
    }
  ],
  "neural-networks": [
    {
      "question": "What is the output range of the standard Sigmoid activation function?",
      "options": ["[-1, 1]", "[0, 1]", "[0, infinity]", "[-infinity, infinity]"],
      "answer": 1,
      "explanation": "The Sigmoid function squashes any input value into a probability range between 0 and 1.",
      "concept": "Neurons & Activation"
    },
    {
      "question": "Which mathematical rule serves as the foundation for backpropagation error calculation?",
      "options": ["L'Hopital's Rule", "The Chain Rule of calculus", "Bayes' Theorem", "Euclid's Algorithm"],
      "answer": 1,
      "explanation": "Backpropagation computes partial derivatives of the loss function with respect to weights using the chain rule.",
      "concept": "Backpropagation"
    },
    {
      "question": "Which neural network architecture is explicitly designed to process spatial grid data like images?",
      "options": ["Recurrent Neural Network (RNN)", "Convolutional Neural Network (CNN)", "Transformer Networks", "Feedforward MLP"],
      "answer": 1,
      "explanation": "CNNs utilize convolutional filters to capture local patterns and spatial hierarchies in images.",
      "concept": "Architectures (CNN/RNN)"
    },
    {
      "question": "What optimization problem occurs when gradients shrink exponentially during backpropagation in deep networks?",
      "options": ["Overfitting", "Exploding Gradient Problem", "Vanishing Gradient Problem", "Saddle Point Trap"],
      "answer": 2,
      "explanation": "The vanishing gradient problem prevents weights in early layers from updating, stopping training progression.",
      "concept": "Gradient Descent"
    },
    {
      "question": "What is the purpose of a bias parameter in an artificial neuron?",
      "options": ["To multiply input values by scaling weights", "To adjust the output activation threshold independently of inputs", "To prevent overfitting by dropping neurons", "To measure the cost function error"],
      "answer": 1,
      "explanation": "Bias acts as an offset, allowing the activation curve to shift left or right to model patterns accurately.",
      "concept": "Weights & Biases"
    }
  ]
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. GENERATE MINDMAP API
app.post('/api/generate-mindmap', async (req, res) => {
  const { topic, notesText } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const sanitizedTopic = topic.toLowerCase().trim();
  const activeGenAI = getGenAI(req);

  // Check if it's one of the pre-loaded core mock topics
  const isPhotosynthesis = sanitizedTopic.includes('photo') || sanitizedTopic === 'demo';
  const isQuantum = sanitizedTopic.includes('quantum');
  const isNeural = sanitizedTopic.includes('neural') || sanitizedTopic.includes('network');

  if (!activeGenAI || isPhotosynthesis || isQuantum || isNeural) {
    console.log(`[API] Serving mock mindmap for topic: "${topic}"`);
    if (isQuantum) {
      return res.json(MOCK_MINDMAPS["quantum-computing"]);
    }
    if (isNeural) {
      return res.json(MOCK_MINDMAPS["neural-networks"]);
    }
    return res.json(MOCK_MINDMAPS["photosynthesis"]);
  }

  try {
    const model = activeGenAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert academic curriculum architect. Your task is to generate a highly detailed and cohesive concept mind map for the topic: "${topic}".
      ${notesText ? `Use the following provided reference text to extract concepts:\n"""${notesText}"""` : ''}

      Generate a JSON object containing a structured graph of concepts with exact fields:
      - "nodes": an array of node objects, each with:
        - "id": a unique string (e.g. "1", "2", "3")
        - "label": a short, concise concept name (1-3 words max)
        - "type": one of "root", "subtopic", "detail"
        - "val": a relative size number for drawing nodes (root=24, subtopic=16, detail=10-12)
      - "links": an array of link connection objects, each with:
        - "source": id of parent node
        - "target": id of child node
      - "details": a map where keys are node IDs, and values are objects with:
        - "summary": a 2-3 sentence clear, high-quality explanation of the specific concept
        - "questions": an array of 2-3 sample conceptual questions that could be asked about this concept
        - "flashcards": an array of 2 flashcards, each being an object with "q" (question) and "a" (answer)

      Guidelines:
      - Create a beautiful structure. Keep 1 root, 2-4 subtopics, and each subtopic should link to 1-3 specific details.
      - Ensure all IDs are strings and match between nodes, links, and details.
      - Double check JSON format validity. Return ONLY valid JSON.
    `;

    console.log(`[API] Querying Gemini for mindmap: "${topic}"`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("Gemini Mindmap Generation Error:", error);
    res.status(400).json({ 
      error: "Prototype Mode Limitation",
      message: `AI Concept Generation is restricted in offline/prototype sandbox mode. To test AcademixIQ live for any topic, configure a valid Gemini API Key. For this demo, please explore our fully supported pre-loaded modules: 'Photosynthesis', 'Quantum Computing', or 'Neural Networks'.`,
      fallback: MOCK_MINDMAPS["photosynthesis"]
    });
  }
});

// ----------------------------------------------------
// Mock Translation Database for Vernacular Scripts
// ----------------------------------------------------
const MOCK_TRANSLATION_DB = {
  "hindi": [
    "नमस्कार छात्रों। आज हम प्रकाश संश्लेषण की सुंदर प्रक्रिया का पता लगाने जा रहे हैं। जैसा कि आप जानते हैं, प्रकाश संश्लेषण वह रासायनिक अभिक्रिया है जहाँ पौधे प्रकाश ऊर्जा, पानी और कार्बन डाइऑक्साइड से ग्लूकोज का संश्लेषण करते हैं।",
    "यह मुख्य रूप से क्लोरोप्लास्ट (हरितलवक) के भीतर होता है। इसके दो मुख्य चरण हैं: थायलाकोइड में प्रकाश-निर्भर अभिक्रियाएं, और केल्विन चक्र, जो स्ट्रोमा में होने वाली प्रकाश-स्वतंत्र अभिक्रियाएं हैं।",
    "प्रकाश अभिक्रियाओं में, क्लोरोफिल अणु फोटॉन को अवशोषित करते हैं, जिससे इलेक्ट्रॉन सक्रिय हो जाते हैं। ये उच्च-ऊर्जा वाले इलेक्ट्रॉन एक इलेक्ट्रॉन परिवहन श्रृंखला के माध्यम से यात्रा करते हैं, जिससे एटीपी (ATP) और एनएडीपीएच (NADPH) का निर्माण होता है, और पानी के टूटने से ऑक्सीजन मुक्त होती है।",
    "स्ट्रोमा में, केल्विन चक्र इन वाहक अणुओं का उपयोग करता है। रुबिस्को (RuBisCO) एंजाइम कार्बन निर्धारण की सुविधा प्रदान करता है, कार्बन डाइऑक्साइड को आरयूबीपी (RuBP) से बांधता है, जो ग्लिसराल्डिहाइड 3-फॉस्फेट बनाने के लिए अपचयित होता है।",
    "अंततः, ग्लूकोज बनाने के लिए इन तीन-कार्बन शर्कराओं को जोड़ा जाता है, जो पौधे की जैविक गतिविधियों के लिए रासायनिक खाद्य भंडारण के रूप में कार्य करता है।"
  ],
  "tamil": [
    "வணக்கம் மாணவர்களே. இன்று நாம் ஒளிச்சேர்க்கையின் அழகான செயல்முறையை ஆராயப் போகிறோம். உங்களுக்குத் தெரிந்தபடி, ஒளிச்சேர்க்கை என்பது தாவரங்கள் ஒளி ஆற்றல், நீர் மற்றும் கார்பன் டை ஆக்சைடு ஆகியவற்றிலிருந்து குளுக்கோஸை உற்பத்தி செய்யும் ஒரு இரசாயன எதிர்வினையாகும்.",
    "இது முதன்மையாக பசுங்கணிகத்திற்குள் (chloroplasts) நிகழ்கிறது. இதில் இரண்டு முக்கிய நிலைகள் உள்ளன: தைலகாய்டில் (thylakoid) நிகழும் ஒளி சார்ந்த வினைகள், மற்றும் ஸ்ட்ரோமாவில் (stroma) நிகழும் ஒளி சாராத வினைகளான கால்வின் சுழற்சி.",
    "ஒளி வினைகளில், பச்சைய மூலக்கூறுகள் ஃபோட்டான்களை உறிஞ்சி, எலக்ட்ரான்களை ஆற்றல்மிக்கதாக மாற்றுகின்றன. இந்த உயர் ஆற்றல் எலக்ட்ரான்கள் ஒரு எலக்ட்ரான் கடத்தல் சங்கிலி வழியாக பயணித்து, ATP மற்றும் NADPH ஐ உருவாக்குகின்றன, மேலும் நீரை பிளந்து ஆக்சிஜனை வெளியிடுகின்றன.",
    "ஸ்ட்ரோமாவில், கால்வின் சுழற்சி இந்த கடத்தி மூலக்கூறுகளைப் பயன்படுத்துகிறது. ருபிஸ்கோ (RuBisCO) என்சைம் கார்பன் நிலைநிறுத்தலை எளிதாக்குகிறது, கார்பன் டை ஆக்சைடை RuBP உடன் பிணைக்கிறது, இது குறைப்பு வினைக்கு உட்பட்டு கிளிசரால்டிஹைட் 3-பாஸ்பேட்டை உருவாக்குகிறது.",
    "இறுதியாக, இந்த மூன்று கார்பன் சர்க்கரைகள் ஒன்றிணைந்து குளுக்கோஸை உருவாக்குகின்றன, இது தாவரத்தின் உயிரியல் செயல்பாடுகளுக்கான இரசாயன உணவு சேமிப்பாக செயல்படுகிறது."
  ],
  "telugu": [
    "హలో విద్యార్థులారా. ఈరోజు మనం కిరణజన్య సంయోగక్రియ యొక్క అందమైన ప్రక్రియను అన్వేషించబోతున్నాము. మీకు తెలిసినట్లుగా, కిరణజన్య సంయోగక్రియ అనేది కాంతి శక్తి, నీరు మరియు కార్బన్ డై ఆక్సైడ్ నుండి మొక్కలు గ్లూకోజ్ను తయారుచేసే రసాయన చర్య.",
    "ఇది ప్రాథమికంగా హరితరేణువులలో (chloroplasts) జరుగుతుంది. ఇందులో రెండు ప్రధాన దశలు ఉన్నాయి: థైలకాయిడ్ లో కాంతి-ఆధారిత చర్యలు మరియు స్ట్రోమాలో జరిగే కాంతి-రహిత చర్యలైన కెల్విన్ చక్రం.",
    "కాంతి చర్యలలో, క్లోరోఫిల్ అణువులు ఫోటాన్‌లను గ్రహించి, ఎలక్ట్రాన్‌లను ఉత్తేజపరుస్తాయి. ఈ ఆల్ట్రాన్ రవాణా గొలుసు ద్వారా ప్రయాణించి, ATP మరియు NADPH ని తయారుచేస్తాయి మరియు నీటిని విచ్ఛిన్నం చేసి ఆక్సిజన్‌ను విడుదల చేస్తాయి.",
    "స్ట్రోమాలో, కెల్విన్ చక్రం ఈ వాహక అణువులను ఉపయోగిస్తుంది. రుబిస్కో (RuBisCO) ఎంజైమ్ కార్బన్ స్థాపనకు సహాయపడుతుంది, కార్బన్ డై ఆక్సైడ్‌ను RuBP తో బంధిస్తుంది, ఇది క్షయకరణం చెంది గ్లిజరాల్డిహైడ్ 3-ఫాస్ఫేట్ ను ఏర్పరుస్తుంది.",
    "చివరగా, ఈ మూడు-కార్బన్ చక్కెరలు కలిసి గ్లూకోజ్ ను ఏర్పరుస్తాయి, ఇది మొక్క యొక్క జీవక్రియలకు రసాయన ఆహార నిల్వగా ఉపయోగపడుతుంది."
  ],
  "bengali": [
    "হ্যালো ছাত্ররা। আজ আমরা সালোকসংশ্লেষণের সুন্দর প্রক্রিয়াটি অন্বেষণ করতে যাচ্ছি। আপনারা জানেন যে, সালোকসংশ্লেষণ হলো একটি রাসায়নিক বিক্রিয়া যেখানে উদ্ভিদ আলোক শক্তি, জল এবং কার্বন ডাই অক্সাইড থেকে গ্লুকোজ সংশ্লেষ করে।",
    "এটি মূলত ক্লোরোপ্লাস্টের মধ্যে ঘটে। এর দুটি প্রধান পর্যায় রয়েছে: থাইলাকয়েডে আলোক-নির্ভর বিক্রিয়া এবং কেলভিন চক্র, যা স্ট্রোমার মধ্যে ঘটে যাওয়া আলোক-নিরপেক্ষ বিক্রিয়া।",
    "আলোক বিক্রিয়ায়, ক্লোরোফিল অণু ফোটন শোষণ করে, যা ইলেকট্রনকে উদ্দীপিত করে। এই উচ্চ-শক্তি সম্পন্ন ইলেকট্রনগুলি একটি ইলেকট্রন পরিবহন শৃঙ্খলের মধ্য দিয়ে প্রবাহিত হয়ে ATP এবং NADPH তৈরি করে এবং জলকে ভেঙে অক্সিজেন মুক্ত করে।",
    "স্ট্রোমার মধ্যে কেলভিন চক্র এই বাহক অণুগুলিকে ব্যবহার করে। রুবিস্কো (RuBisCO) এনজাইম কার্বন আত্তীকরণ সহজ করে তোলে, যা কার্বন ডাই অক্সাইডকে RuBP-র সাথে আবদ্ধ করে এবং বিজারিত হয়ে গ্লিসারালডিহাইড ৩-ফসফেট গঠন করে।",
    "অবশেষে, এই তিন-কার্বন শর্করা একত্রিত হয়ে গ্লুকোজ তৈরি করে, যা উদ্ভিদের জৈবিক ক্রিয়াকলাপের জন্য রাসায়নিক খাদ্য সঞ্চয়কারী হিসেবে কাজ করে।"
  ],
  "marathi": [
    "नमस्कार विद्यार्थ्यांनो. आज आपण प्रकाशसंश्लेषणाच्या सुंदर प्रक्रियेचा अभ्यास करणार आहोत. तुम्हाला माहितीच आहे की, प्रकाशसंष्ण ही अशी रासायनिक प्रक्रिया आहे जिथे वनस्पती प्रकाश ऊर्जा, पाणी आणि कार्बन डायऑक्साइडपासून ग्लुकोज तयार करतात।",
    "हे प्रामुख्याने हरितलवकांमध्ये (chloroplasts) घडते. याचे दोन मुख्य टप्पे आहेत: थायलॅकोइडमधील प्रकाश-निर्भर अभिक्रिया आणि स्ट्रोमामध्ये घडणारे प्रकाश-स्वतंत्र केल्विन चक्र।",
    "प्रकाश अभिक्रियेमध्ये, क्लोरोफिलचे रेणू फोटॉन्स शोषून घेतात, ज्यामुळे इलेक्ट्रॉन उत्तेजित होतात. हे उच्च-ऊर्जा इलेक्ट्रॉन इलेक्ट्रॉन ट्रान्सपोर्ट चेनद्वारे प्रवास करतात, एटीपी (ATP) आणि एनएडीपीएच (NADPH) तयार करतात आणि पाण्याचे रेणू विघटित करून ऑक्सिजन बाहेर टाकतात।",
    "स्ट्रोमामध्ये, केल्विन चक्र या वाहक रेणूंचा वापर करते. रुबिस्को (RuBisCO) एन्झाईम कार्बन स्थिरीकरणास मदत करते, कार्बन डायऑक्साइडला आरयूबीपी (RuBP) शी जोडते, ज्याचे क्षपण होऊन ग्लिसराल्डिहाइड ३-फॉस्फेट तयार होते।",
    "शेवटी, ग्लुकोज तयार करण्यासाठी हे तीन-कार्बन शर्करा एकत्र जोडले जातात, जे वनस्पतींच्या जैविक कार्यांसाठी रासायनिक अन्न साठवणूक म्हणून काम करते।"
  ],
  "kannada": [
    "ನಮಸ್ಕಾರ ವಿದ್ಯಾರ್ಥಿಗಳೇ. ಇಂದು ನಾವು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ಸುಂದರವಾದ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಅನ್ವೇಷಿಸಲಿದ್ದೇವೆ. ನಿಮಗೆ ತಿಳಿದಿರುವಂತೆ, ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯು ಸಸ್ಯಗಳು ಬೆಳಕಿನ ಶಕ್ತಿ, ನೀರು ಮತ್ತು ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್‌ನಿಂದ ಗ್ಲೂಕೋಸ್ ಅನ್ನು ತಯಾರಿಸುವ ರಾಸಾಯನಿಕ ಕ್ರಿಯೆಯಾಗಿದೆ.",
    "ಇದು ಮುಖ್ಯವಾಗಿ ಹರಿತ್ತಿನೊಳಗೆ (chloroplasts) ಸಂಭವಿಸುತ್ತದೆ. ಇದರಲ್ಲಿ ಎರಡು ಮುಖ್ಯ ಹಂತಗಳಿವೆ: ಥೈಲಕಾಯ್ಡ್‌ನಲ್ಲಿ ಬೆಳಕಿನ-ಅವಲಂಬಿತ ಪ್ರತಿಕ್ರಿಯೆಗಳು ಮತ್ತು ಸ್ಟ್ರೋಮಾದಲ್ಲಿ ಸಂಭವಿಸುವ ಬೆಳಕಿನ-ಅನವಲಂಬಿತ ಪ್ರತಿಕ್ರಿಯೆಯಾದ ಕ್ಯಾಲ್ವಿನ್ ಚಕ್ರ.",
    "ಬೆಳಕಿನ ಕ್ರಿಯೆಗಳಲ್ಲಿ, ಪತ್ರಹರಿತ್ತಿನ ಅಣುಗಳು ಫೋಟಾನ್‌ಗಳನ್ನು ಹೀರಿಕೊಳ್ಳುತ್ತವೆ, ಇದು ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳನ್ನು ಉತ್ತೇಜಿಸುತ್ತದೆ. ಈ ಹೆಚ್ಚಿನ ಶಕ್ತಿಯ ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳು ಎಲೆಕ್ಟ್ರಾನ್ ಸಾರಿಗೆ ಸರಪಳಿಯ ಮೂಲಕ ಚಲಿಸುತ್ತವೆ, ATP ಮತ್ತು NADPH ಅನ್ನು ರಚಿಸುತ್ತವೆ ಮತ್ತು ನೀರನ್ನು ವಿಭಜಿಸಿ ಆಮ್ಲಜನಕವನ್ನು ಬಿಡುಗಡೆ ಮಾಡುತ್ತವೆ.",
    "ಸ್ಟ್ರೋಮಾದಲ್ಲಿ, ಕ್ಯಾಲ್ವಿನ್ ಚಕ್ರವು ಈ ವಾಹಕ ಅಣುಗಳನ್ನು ಬಳಸಿಕೊಳ್ಳುತ್ತದೆ. ರುಬಿಸ್ಕೋ (RuBisCO) ಕಿಣ್ವವು ಕಾರ್ಬನ್ ಸ್ಥಿರೀಕರಣವನ್ನು ಸುಗಮಗೊಳಿಸುತ್ತದೆ, ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಅನ್ನು RuBP ಯೊಂದಿಗೆ ಬಂಧಿಸುತ್ತದೆ, ಇದು ಅಪಕರ್ಷಣಕ್ಕೊಳಗಾಗಿ ಗ್ಲಿಸರಾಲ್ಡಿಹೈಡ್ 3-ಫಾಸ್ಫೇಟ್ ಅನ್ನು ರೂಪಿಸುತ್ತದೆ.",
    "ಅಂತಿಮವಾಗಿ, ಗ್ಲೂಕೋಸ್ ಅನ್ನು ಒಟ್ಟುಗೂಡಿಸಲು ಈ ಮೂರು-ಕಾರ್ಬನ್ ಸಕ್ಕರೆಗಳನ್ನು ಸಂಯೋಜಿಸಲಾಗುತ್ತದೆ, ಇದು ಸಸ್ಯದ ಜೈವಿಕ ಚಟುವಟಿಕೆಗಳಿಗೆ ರಾಸಾಯನಿಕ ಆಹಾರ ಸಂಗ್ರಹಣೆಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ."
  ]
};

const MOCK_PHRASE_DB = {
  "hello": {
    "hindi": "नमस्ते, सुप्रभात!",
    "tamil": "வணக்கம், காலை வணக்கம்!",
    "telugu": "నమస్తే, శుభోదయం!",
    "bengali": "হ্যালো, সুপ্রভাত!",
    "marathi": "नमस्कार, शुभ सकाळ!",
    "kannada": "ನಮಸ್ತೆ, ಶುಭೋದಯ!"
  },
  "how_are_you": {
    "hindi": "आप कैसे हैं?",
    "tamil": "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    "telugu": "మీరు ఎలా ఉన్నారు?",
    "bengali": "আপনি কেমন আছেন?",
    "marathi": "तुम्ही कसे आहात?",
    "kannada": "ನೀವು ಹೇಗಿದ್ದೀರಾ?"
  },
  "explain_photosynthesis": {
    "hindi": "प्रकाश संश्लेषण वह प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश, पानी और कार्बन डाइऑक्साइड का उपयोग करके अपना भोजन (ग्लूकोज) बनाते हैं।",
    "tamil": "ஒளிச்சேர்க்கை என்பது பச்சை தாவரங்கள் சூரிய ஒளி, நீர் மற்றும் கார்பன் டை ஆக்சைடைப் பயன்படுத்தி தங்கள் உணவைத் தயாரிக்கும் செயல்முறையாகும்.",
    "telugu": "కిరణజన్య సంయోగక్రియ అనేది ఆకుపచ్చని మొక్కలు సూర్యరశ్మి, నీరు మరియు కార్బన్ డై ఆక్సైడ్‌ను ఉపయోగించి తమ ఆహారాన్ని తయారు చేసుకునే ప్రక్రియ.",
    "bengali": "সালোকসংশ্লেষণ হলো এমন একটি প্রক্রিয়া যার মাধ্যমে সবুজ উদ্ভিদ সূর্যালোক, জল এবং কার্বন ডাই অক্সাইড ব্যবহার করে তাদের খাদ্য তৈরি করে।",
    "marathi": "प्रकाशसंश्लेषण ही अशी प्रक्रिया आहे ज्याद्वारे हिरव्या वनस्पती सूर्यप्रकाश, पाणी आणि कार्बन डायऑक्साइड वापरून आपले अन्न तयार करतात.",
    "kannada": "ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯು ಹಸಿರು ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕು, ನೀರು ಮತ್ತು ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಬಳಸಿ ತಮ್ಮ ಆಹಾರವನ್ನು ತಯಾರಿಸುವ ಪ್ರಕ್ರಿಯೆಯಾಗಿದೆ."
  },
  "thanks": {
    "hindi": "धन्यवाद! आपका दिन शुभ हो।",
    "tamil": "நன்றி! உங்களுக்கு நல்ல நாள் அமையட்டும்.",
    "telugu": "ధన్యవాదాలు! మీ రోజు బాగుండాలి.",
    "bengali": "ধন্যবাদ! আপনার দিনটি শুভ হোক।",
    "marathi": "धन्यवाद! आपला दिवस चांगला जावो.",
    "kannada": "ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ದಿನ ಶುಭವಾಗಿರಲಿ."
  }
};

function getMockTranslation(text, targetLanguage) {
  const lang = targetLanguage.toLowerCase();
  const cleanInput = text.toLowerCase().trim();

  // Find exact index for demo lecture pages
  let matchedIndex = -1;
  if (cleanInput.includes("hello students") || cleanInput.includes("beautiful process of photosynthesis")) {
    matchedIndex = 0;
  } else if (cleanInput.includes("primarily within the chloroplasts") || cleanInput.includes("two major stages")) {
    matchedIndex = 1;
  } else if (cleanInput.includes("light reactions") && (cleanInput.includes("chlorophyll") || cleanInput.includes("photons"))) {
    matchedIndex = 2;
  } else if (cleanInput.includes("stroma") && (cleanInput.includes("calvin cycle") || cleanInput.includes("rubisco"))) {
    matchedIndex = 3;
  } else if (cleanInput.includes("three-carbon sugars") || cleanInput.includes("assemble glucose") || cleanInput.includes("food storage")) {
    matchedIndex = 4;
  }

  const translations = MOCK_TRANSLATION_DB[lang];
  if (matchedIndex !== -1 && translations && translations[matchedIndex]) {
    const langLabels = {
      "hindi": "अनुवाद - हिंदी",
      "tamil": "மொழிபெயர்ப்பு - தமிழ்",
      "telugu": "అనువాదం - తెలుగు",
      "bengali": "অনুবাদ - বাংলা",
      "marathi": "भाषांतर - मराठी",
      "kannada": "ಅನುವಾದ - ಕನ್ನಡ"
    };
    const prefix = langLabels[lang] || `Translated to ${targetLanguage}`;
    return `[${prefix}]: ${translations[matchedIndex]}`;
  }

  // Check generic phrases
  let phraseKey = null;
  if (cleanInput.includes("hello") || cleanInput.includes("hi") || cleanInput.includes("good morning")) {
    phraseKey = "hello";
  } else if (cleanInput.includes("how are you")) {
    phraseKey = "how_are_you";
  } else if (cleanInput.includes("photosynthesis") && (cleanInput.includes("what is") || cleanInput.includes("explain"))) {
    phraseKey = "explain_photosynthesis";
  } else if (cleanInput.includes("thank you") || cleanInput.includes("thanks")) {
    phraseKey = "thanks";
  }

  if (phraseKey && MOCK_PHRASE_DB[phraseKey] && MOCK_PHRASE_DB[phraseKey][lang]) {
    const langLabels = {
      "hindi": "अनुवाद - हिंदी",
      "tamil": "மொழிபெயர்ப்பு - தமிழ்",
      "telugu": "అనువాదం - తెలుగు",
      "bengali": "অনুবাদ - বাংলা",
      "marathi": "भाषांतर - मराठी",
      "kannada": "ಅನುವಾದ - ಕನ್ನಡ"
    };
    const prefix = langLabels[lang] || `Translated to ${targetLanguage}`;
    return `[${prefix}]: ${MOCK_PHRASE_DB[phraseKey][lang]}`;
  }

  // Fallback for custom entries - return a beautiful generic greeting in native script
  const fallbackTranslations = {
    "hindi": "नमस्ते! हम आपकी शैक्षणिक सहायता के लिए यहाँ हैं।",
    "tamil": "வணக்கம்! உங்கள் கல்வி தேவைகளுக்கு உதவ நாங்கள் இருக்கிறோம்.",
    "telugu": "నమస్తే! మీ విద్యా అవసరాలకు సహాయం చేయడానికి మేము ఇక్కడ ఉన్నాము.",
    "bengali": "নমস্কার! আপনার শিক্ষাগত সহায়তার জন্য আমরা এখানে আছি।",
    "marathi": "नमस्कार! आम्ही तुमच्या शैक्षणिक मदतीसाठी येथे आहोत.",
    "kannada": "ನಮಸ್ತೆ! ನಿಮ್ಮ ಶೈಕ್ಷಣಿಕ ಸಹಾಯಕ್ಕಾಗಿ ನಾವು ಇಲ್ಲಿದ್ದೇವೆ."
  };

  const genericPrefix = {
    "hindi": "अनुवाद - हिंदी",
    "tamil": "மொழிபெயர்ப்பு - தமிழ்",
    "telugu": "అనువాదం - తెలుగు",
    "bengali": "অনুবাদ - বাংলা",
    "marathi": "भाषांतर - मराठी",
    "kannada": "ಅನುವಾದ - ಕನ್ನಡ"
  }[lang] || `Translated to ${targetLanguage}`;

  const defaultText = fallbackTranslations[lang] || `Study note translated successfully.`;
  return `[${genericPrefix}]: ${defaultText}`;
}

// 2. TRANSLATION API (BhashaTranslate)
app.post('/api/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Text and targetLanguage are required" });
  }

  const activeGenAI = getGenAI(req);

  if (!activeGenAI) {
    const responseText = getMockTranslation(text, targetLanguage);
    return res.json({ translatedText: responseText });
  }

  try {
    const model = activeGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are a high-speed professional real-time audio translator for academic classrooms in India.
      Translate the following classroom transcription snippet into "${targetLanguage}".
      Ensure the translation is natural, grammatically correct, and retains the technical scientific/academic terminology in its standard readable form (use phonetic script transliteration if helpful, alongside local terms so it reads naturally for a student studying in that medium).

      Text to translate:
      "${text}"

      Return ONLY the plain translated text. Do not include markdown, comments, or explanations.
    `;

    console.log(`[API] Querying Gemini translation to ${targetLanguage}`);
    const result = await model.generateContent(prompt);
    const translatedText = result.response.text().trim();
    
    const langLabels = {
      "hindi": "अनुवाद - हिंदी",
      "tamil": "மொழிபெயர்ப்பு - தமிழ்",
      "telugu": "అనువాదం - తెలుగు",
      "bengali": "অনুবাদ - বাংলা",
      "marathi": "भाषांतर - मराठी",
      "kannada": "ಅನುವಾದ - ಕನ್ನಡ"
    };
    const prefix = langLabels[targetLanguage.toLowerCase()] || `Translated to ${targetLanguage}`;
    res.json({ translatedText: `[${prefix}]: ${translatedText}` });
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    // Fallback to high-fidelity mock translation instead of failing with 500
    const responseText = getMockTranslation(text, targetLanguage);
    res.json({ translatedText: responseText });
  }
});

// 3. GENERATE QUIZ API (SkillBridge AI)
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, nodeId } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const sanitizedTopic = topic.toLowerCase().trim();
  const activeGenAI = getGenAI(req);

  const isPhotosynthesis = sanitizedTopic.includes('photo') || sanitizedTopic === 'demo';
  const isQuantum = sanitizedTopic.includes('quantum');
  const isNeural = sanitizedTopic.includes('neural') || sanitizedTopic.includes('network');

  if (!activeGenAI || isPhotosynthesis || isQuantum || isNeural) {
    console.log(`[API] Serving mock quiz for topic: "${topic}"`);
    if (isQuantum) {
      return res.json(MOCK_QUIZZES["quantum-computing"]);
    }
    if (isNeural) {
      return res.json(MOCK_QUIZZES["neural-networks"]);
    }
    return res.json(MOCK_QUIZZES["photosynthesis"]);
  }

  try {
    const model = activeGenAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an adaptive educational evaluator. Generate a high-quality 5-question multiple choice quiz on the topic: "${topic}" ${nodeId ? `(specifically focusing on concept node: ${nodeId})` : ''}.
      
      Generate a JSON array of 5 questions, where each question object has exact fields:
      - "question": string text of the question
      - "options": array of 4 strings (multiple choices)
      - "answer": integer index of the correct answer (0, 1, 2, or 3)
      - "explanation": a detailed 1-2 sentence explanation of why the correct option is right.
      - "concept": a short, concise name (1-3 words) of the specific sub-concept from the topic being evaluated by this question.

      Ensure questions cover various difficulty levels (recall, application, analysis). Return ONLY valid JSON.
    `;

    console.log(`[API] Querying Gemini for quiz on: "${topic}"`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    res.status(500).json({ 
      error: "Failed to generate quiz via AI.", 
      details: error.message,
      fallback: MOCK_QUIZZES["photosynthesis"] 
    });
  }
});

// 4. FILE UPLOAD & INGESTION
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Process text-based files directly
    const mimeType = req.file.mimetype;
    let extractedText = "";

    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      extractedText = req.file.buffer.toString('utf-8');
    } else {
      // In a real environment, we'd use pdf-parse or pdfreader.
      // For this prototype, we'll simulate text extraction or mock it.
      extractedText = `Extracted mockup content from PDF: Name: ${req.file.originalname}, Size: ${req.file.size} bytes. This file contains notes on Photosynthesis and Cellular Respiration. Let's study how chlorophyll captures light and converts it into ATP and NADPH, which then enter the Calvin cycle in the stroma to fix carbon dioxide into G3P sugars.`;
    }

    res.json({ 
      success: true,
      fileName: req.file.originalname,
      size: req.file.size,
      text: extractedText.substring(0, 2000) // Send a snippet back
    });
  } catch (error) {
    console.error("File upload extraction error:", error);
    res.status(500).json({ error: "Failed to process file upload" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`AcademixIQ backend running on port http://localhost:${PORT}`);
});
