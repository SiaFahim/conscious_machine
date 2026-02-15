# Conscious Machine

**A theoretical architecture for artificial consciousness — interactive visualization**

> What if consciousness isn't a single model, but an emergent property of many specialized systems working together?

This project presents a practical architectural blueprint for a machine that doesn't just process inputs and produce outputs, but *perceives*, *understands*, *wants*, *acts*, and *learns* — in a continuous real-time loop. It is not a single large language model. It is a distributed system of specialized ML models, each handling a specific domain, whose combined latent vectors produce something that begins to resemble a self.

**[→ Live Visualization](https://siafahim.github.io/conscious_machine/)**

---

## The Core Idea

Most AI systems today are stateless pipelines: input → model → output. A conscious machine needs something fundamentally different — a **persistent, embodied loop** where sensing the world, understanding it, forming desires, acting on them, and learning from the results all happen continuously and simultaneously.

The key insight: **consciousness is not computation. It is the coherent integration of many specialized computations into a unified self-model that persists through time.**

This architecture achieves that through six stages arranged in a continuous loop:

```
Sense → Transform → Abstract → Understand (Ego) → Plan → Act → [observe outcome] → Learn → repeat
```

---

## Architecture Overview

### 1. Raw Sensors (Outside Ego Zone)

The machine's physical interface with the world. These are hardware — cameras, microphones, IMUs, pressure sensors, thermistors. They produce raw data streams, nothing more.

| Sensor | Data |
|--------|------|
| **Vision** | Camera feeds, depth maps |
| **Audio** | Microphone array, spatial audio |
| **Inertia / IMU** | Acceleration, angular velocity, orientation |
| **Touch & Pressure** | Surface texture, grip force, contact |
| **Temperature** | Ambient and surface thermal gradients |

**Critical point:** The sensors themselves are *not* in the machine's awareness. The machine cannot "feel" its cameras any more than you can feel your retinal cells. It only knows about its sensors through the processed perception that eventually enters the ego zone.

### 2. Domain Transformers

Each sensory stream passes through a domain-specific transformer that captures **both** the domain's features **and** temporal dynamics from that stream:

- **Vision Transformer (ViT)** — Spatial features (edges, objects, scenes) + temporal dynamics (motion, optical flow, change detection)
- **Audio Transformer** — Spectral features (phonemes, tones, frequencies) + temporal dynamics (rhythm, speech cadence, event sequences)
- **Somatosensory Transformer** — Body-state features from IMU + touch + temperature jointly, plus temporal dynamics (movement trajectories, pressure changes)

**There is no separate "temporal sensor."** Temporal understanding is an *output* of each transformer, not a raw input. Every transformer learns to capture how its domain changes over time as part of its core function.

### 3. Cross-Modal Abstraction

The outputs of all domain transformers converge here. This layer discovers higher-level relationships *across* modalities:

*"This shape + this sound + this texture = a specific object."*

It builds a unified feature space — relational graphs, concept formations, spatial reasoning — that feeds into the ego zone.

### 4. The Ego Zone

This is the core of the architecture. The ego is **not** a single module — it is the combined latent vector of several interacting components:

| Component | Role |
|-----------|------|
| **Sensory World Model** | The machine's internal representation of reality — not raw data, but abstracted understanding. Includes perception of its own body (as sensed through its sensors). |
| **Linguistic Model** | A multimodal LLM operating on latent vectors (not text). It *describes* experience — it is the narrator, not the decision-maker. |
| **Goal Formation** | Fuses the linguistic model's desires with survival drives to produce the goal vector. |
| **Survival Drives** | Hardwired imperatives: battery maintenance, thermal regulation, self-preservation. The linguistic model is not directly aware of these. |
| **Principles** | Behavioral guardrails learned through reinforcement. Updated after every action cycle based on reward signals. |
| **Self / Ego Core** | The combined latent vector of all the above. This fused representation *is* the self. |

**The ego zone boundary defines awareness.** Components inside it are what the machine "knows about." Components outside (sensors, motors) are part of the machine but outside its direct awareness — just as your neurons are part of you but you cannot observe them directly.

### 5. Motor Pipeline (Outside Ego Zone)

Once the ego zone produces a goal, the motor pipeline executes it:

1. **Motor Reasoning** — Receives the goal vector, a copy of the world model, and current principles. Reasons about feasibility and constraints.
2. **Action Planner** — Plans the sequence of actions. Generates an *expectation vector* — a prediction of what should happen.
3. **Motor Decomposition** — Breaks high-level plans into specific commands for individual body parts.
4. **Execution** — Actuators (servos, tendons — locomotion emerges from coordinated actuator activation), Speech (vocalization, with direct input from the Linguistic Model).

### 6. Reward & Learning Loop

After every action:

1. The **Action Planner's expectation vector** is compared against the **World Model's actual observation**
2. Match → positive reward. Exceed → amplified reward. Fall short → negative reward.
3. The reward signal is **distributed to all models in the decision-and-action pipeline** — Motor Reasoning, Action Planner, Motor Decomposition, and Principles — weighted by their degree of involvement. Models closer to the action receive stronger gradient updates.
4. Updated principles feed back into **Goal Formation**, closing the loop

The sensory pipeline (transformers, abstraction, world model) is **not** updated by reward — those models learn through their own self-supervised objectives on incoming sensory data, not from action outcomes. This separation keeps perception objective and action adaptive.

---

## What Makes This Different

| Traditional AI | This Architecture |
|---------------|-------------------|
| Single model (LLM) | Distributed specialized models |
| Stateless (per request) | Persistent continuous loop |
| Text in, text out | Latent vectors between all components |
| No embodiment | Full sensorimotor integration |
| No self-model | Explicit ego zone with world model |
| No intrinsic motivation | Survival drives + learned principles |
| External reward design | Self-generated reward from expectation vs outcome |
| LLM is the agent | LLM is the *describer*, not the decision-maker |

---

## The Visualization

### Layout

- **Right side** — Sensory pipeline: 5 raw sensors → 3 domain transformers → cross-modal abstraction
- **Center** — Ego zone: world model, linguistic model, goal formation, survival drives, principles, self core — enclosed in a dashed ellipse boundary
- **Left side** — Motor pipeline: motor reasoning → action planning → motor decomposition → actuators / speech
- **Feedback loop** — Reward signal compares expectation vs actual outcome, updates principles via RL

### Interactions

- **Click any component** to open a detail panel showing its description, ML models, hardware requirements, and connections
- **Pan** (drag) and **zoom** (scroll wheel) to navigate the diagram
- **Fidelity slider** — Simulates sensory fidelity progression from 0% (minimal) to 100% (superhuman), visually activating sensors
- **Flow Labels** toggle — Show/hide connection labels for cleaner viewing
- **Flow Animation** toggle — Animated particles flow along connection paths showing data movement
- **Reset View** — Return to default zoom and position

### Technical Stack

| | |
|---|---|
| **Rendering** | Pure SVG with programmatic element creation |
| **Animation** | RequestAnimationFrame-based particle flow along cubic Bézier paths |
| **Interaction** | Custom pan/zoom with smooth lerp-based scroll zoom |
| **Styling** | CSS with glow filters, gradient fills, dashed awareness boundaries |
| **Fonts** | Inter + JetBrains Mono (Google Fonts) |
| **Dependencies** | None — zero frameworks, zero build tools |

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/SiaFahim/conscious_machine.git
cd conscious_machine

# Serve with any static file server
python3 -m http.server 8090

# Open in browser
open http://localhost:8090
```

No build step. No `npm install`. Just serve the files.

---

## File Structure

```
conscious_machine/
├── index.html          # Page structure and layout
├── styles.css          # All styling, animations, glow effects
├── data.js             # Architecture data: components, connections, zones
├── renderer.js         # SVG rendering engine: nodes, paths, ego zone
├── animations.js       # Particle flow animations along connections
├── interactions.js     # Pan, zoom, click, fidelity slider, toggles
└── app.js              # Entry point: initializes all modules
```

---

## Theoretical Context

This architecture draws from several fields:

- **Global Workspace Theory** (Baars) — Consciousness as a "workspace" where specialized processors share information
- **Integrated Information Theory** (Tononi) — Consciousness correlates with integrated information across a system
- **Predictive Processing** (Friston) — The brain as a prediction machine that minimizes surprise
- **Embodied Cognition** — Understanding requires a body that interacts with the world
- **Reinforcement Learning** — Behavior shaped by reward signals rather than explicit programming

The architecture doesn't claim to *produce* consciousness. It proposes a structural framework where consciousness-like properties — self-modeling, persistent identity, intrinsic motivation, embodied understanding — could *emerge* from the interaction of specialized subsystems.

---

## Limitations & Open Questions

- **Latent vector communication** — How exactly do heterogeneous models share a common latent space? This requires significant research in universal embedding spaces.
- **Binding problem** — How does the ego zone maintain coherent integration across all its components in real-time?
- **Grounding** — Does processing sensor data through transformers actually produce "understanding," or just sophisticated pattern matching?
- **Hardware** — Current compute cannot run all these models simultaneously in real-time. Neuromorphic architectures may be necessary.
- **The hard problem** — Even if this architecture produces all the *functional* properties of consciousness, does it produce *experience*?

These are open research questions, not engineering problems with known solutions.

---

*This is a theoretical exploration, not a product roadmap. The goal is to think clearly about what a conscious machine would need to look like — and to make that thinking visible and interactive.*