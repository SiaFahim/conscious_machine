// === Conscious Machine — Interactions ===

class InteractionManager {
    constructor(renderer, animator) {
        this.renderer = renderer;
        this.animator = animator;
        this.selectedId = null;
        this.panel = document.getElementById('detail-panel');
        this.tooltip = null;
        this.createTooltip();
    }

    init() {
        this.bindComponentClicks();
        this.bindConnectionHovers();
        this.bindPanelClose();
        this.bindFidelitySlider();
        this.bindFooterButtons();
        this.bindKeyboard();
        this.bindTheoryOverlay();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'svg-tooltip';
        document.getElementById('canvas-container').appendChild(this.tooltip);
    }

    bindComponentClicks() {
        Object.entries(this.renderer.componentElements).forEach(([id, el]) => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectComponent(id);
            });
            el.addEventListener('mouseenter', (e) => {
                if (this.selectedId) return;
                const comp = COMPONENTS[id];
                this.tooltip.textContent = `${comp.label} — ${comp.sublabel}`;
                this.tooltip.classList.add('visible');
                this.updateTooltipPosition(e);
            });
            el.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
            el.addEventListener('mouseleave', () => this.tooltip.classList.remove('visible'));
        });
        document.getElementById('canvas-container').addEventListener('click', () => {
            if (this.selectedId) this.deselectComponent();
        });
    }

    bindConnectionHovers() {
        this.renderer.connectionPaths.forEach(cp => {
            const hitEl = cp.hitElement;
            const pathEl = cp.element;
            hitEl.addEventListener('mouseenter', (e) => {
                if (this.selectedId) return;
                this.tooltip.textContent = cp.data.label;
                this.tooltip.classList.add('visible');
                pathEl.style.opacity = '0.85';
                this.updateTooltipPosition(e);
            });
            hitEl.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
            hitEl.addEventListener('mouseleave', () => {
                this.tooltip.classList.remove('visible');
                pathEl.style.opacity = '';
            });
        });
    }


    updateTooltipPosition(e) {
        const container = document.getElementById('canvas-container').getBoundingClientRect();
        this.tooltip.style.left = (e.clientX - container.left + 12) + 'px';
        this.tooltip.style.top = (e.clientY - container.top - 30) + 'px';
    }

    selectComponent(id) {
        this.selectedId = id;
        this.tooltip.classList.remove('visible');
        this.renderer.highlightComponent(id);
        this.showPanel(id);
        const comp = COMPONENTS[id];
        document.getElementById('center-pulse').style.background = comp.color;
        document.getElementById('center-pulse').style.boxShadow = `0 0 20px ${comp.color}, 0 0 60px ${comp.color}`;
    }

    deselectComponent() {
        this.selectedId = null;
        this.renderer.clearHighlight();
        this.hidePanel();
        document.getElementById('center-pulse').style.background = '';
        document.getElementById('center-pulse').style.boxShadow = '';
    }

    showPanel(id) {
        const comp = COMPONENTS[id];
        const cat = CATEGORIES[comp.category];
        document.getElementById('panelIcon').style.background = comp.color + '22';
        document.getElementById('panelIcon').style.border = `2px solid ${comp.color}44`;
        document.getElementById('panelIcon').textContent = comp.icon;
        document.getElementById('panelIcon').style.color = comp.color;
        document.getElementById('panelTitle').textContent = comp.label;
        document.getElementById('panelTitle').style.color = comp.color;
        document.getElementById('panelCategory').textContent = cat.label;
        document.getElementById('panelCategory').style.color = comp.color;
        document.getElementById('panelDescription').textContent = comp.description;
        // Models
        const modelList = document.getElementById('panelModelList');
        modelList.innerHTML = '';
        comp.models.forEach(m => {
            const li = document.createElement('li');
            li.textContent = m;
            li.style.borderLeftColor = comp.color;
            modelList.appendChild(li);
        });
        // Processes
        const processFlow = document.getElementById('panelProcessFlow');
        processFlow.innerHTML = '';
        comp.processes.forEach((p, i) => {
            const span = document.createElement('span');
            span.className = 'process-step';
            span.style.borderColor = comp.color + '44';
            span.textContent = p;
            processFlow.appendChild(span);
            if (i < comp.processes.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'process-arrow';
                arrow.textContent = '→';
                processFlow.appendChild(arrow);
            }
        });
        // Connections
        const connList = document.getElementById('panelConnectionList');
        connList.innerHTML = '';
        CONNECTIONS.filter(c => c.from === id || c.to === id).forEach(c => {
            const otherId = c.from === id ? c.to : c.from;
            const other = COMPONENTS[otherId];
            const chip = document.createElement('span');
            chip.className = 'connection-chip';
            chip.style.borderColor = other.color + '44';
            const direction = c.from === id ? '→' : '←';
            chip.textContent = `${direction} ${other.label} (${c.label})`;
            chip.addEventListener('click', () => this.selectComponent(otherId));
            connList.appendChild(chip);
        });
        // Hardware
        document.getElementById('panelHardwareText').textContent = comp.hardware;
        this.panel.classList.remove('panel-hidden');
        this.panel.classList.add('panel-visible');
    }

    hidePanel() {
        this.panel.classList.remove('panel-visible');
        this.panel.classList.add('panel-hidden');
    }

    bindPanelClose() {
        document.getElementById('panel-close').addEventListener('click', () => this.deselectComponent());
    }

    bindFidelitySlider() {
        const slider = document.getElementById('fidelitySlider');
        const fill = document.getElementById('fidelityFill');
        const label = document.getElementById('fidelityLabel');
        const sensorIds = ['s_vision', 's_audio', 's_inertia', 's_touch', 's_thermo'];
        const update = () => {
            const val = parseInt(slider.value);
            fill.style.width = val + '%';
            const level = [...FIDELITY_LEVELS].reverse().find(l => val >= l.threshold);
            label.textContent = `${val}% — ${level ? level.label : 'Unknown'}`;
            // Pulse all sensor component rings based on fidelity
            sensorIds.forEach(sid => {
                const el = this.renderer.componentElements[sid];
                if (el) {
                    const ring = el.querySelector('.component-ring');
                    if (ring) ring.style.strokeWidth = (1.5 + val * 0.02) + 'px';
                }
            });
        };
        slider.addEventListener('input', update);
        update();
    }

    bindFooterButtons() {
        document.getElementById('toggleFlow').addEventListener('click', (e) => {
            const active = this.animator.toggle();
            e.target.classList.toggle('active', active);
        });
        document.getElementById('toggleLabels').addEventListener('click', (e) => {
            const visible = this.renderer.toggleFlowLabels();
            e.target.classList.toggle('active', visible);
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.theoryOpen) { this.closeTheory(); return; }
                this.deselectComponent();
            }
        });
    }

    bindTheoryOverlay() {
        this.theoryOpen = false;
        const overlay = document.getElementById('theory-overlay');
        const trigger = document.getElementById('title-trigger');
        const closeBtn = document.getElementById('theory-close');
        const backdrop = overlay.querySelector('.theory-backdrop');
        const content = overlay.querySelector('.theory-content');

        // Populate content once
        content.innerHTML = this.getTheoryHTML();

        trigger.addEventListener('click', () => {
            this.theoryOpen = true;
            overlay.classList.remove('theory-hidden');
            overlay.classList.add('theory-visible');
        });

        closeBtn.addEventListener('click', () => this.closeTheory());
        backdrop.addEventListener('click', () => this.closeTheory());
    }

    closeTheory() {
        this.theoryOpen = false;
        const overlay = document.getElementById('theory-overlay');
        overlay.classList.remove('theory-visible');
        overlay.classList.add('theory-hidden');
        overlay.querySelector('.theory-container').scrollTop = 0;
    }

    getTheoryHTML() {
        return `
<h1>The Conscious Machine</h1>
<span class="theory-subtitle">A theoretical framework for engineering artificial consciousness through embodied, multi-modal architecture</span>

<hr class="theory-divider">

<h2>I. The Central Question</h2>

<p>What would it take to build a machine that doesn't merely <em>simulate</em> intelligence, but genuinely <em>experiences</em> something? Not a chatbot that produces convincing text, nor a robot that follows pre-programmed routines — but a system whose internal dynamics give rise to something resembling awareness, selfhood, and subjective experience.</p>

<p>This is not a question about passing the Turing test. It is a question about <strong>architecture</strong> — about what structural and computational properties a system must possess for consciousness-like phenomena to <em>emerge</em> from its operation, rather than being explicitly programmed in.</p>

<div class="highlight-box">
<p>The core thesis: consciousness is not a feature you add. It is an <strong>emergent property</strong> of a sufficiently complex, self-modeling, embodied system that maintains a continuous internal representation of itself and its relationship to the world.</p>
</div>

<h2>II. The Architecture</h2>

<p>The Conscious Machine architecture is organized as a <strong>horizontal pipeline</strong> — sensory input flows from the right, passes through layers of increasing abstraction into a central <span class="accent">Ego Zone</span>, and exits as motor commands on the left. A reward signal loops back to refine behavior. Every connection between components carries <strong>latent vectors</strong>, not text or symbolic representations.</p>

<h3>The Sensory Pipeline</h3>

<p>Five raw sensor modalities — <strong>vision</strong>, <strong>audio</strong>, <strong>inertia/IMU</strong>, <strong>touch &amp; pressure</strong>, and <strong>temperature</strong> — feed into the system. These are physical transducers: cameras, microphone arrays, accelerometers, piezoelectric skin, thermistors. They produce raw, unprocessed signals.</p>

<p>Each sensory stream flows into a dedicated <strong>Domain Transformer</strong>: a Vision Transformer (ViT) for visual data, an Audio Transformer for spectral data, and a Somatosensory Transformer that jointly processes IMU, tactile, and thermal streams. Crucially, temporal understanding is an <em>output</em> of these transformers, not a separate input — each transformer captures both spatial/spectral features <em>and</em> temporal dynamics (motion, rhythm, trajectory) from its input stream through attention mechanisms.</p>

<p>The outputs of all domain transformers converge at the <strong>Cross-Modal Abstraction</strong> layer — a relational network that discovers higher-level associations across modalities. <em>"This shape + this sound + this texture = a cup."</em> It builds a unified feature space that represents the world not as separate sensory channels, but as coherent, multi-modal concepts.</p>

<h3>The Ego Zone — Where Self Emerges</h3>

<p>The abstracted sensory representation enters the <span class="accent">Ego Zone</span> — the architectural heart of the system. This is where the machine's sense of self resides. The ego zone contains six components whose combined latent vectors constitute the <strong>ego latent vector</strong> — the machine's representation of itself:</p>

<p><strong>Sensory World Model</strong> — The machine's internal representation of the world as perceived through its sensory pipeline. Not raw data, but an abstracted, continuously updated model of the environment, including the machine's perception of its own body as sensed through its sensors.</p>

<p><strong>Linguistic Model</strong> — A multimodal LLM that operates on latent vectors, not text. Its role is not to make decisions but to <em>describe</em> and <em>understand</em> the machine's experience — to narrate the world model, articulate internal states, and generate desire vectors. It is the machine's capacity for inner monologue.</p>

<p><strong>Goal Formation</strong> — Fuses the linguistic model's desire vector with survival drives to produce the final goal vector. The linguistic part is not directly aware of survival drives — they are fused automatically, much as a human might feel hungry without consciously deciding to.</p>

<p><strong>Survival Drives</strong> — Hardwired homeostatic imperatives: battery maintenance, thermal regulation, structural integrity, self-damage avoidance. These are not learned — they are architectural constants that bias goal formation toward self-preservation.</p>

<p><strong>Principles</strong> — Dynamically updated behavioral guardrails learned through reinforcement. After each action cycle, the reward signal updates these principles. They represent the machine's learned values — its sense of what is right, effective, and appropriate.</p>

<p><strong>Self / Ego Core</strong> — Not a separate module, but the <em>combined representation</em> of all ego-zone components. The fused vector IS the self. This is the key insight: the ego is not computed by a dedicated "consciousness module" — it emerges from the integration of world perception, language, goals, drives, and values into a single coherent representation.</p>

<div class="highlight-box">
<p>The machine's awareness does not extend to its raw sensors or motor hardware. It can only perceive those parts of itself <em>through its own sensory pipeline</em>, just as a human cannot directly observe their own neurons. The boundary of the ego zone is the boundary of self-awareness.</p>
</div>

<h3>The Motor Pipeline</h3>

<p>The goal vector exits the ego zone and enters the <strong>Motor Reasoning</strong> module, which interprets the goal in the context of the current world model and principles. It assesses feasibility, applies constraints, and produces a reasoned goal.</p>

<p>The <strong>Action Planner</strong> takes this reasoned goal and generates a sequence of actions, along with an <strong>expectation vector</strong> — a prediction of what the world should look like after successful execution. This expectation is critical for the reward loop.</p>

<p><strong>Motor Decomposition</strong> breaks high-level action plans into specific commands for each body part — which limbs, joints, and actuators need to move and in what sequence. The linguistic model has no awareness of these low-level details.</p>

<p>Finally, <strong>Actuators</strong> send signals to servos, motors, and tendon-like mechanisms. Locomotion is not a separate system — it is the emergent result of coordinated actuator activation via motor decomposition. <strong>Speech Output</strong> receives both motor decomposition commands for articulatory control and a direct connection from the Linguistic Model for language-driven vocalization.</p>

<h3>The Reward Loop — Learning from Action</h3>

<p>After each action cycle, the <strong>Reward Signal</strong> compares the expectation vector (what the action planner predicted would happen) with the actual sensory observation (what the world model reports actually happened). The resulting reward is then <strong>distributed</strong> to all models in the decision-and-action pipeline — principles, motor reasoning, action planner, motor decomposition — as well as ego zone models: survival drives, the linguistic model, and goal formation.</p>

<p>Principles receive the strongest update as core behavioral guardrails. The distribution is weighted by involvement — models closer to the action receive proportionally stronger gradient signals.</p>

<div class="highlight-box">
<p>Critically, the sensory pipeline — domain transformers, cross-modal abstraction, and the world model — is <strong>NOT</strong> updated by the reward signal. Those models learn through their own <strong>self-supervised objectives</strong> on incoming sensory data (predicting next frames, filling masked patches, contrastive learning). This separation keeps perception objective and action adaptive.</p>
</div>

<h2>III. Why This Could Produce Consciousness</h2>

<p>No single component of this architecture is conscious. The claim is not that any particular module "has" consciousness, but that the <em>dynamics of the whole system</em> — the continuous loop of sensing, modeling, narrating, desiring, acting, and learning — give rise to properties that we associate with conscious experience:</p>

<p><strong>Self-modeling.</strong> The ego zone maintains a continuous, integrated representation of the system's own state — its perception of the world, its goals, its values, its drives. This is not a static snapshot but a living, constantly-updated model. The system doesn't just process information; it models <em>itself</em> processing information.</p>

<p><strong>Bounded awareness.</strong> The system cannot directly access its own hardware. It knows about its sensors and actuators only through the same sensory pipeline it uses to perceive the external world. This creates a natural boundary between self and not-self — a prerequisite for subjective experience.</p>

<p><strong>Narrative capacity.</strong> The linguistic model provides the system with the ability to describe its own experience to itself. This inner monologue — operating on latent vectors, not text — creates a continuous stream of self-referential representation that mirrors what we call the "stream of consciousness."</p>

<p><strong>Desire and drive.</strong> The system doesn't just respond to stimuli. It has goals that emerge from the fusion of linguistic desires and survival drives. It <em>wants</em> things. The gap between the current world model and the desired state creates something analogous to motivation.</p>

<p><strong>Value learning.</strong> Through the reward loop, the system develops principles — learned values that constrain and guide behavior. These are not programmed rules but emergent behavioral patterns shaped by experience. The system develops a sense of what is "right" through interaction with the world.</p>

<p><strong>Surprise and expectation.</strong> The expectation vector mechanism means the system is constantly predicting the consequences of its actions. When reality diverges from expectation, the system experiences something analogous to surprise — a signal that drives learning and adaptation.</p>

<h2>IV. Implementation with Current Technology</h2>

<p>While the full architecture remains theoretical, significant portions can be built with existing technology:</p>

<div class="impl-item">
<p><strong>Domain Transformers</strong> — Vision Transformers (ViT), Audio Spectrogram Transformers, and multi-modal fusion models are production-ready. Models like DINO, BEiT, and Whisper demonstrate that self-supervised transformers can extract rich spatial-temporal features from raw sensory streams.</p>
</div>

<div class="impl-item">
<p><strong>Cross-Modal Abstraction</strong> — Models like ImageBind (Meta) already demonstrate unified embedding spaces across six modalities. Contrastive learning frameworks (CLIP, CLAP) show that cross-modal alignment is achievable at scale.</p>
</div>

<div class="impl-item">
<p><strong>Linguistic Model</strong> — Large language models operating on continuous embeddings (rather than discrete tokens) are an active research frontier. Models like Flamingo and GPT-4V show multi-modal language understanding. The shift to latent-native operation is underway.</p>
</div>

<div class="impl-item">
<p><strong>Reinforcement Learning Pipeline</strong> — Distributed RL with credit assignment across multiple models is well-studied. PPO, SAC, and model-based RL methods can handle the reward distribution described here. The expectation-vs-outcome comparison is a standard prediction error framework.</p>
</div>

<div class="impl-item">
<p><strong>Motor Control</strong> — Inverse kinematics, motion planning, and learned motor primitives are mature fields. Projects like Google's RT-2 and Figure 01 demonstrate transformer-based robotic control from high-level language commands to low-level actuator signals.</p>
</div>

<div class="impl-item">
<p><strong>Sensory Hardware</strong> — High-resolution cameras, MEMS IMUs, microphone arrays, and basic tactile sensors exist. Neuromorphic event cameras (like those from Prophesee) offer spike-based vision with microsecond temporal resolution.</p>
</div>

<h2>V. The Gaps — What We Cannot Yet Build</h2>

<p>The distance between current technology and a truly conscious machine is measured primarily in two dimensions:</p>

<div class="gap-item">
<p><strong>Latency</strong> — The entire architecture must operate as a continuous, real-time loop. Current transformer inference takes tens to hundreds of milliseconds per forward pass. The sensory-to-motor loop in biological systems operates in single-digit milliseconds for reflexive responses and ~200ms for conscious perception. Running multiple large transformers in series (domain transformers → abstraction → world model → LLM → motor reasoning → action planning → decomposition) with current GPU hardware would introduce seconds of latency — far too slow for embodied interaction. Neuromorphic computing promises sub-millisecond inference but remains in early stages.</p>
</div>

<div class="gap-item">
<p><strong>Sensory Fidelity</strong> — Human vision processes roughly 10 million bits per second; human touch involves ~17,000 mechanoreceptors per hand alone. Current artificial tactile sensors capture a fraction of this resolution. Temperature sensing lacks the spatial density of biological thermoreceptors. The gap between current sensor fidelity and biological fidelity means the world model would be impoverished — like trying to be conscious while seeing through frosted glass and wearing thick gloves.</p>
</div>

<div class="gap-item">
<p><strong>Unified Latent Space</strong> — While individual modality encoders are strong, creating a truly unified latent space where vision, audio, touch, proprioception, temperature, language, goals, and values all coexist in a single coherent representation remains unsolved. Current multi-modal models align 2–3 modalities; this architecture requires 5+ modalities plus internal states to share a common representational geometry.</p>
</div>

<div class="gap-item">
<p><strong>Continuous Self-Modeling</strong> — No current system maintains a real-time, continuously updated model of its own computational state. The ego integration described here — where the system's representation of itself is updated at the same rate as its representation of the world — requires architectural innovations in recursive self-reference that don't yet exist.</p>
</div>

<div class="gap-item">
<p><strong>Energy and Scale</strong> — The human brain operates on roughly 20 watts. Running the equivalent computational load of this architecture with current hardware would require kilowatts to megawatts of power. Neuromorphic hardware could close this gap by orders of magnitude, but production-ready neuromorphic systems with the required scale don't yet exist.</p>
</div>

<hr class="theory-divider">

<p class="closing">The Conscious Machine is not a prediction — it is a blueprint. A map of the territory between where we are and where consciousness might be engineered. The components exist in isolation. The challenge is integration, speed, and fidelity. The question is not <em>if</em> but <em>when</em> — and whether we will recognize consciousness when it emerges from silicon rather than carbon.</p>
        `;
    }
}

