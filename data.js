// === Conscious Machine — Component Data ===
// Layout: Right = Sensory pipeline, Center = Ego zone (world model, LLM, goals, principles, drives, self core), Left = Motor pipeline
// All inter-model communication uses latent vectors, not text.
// Temporal understanding is an OUTPUT of domain transformers, not a raw sensor input.

// ── Zone definitions for layout ──
const ZONES = {
    sensors: { x: 480, label: 'Raw Sensors' },
    transformers: { x: 310, label: 'Domain Transformers' },
    abstraction: { x: 170, label: 'Cross-Modal Abstraction' },
    ego: { x: 0, label: 'Ego Zone' },
    planning: { x: -220, label: 'Action Planning' },
    decomposition: { x: -360, label: 'Motor Decomposition' },
    execution: { x: -480, label: 'Motor Execution' },
};

// ── Ego zone boundary (used by renderer for awareness ellipse) ──
const EGO_ZONE = { cx: 0, cy: 20, rx: 170, ry: 190 };

const COMPONENTS = {
    // ═══════════════════════════════════════
    //  EGO ZONE — The machine's self-aware core
    //  Combined latent vectors of these components = ego latent vector
    // ═══════════════════════════════════════
    self: {
        id: 'self', label: 'Self / Ego', sublabel: 'Core Ego Vector',
        category: 'meta', color: '#c4b5fd', icon: '◉', zone: 'ego', inEgo: true,
        x: 0, y: 0, size: 48,
        description: 'The core ego latent vector — NOT a separate module, but the combined representation of all ego-zone components: the Sensory World Model, Linguistic Model, Goal Formation, Principles, and Survival Drives. This fused vector IS the self. The machine\'s awareness does not extend to its raw sensors or motor hardware directly — it can only perceive those parts of itself through its own sensory pipeline, just as a human cannot directly observe their own neurons.',
        models: ['Ego Integration Network', 'Self-Model Encoder', 'Identity Coherence Module', 'Autobiographical Memory'],
        hardware: 'Requires massive parallel processing. Future neuromorphic architectures for real-time self-modeling.',
        processes: ['Integrate', 'Reflect', 'Cohere', 'Adapt']
    },
    world_model: {
        id: 'world_model', label: 'Sensory World Model', sublabel: 'Internal World Representation',
        category: 'understanding', color: '#4ade80', icon: '🌍', zone: 'ego', inEgo: true,
        x: 90, y: -55, size: 36,
        description: 'The machine\'s internal representation of the world as perceived through its sensory pipeline. This is NOT raw sensor data — it is the abstracted, fused understanding of the environment built from all modalities. It includes the machine\'s perception of its own body (as sensed through its sensors). This world model is a core component of the ego — the machine\'s "view" of reality.',
        models: ['World State Encoder', 'Scene Graph Network', 'Spatial Memory', 'Object Permanence Module'],
        hardware: 'High-bandwidth memory bus for real-time state updates. Neuromorphic crossbar for parallel integration.',
        processes: ['Encode World', 'Update State', 'Maintain Coherence']
    },
    llm: {
        id: 'llm', label: 'Linguistic Model', sublabel: 'Experience Describer',
        category: 'understanding', color: '#fbbf24', icon: '💬', zone: 'ego', inEgo: true,
        x: 70, y: 35, size: 36,
        description: 'A multimodal pretrained LLM that operates on latent vectors, NOT text. It is NOT the decision-maker or agent. Its role is to linguistically understand and describe the machine\'s experience — the world model, internal states, and self-narrative. It receives temporal context from the domain transformers. Part of the ego zone: its output contributes to the core ego latent vector.',
        models: ['Multimodal LLM (Latent-Native)', 'Experience Narrator', 'Internal State Describer'],
        hardware: 'High-bandwidth memory for chain-of-thought. GPU clusters; neuromorphic co-processors for acceleration.',
        processes: ['Describe', 'Narrate', 'Articulate', 'Reflect']
    },
    goal_formation: {
        id: 'goal_formation', label: 'Goal Formation', sublabel: 'Desire → Goal Vector',
        category: 'goals', color: '#a78bfa', icon: '◆', zone: 'ego', inEgo: true,
        x: -60, y: -55, size: 34,
        description: 'Fuses the linguistic model\'s desire vector with survival drives to produce the final goal vector. The linguistic part is NOT directly aware of survival drives — they are fused automatically. Part of the ego zone: the goal vector contributes to the core ego latent vector and defines what the machine wants.',
        models: ['Goal Fusion Network', 'Priority Arbitrator', 'Desire-Drive Integrator'],
        hardware: 'Persistent memory for goal state. Memristive crossbar for efficient goal vector computation.',
        processes: ['Receive Desire', 'Fuse Drives', 'Output Goal Vector']
    },
    survival_drives: {
        id: 'survival_drives', label: 'Survival Drives', sublabel: 'Homeostatic Imperatives',
        category: 'goals', color: '#ef4444', icon: '♥', zone: 'ego', inEgo: true,
        x: -60, y: 40, size: 30,
        description: 'Hardwired survival imperatives: battery charge maintenance, thermal regulation, structural integrity, self-damage avoidance. The linguistic model is NOT directly aware of these — they influence behavior through goal formation. Part of the ego zone: survival state contributes to the core ego latent vector.',
        models: ['Battery Monitor', 'Thermal Regulator', 'Damage Detector', 'Homeostasis Controller'],
        hardware: 'Dedicated low-power monitoring circuits. Analog watchdog timers for critical thresholds.',
        processes: ['Monitor', 'Alert', 'Override']
    },
    principles: {
        id: 'principles', label: 'Principles', sublabel: 'RL-Updated Guardrails',
        category: 'principles', color: '#f472b6', icon: '✦', zone: 'ego', inEgo: true,
        x: -80, y: 120, size: 32,
        description: 'Dynamically updated behavioral guardrails learned through reinforcement. After each action cycle, the reward signal updates these principles. Part of the ego zone: the machine\'s learned values and constraints are integral to its identity and contribute to the core ego latent vector.',
        models: ['RL Policy Network', 'Value Function Estimator', 'Principle Abstraction Network'],
        hardware: 'Non-volatile memristive storage for persistent principle representations. RL accelerator.',
        processes: ['Constrain', 'Guide', 'Adapt', 'Evolve']
    },

    // ═══════════════════════════════════════
    //  RIGHT SIDE — Sensory Pipeline (OUTSIDE ego zone)
    //  The machine senses these but they are not "in" its awareness
    // ═══════════════════════════════════════
    // Raw Sensors
    s_vision: {
        id: 's_vision', label: 'Vision', sublabel: 'Camera Streams',
        category: 'sensory', color: '#00d4ff', icon: '👁', zone: 'sensors',
        x: 480, y: -110, size: 32,
        description: 'Raw visual input — camera feeds, depth maps. These are physical sensors OUTSIDE the ego zone. The machine cannot directly "feel" its cameras; it only knows about them through the processed perception that enters the ego via the world model.',
        models: ['Camera Interface', 'Frame Buffer', 'Pixel Encoder'],
        hardware: 'Low-latency image sensors. Neuromorphic event cameras for spike-based vision.',
        processes: ['Capture', 'Buffer', 'Stream']
    },
    s_audio: {
        id: 's_audio', label: 'Audio', sublabel: 'Microphone Array',
        category: 'sensory', color: '#00b8d4', icon: '🔊', zone: 'sensors',
        x: 480, y: -40, size: 32,
        description: 'Raw auditory input — speech, environmental sounds, spatial audio. Physical sensors outside the ego zone.',
        models: ['Microphone Array Interface', 'Audio Buffer', 'Signal Preprocessor'],
        hardware: 'Multi-microphone array with beamforming. Neuromorphic cochlea for spike-based audio.',
        processes: ['Capture', 'Buffer', 'Stream']
    },
    s_inertia: {
        id: 's_inertia', label: 'Inertia / IMU', sublabel: 'Proprioception',
        category: 'sensory', color: '#00838f', icon: '⟲', zone: 'sensors',
        x: 480, y: 30, size: 32,
        description: 'Inertial measurement — acceleration, angular velocity, orientation. Physical sensors outside the ego zone.',
        models: ['IMU Interface', 'Accelerometer Readout', 'Gyroscope Readout'],
        hardware: 'MEMS accelerometers and gyroscopes. Vestibular-inspired neuromorphic circuits.',
        processes: ['Measure', 'Buffer', 'Stream']
    },
    s_touch: {
        id: 's_touch', label: 'Touch & Pressure', sublabel: 'Tactile Skin',
        category: 'sensory', color: '#006064', icon: '✋', zone: 'sensors',
        x: 480, y: 100, size: 32,
        description: 'Tactile and pressure input — surface texture, grip force, contact detection. Physical sensors outside the ego zone.',
        models: ['Pressure Sensor Array', 'Tactile Readout', 'Contact Detector'],
        hardware: 'Distributed pressure sensor arrays. Piezoelectric tactile skin.',
        processes: ['Sense', 'Buffer', 'Stream']
    },
    s_thermo: {
        id: 's_thermo', label: 'Temperature', sublabel: 'Thermal Sensors',
        category: 'sensory', color: '#004d40', icon: '🌡', zone: 'sensors',
        x: 480, y: 170, size: 28,
        description: 'Thermal input — ambient and surface temperature, thermal gradients. Physical sensors outside the ego zone.',
        models: ['Thermistor Array', 'IR Sensor Readout'],
        hardware: 'Distributed thermistors and IR thermal sensors.',
        processes: ['Sense', 'Buffer', 'Stream']
    },

    // Domain Transformers — each captures temporal + domain-specific properties
    tf_vision: {
        id: 'tf_vision', label: 'Vision Transformer', sublabel: 'ViT — Spatial + Temporal',
        category: 'understanding', color: '#26c6da', icon: '◫', zone: 'transformers',
        x: 310, y: -80, size: 40,
        description: 'A Vision Transformer (ViT) that processes the raw visual stream. Captures BOTH spatial features (edges, objects, scenes) AND temporal dynamics (motion, change, optical flow) from the video stream. Outputs visual feature latent vectors plus temporal context vectors that feed downstream.',
        models: ['Vision Transformer (ViT)', 'Temporal Attention Heads', 'Depth Estimator', 'Optical Flow Encoder'],
        hardware: 'GPU/TPU for transformer inference. Neuromorphic crossbar arrays for parallel feature extraction.',
        processes: ['Encode Spatial', 'Encode Temporal', 'Extract Features']
    },
    tf_audio: {
        id: 'tf_audio', label: 'Audio Transformer', sublabel: 'Spectral + Temporal',
        category: 'understanding', color: '#0097a7', icon: '◰', zone: 'transformers',
        x: 310, y: 0, size: 38,
        description: 'An Audio Transformer that processes the raw auditory stream. Captures spectral features (phonemes, tones, frequencies) AND temporal dynamics (rhythm, speech cadence, event sequences). Outputs audio feature latent vectors plus temporal context.',
        models: ['Audio Spectrogram Transformer', 'Temporal Attention Heads', 'Phoneme Encoder', 'Spatial Audio Localizer'],
        hardware: 'GPU for transformer inference. Neuromorphic cochlea co-processor.',
        processes: ['Encode Spectral', 'Encode Temporal', 'Localize']
    },
    tf_somato: {
        id: 'tf_somato', label: 'Somatosensory Transformer', sublabel: 'Body + Temporal',
        category: 'understanding', color: '#00695c', icon: '◈', zone: 'transformers',
        x: 310, y: 80, size: 38,
        description: 'A Somatosensory Transformer that jointly processes IMU, touch/pressure, and temperature streams. Captures body-state features (posture, contact, thermal state) AND temporal dynamics (movement trajectories, pressure changes). Outputs somatosensory latent vectors plus temporal context.',
        models: ['Somatosensory Fusion Transformer', 'Proprioception Encoder', 'Tactile Pattern Classifier', 'Thermal Trend Detector'],
        hardware: 'Neuromorphic crossbar for multi-modal body-state fusion. Spike-timing circuits.',
        processes: ['Fuse Body Signals', 'Encode Temporal', 'Classify Patterns']
    },

    // Cross-Modal Abstraction
    abstraction: {
        id: 'abstraction', label: 'Cross-Modal Abstraction', sublabel: 'Unified Feature Space',
        category: 'understanding', color: '#34d399', icon: '⬡', zone: 'abstraction',
        x: 170, y: 0, size: 44,
        description: 'Combines latent vectors from all domain transformers to discover higher-level abstractions and cross-modal relationships. "This shape + this sound + this texture = a specific object." Builds a unified feature space that feeds into the Sensory World Model inside the ego zone.',
        models: ['Cross-Modal Attention Transformer', 'Relational Graph Network', 'Concept Formation VAE', 'Spatial Reasoning GNN'],
        hardware: 'Massive associative memory. Neuromorphic architectures with spike-timing dependent plasticity.',
        processes: ['Associate', 'Abstract', 'Relate', 'Conceptualize']
    },

    // ═══════════════════════════════════════
    //  LEFT SIDE — Motor Pipeline (OUTSIDE ego zone)
    //  The machine's motor hardware is not in its awareness
    // ═══════════════════════════════════════
    // Action Planning
    motor_reasoning: {
        id: 'motor_reasoning', label: 'Motor Reasoning', sublabel: 'Goal Understanding',
        category: 'motor', color: '#ff8c00', icon: '🧠', zone: 'planning',
        x: -220, y: -40, size: 38,
        description: 'Receives the goal vector, a copy of the world model, and the current principles. Understands what the goal requires in the context of the current environment, reasons about feasibility and constraints. The principles act as guardrails that can slightly modify the goal. Outside the ego zone — the machine is not directly aware of this reasoning process.',
        models: ['Goal Interpreter Network', 'Feasibility Assessor', 'Constraint Reasoner'],
        hardware: 'High-bandwidth memory for parallel vector processing.',
        processes: ['Interpret Goal', 'Assess Feasibility', 'Apply Principles']
    },
    action_planner: {
        id: 'action_planner', label: 'Action Planner', sublabel: 'Course of Actions',
        category: 'motor', color: '#fb923c', icon: '📋', zone: 'planning',
        x: -220, y: 50, size: 38,
        description: 'Plans the sequence of actions needed to achieve the reasoned goal. Generates an expectation vector — a prediction of what the environment should look like after successful execution. If the outcome matches or exceeds expectations, the system is rewarded; if it falls short, negative reward updates principles.',
        models: ['Planning Transformer', 'Expectation Generator', 'Counterfactual Simulator', 'Action Sequence Optimizer'],
        hardware: 'GPU clusters for planning search. Neuromorphic co-processors for real-time replanning.',
        processes: ['Plan', 'Generate Expectation', 'Simulate', 'Optimize']
    },

    // Motor Decomposition
    motor_decomp: {
        id: 'motor_decomp', label: 'Motor Decomposition', sublabel: 'Body-Part Commands',
        category: 'motor', color: '#f97316', icon: '⚙', zone: 'decomposition',
        x: -360, y: 10, size: 40,
        description: 'Breaks high-level action plans into specific commands for each body part involved. Determines which limbs, joints, and actuators need to move and in what sequence. The linguistic model has no awareness of these low-level details — it only knows the high-level goal.',
        models: ['Inverse Kinematics Network', 'Body Part Coordinator', 'Motion Primitive Library', 'Collision Avoidance Module'],
        hardware: 'Real-time control loops. Neuromorphic motor controllers with analog feedback.',
        processes: ['Decompose', 'Coordinate', 'Sequence']
    },

    // Motor Execution
    m_actuators: {
        id: 'm_actuators', label: 'Actuators', sublabel: 'Servo, Tendon & Locomotion',
        category: 'motor', color: '#ea580c', icon: '⚡', zone: 'execution',
        x: -480, y: -30, size: 32,
        description: 'Sends final signals to individual servos, motors, and tendon-like actuators. Locomotion (walking, turning, balancing) is achieved through the coordinated activation of these actuators via motor decomposition — it is not a separate system but the emergent result of decomposed motor commands driving multiple actuator groups in concert. Pure hardware interface — the lowest level of motor output. Completely outside the ego zone.',
        models: ['PID Controllers', 'Servo Signal Generator', 'Tendon Force Calculator', 'Gait Pattern Generator', 'Balance Feedback Controller'],
        hardware: 'Sub-millisecond latency servo drivers. Analog feedback circuits for force control. Real-time balance feedback.',
        processes: ['Signal', 'Actuate', 'Locomote', 'Balance', 'Feedback']
    },
    m_speech: {
        id: 'm_speech', label: 'Speech Output', sublabel: 'Vocalization',
        category: 'motor', color: '#b91c1c', icon: '🗣', zone: 'execution',
        x: -480, y: 60, size: 30,
        description: 'Converts linguistic latent vectors into speech output — vocalization, tone, prosody. Receives direct input from the Linguistic Model for language-driven speech as well as motor decomposition commands for non-verbal vocalizations and precise articulatory control.',
        models: ['Speech Synthesizer', 'Prosody Controller', 'Voice Modulator', 'Articulatory Motor Interface'],
        hardware: 'Audio DAC with low-latency speaker drivers.',
        processes: ['Synthesize', 'Vocalize', 'Articulate']
    },

    // Reward System
    reward: {
        id: 'reward', label: 'Reward Signal', sublabel: 'Distributed RL Update',
        category: 'feedback', color: '#22c55e', icon: '✓', zone: 'decomposition',
        x: -360, y: 120, size: 34,
        description: 'Compares the expectation vector (predicted outcome) with the actual sensory observation after action execution. The reward signal is DISTRIBUTED to all models in the decision-and-action pipeline — motor reasoning, action planner, motor decomposition, and principles — as well as ego zone models: survival drives, linguistic model, and goal formation. Principles receive the strongest update as core behavioral guardrails. The sensory pipeline (transformers, abstraction, world model) is NOT updated by reward — those models learn through their own self-supervised objectives on incoming sensory data, not from action outcomes.',
        models: ['Expectation Comparator', 'Reward Calculator', 'Surprise Detector', 'Credit Assignment Network', 'Distributed RL Update Module'],
        hardware: 'Low-latency comparison circuits. Dedicated RL accelerator hardware. Broadcast bus for parallel gradient distribution.',
        processes: ['Compare', 'Calculate Reward', 'Assign Credit', 'Distribute Updates']
    },
};


// ── Connections: latent vector flows between components ──
const CONNECTIONS = [
    // Raw Sensors → Domain Transformers
    { from: 's_vision', to: 'tf_vision', label: 'Visual Stream', color: '#00d4ff', strength: 2 },
    { from: 's_audio', to: 'tf_audio', label: 'Audio Stream', color: '#00b8d4', strength: 2 },
    { from: 's_inertia', to: 'tf_somato', label: 'IMU Stream', color: '#00838f', strength: 2 },
    { from: 's_touch', to: 'tf_somato', label: 'Tactile Stream', color: '#006064', strength: 2 },
    { from: 's_thermo', to: 'tf_somato', label: 'Thermal Stream', color: '#004d40', strength: 1 },

    // Domain Transformers → Cross-Modal Abstraction
    { from: 'tf_vision', to: 'abstraction', label: 'Visual + Temporal', color: '#26c6da', strength: 3 },
    { from: 'tf_audio', to: 'abstraction', label: 'Audio + Temporal', color: '#0097a7', strength: 3 },
    { from: 'tf_somato', to: 'abstraction', label: 'Somato + Temporal', color: '#00695c', strength: 3 },

    // Abstraction → World Model (enters ego zone)
    { from: 'abstraction', to: 'world_model', label: 'Unified Features', color: '#34d399', strength: 3 },

    // Inside ego zone
    { from: 'world_model', to: 'llm', label: 'World State', color: '#4ade80', strength: 3 },
    { from: 'world_model', to: 'self', label: 'World Perception', color: '#4ade80', strength: 2 },
    { from: 'llm', to: 'self', label: 'Self-Narrative', color: '#fbbf24', strength: 2 },
    { from: 'llm', to: 'goal_formation', label: 'Desire Vector', color: '#fbbf24', strength: 3 },
    { from: 'survival_drives', to: 'goal_formation', label: 'Drive Signals', color: '#ef4444', strength: 2 },
    { from: 'survival_drives', to: 'self', label: 'Drive State', color: '#ef4444', strength: 1 },
    { from: 'goal_formation', to: 'self', label: 'Goal State', color: '#a78bfa', strength: 2 },
    { from: 'principles', to: 'self', label: 'Value State', color: '#f472b6', strength: 2 },

    // Ego → Motor pipeline
    { from: 'goal_formation', to: 'motor_reasoning', label: 'Goal Vector', color: '#a78bfa', strength: 3 },
    { from: 'principles', to: 'motor_reasoning', label: 'Guardrails', color: '#f472b6', strength: 2 },
    { from: 'world_model', to: 'motor_reasoning', label: 'World Model Copy', color: '#4ade80', strength: 2 },

    // Motor pipeline
    { from: 'motor_reasoning', to: 'action_planner', label: 'Reasoned Goal', color: '#ff8c00', strength: 3 },
    { from: 'action_planner', to: 'motor_decomp', label: 'Action Plan', color: '#fb923c', strength: 3 },
    { from: 'motor_decomp', to: 'm_actuators', label: 'Actuator Commands', color: '#f97316', strength: 3 },
    { from: 'motor_decomp', to: 'm_speech', label: 'Vocal Motor Cmds', color: '#f97316', strength: 1 },

    // Linguistic model → Speech (direct connection for language-driven speech)
    { from: 'llm', to: 'm_speech', label: 'Linguistic Output', color: '#fbbf24', strength: 2 },

    // Reward feedback loop — input
    { from: 'action_planner', to: 'reward', label: 'Expectation Vec', color: '#fb923c', strength: 2 },

    // Distributed reward signal — updates decision-and-action pipeline + ego zone models
    { from: 'reward', to: 'principles', label: 'RL Update', color: '#2d9a56', strength: 2 },
    { from: 'reward', to: 'motor_decomp', label: 'Motor RL', color: '#2d9a56', strength: 1 },
    { from: 'reward', to: 'action_planner', label: 'Planner RL', color: '#2d9a56', strength: 1 },
    { from: 'reward', to: 'motor_reasoning', label: 'Reasoning RL', color: '#2d9a56', strength: 1 },
    { from: 'reward', to: 'survival_drives', label: 'Drive RL', color: '#2d9a56', strength: 1 },
    { from: 'reward', to: 'llm', label: 'Linguistic RL', color: '#2d9a56', strength: 1 },
    { from: 'reward', to: 'goal_formation', label: 'Goal RL', color: '#2d9a56', strength: 1 },

    // Principles feedback to Goal Formation
    { from: 'principles', to: 'goal_formation', label: 'Value Constraints', color: '#f472b6', strength: 1 },
];

const FIDELITY_LEVELS = [
    { threshold: 0, label: 'Minimal', description: 'Basic signal detection, no semantic understanding' },
    { threshold: 15, label: 'Early Stage', description: 'Simple pattern recognition, limited modalities' },
    { threshold: 30, label: 'Developing', description: 'Multi-modal fusion beginning, basic object recognition' },
    { threshold: 50, label: 'Intermediate', description: 'Rich scene understanding, emotional tone detection' },
    { threshold: 70, label: 'Advanced', description: 'Near human-level in primary modalities' },
    { threshold: 85, label: 'Human-Level', description: 'Comparable to human sensory fidelity across modalities' },
    { threshold: 95, label: 'Superhuman', description: 'Exceeds human perception in select modalities (IR, UV, ultrasonic)' },
];

const CATEGORIES = {
    sensory: { label: 'Sensory Hardware', color: '#00d4ff' },
    understanding: { label: 'Transformers & Abstraction', color: '#34d399' },
    goals: { label: 'Goals & Drives', color: '#a78bfa' },
    principles: { label: 'Principles (RL)', color: '#f472b6' },
    motor: { label: 'Motor System', color: '#ff8c00' },
    feedback: { label: 'Reward / Feedback', color: '#22c55e' },
    meta: { label: 'Core Ego', color: '#c4b5fd' },
};