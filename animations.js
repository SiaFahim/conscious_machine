// === Conscious Machine — Animations ===
// Synchronized pulse-wave particle flow through the pipeline.
// Sensors fire together → converge through transformers → land at ego zone →
// exit as motor signals (synchronized, then diverge) → reward loops back.

class FlowAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.particles = [];
        this.running = true;
        this.animationId = null;
        this.particleLayer = document.querySelector('#particles-layer');

        // Global pulse clock — drives the synchronized wave
        this.pulseTime = 0;
        // Full cycle duration in ms (~4 seconds per pulse wave)
        this.cycleDuration = 4000;
        // Overlapping pulses — two waves offset so the second starts
        // while the first is still in the motor section
        this.numPulseWaves = 2;
        this.waveSpacing = 0.65; // second wave starts at 65% through the cycle
    }

    // ── Pipeline stage classification ──
    // Each connection is assigned a stage with a phase offset (0–1) within the cycle.
    // Connections in the same stage fire at the same phase; later stages fire later.
    classifyConnection(conn) {
        const from = conn.from;
        const to = conn.to;

        // Stage 0: Raw sensors → Domain transformers (phase 0.0–0.15)
        if (from.startsWith('s_')) return { stage: 'sensor', phase: 0.0, speed: 1.0 };

        // Stage 1: Transformers → Abstraction (phase 0.15–0.30)
        if (from.startsWith('tf_') && to === 'abstraction') return { stage: 'transform', phase: 0.15, speed: 0.95 };

        // Stage 2: Abstraction → World model (phase 0.30–0.42)
        if (from === 'abstraction') return { stage: 'abstract', phase: 0.30, speed: 1.0 };

        // Stage 3: Inside ego zone (phase 0.38–0.55) — slightly overlapping, internal processing
        if (this.isEgoInternal(from, to)) return { stage: 'ego', phase: 0.38, speed: 0.8 };

        // Stage 4: Ego → Motor reasoning (phase 0.55–0.65)
        if (to === 'motor_reasoning') return { stage: 'ego_out', phase: 0.55, speed: 1.0 };

        // Stage 5: Motor reasoning → Action planner (phase 0.62–0.72)
        if (from === 'motor_reasoning') return { stage: 'motor_plan', phase: 0.62, speed: 1.0 };

        // Stage 6: Action planner → Motor decomp (phase 0.70–0.80)
        if (from === 'action_planner' && to === 'motor_decomp') return { stage: 'motor_decomp', phase: 0.70, speed: 1.0 };

        // Stage 7: Motor decomp → Actuators/Speech (phase 0.78–0.88, diverging)
        if (from === 'motor_decomp') {
            const jitter = to === 'm_actuators' ? 0.0 : 0.04;
            return { stage: 'motor_exec', phase: 0.78 + jitter, speed: 1.1 + jitter };
        }

        // Stage 7b: LLM → Speech (direct linguistic output, same phase as motor exec)
        if (from === 'llm' && to === 'm_speech') return { stage: 'motor_exec', phase: 0.80, speed: 1.0 };

        // Stage 8: Reward feedback loop — inputs (phase 0.85–0.90)
        if (to === 'reward') return { stage: 'reward_in', phase: 0.85, speed: 0.9 };

        // Stage 9: Distributed reward — outputs to pipeline + ego zone (phase 0.90–0.97)
        if (from === 'reward') {
            const rewardPhases = {
                'principles': 0.90, 'motor_decomp': 0.91,
                'action_planner': 0.92, 'motor_reasoning': 0.93,
                'survival_drives': 0.94, 'llm': 0.95, 'goal_formation': 0.96,
            };
            return { stage: 'reward_out', phase: rewardPhases[to] || 0.92, speed: 0.9 };
        }

        // Feedback: principles → goal_formation (closes the loop, phase ~0.98)
        if (from === 'principles' && to === 'goal_formation') return { stage: 'feedback', phase: 0.98, speed: 0.85 };

        // Default fallback
        return { stage: 'default', phase: 0.4, speed: 1.0 };
    }

    isEgoInternal(from, to) {
        const egoIds = ['self', 'world_model', 'llm', 'goal_formation', 'survival_drives', 'principles'];
        return egoIds.includes(from) && egoIds.includes(to);
    }

    start() {
        this.pulseTime = performance.now();
        this.spawnParticles();
        this.animate();
    }

    stop() {
        this.running = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.clearParticles();
    }

    toggle() {
        if (this.running) { this.stop(); } else { this.running = true; this.start(); }
        return this.running;
    }

    spawnParticles() {
        this.clearParticles();
        this.renderer.connectionPaths.forEach(cp => {
            const count = Math.max(1, Math.ceil(cp.data.strength * 0.8));
            // Spawn particles for each overlapping pulse wave
            for (let wave = 0; wave < this.numPulseWaves; wave++) {
                const waveOffset = wave * this.waveSpacing;
                for (let i = 0; i < count; i++) {
                    this.createParticle(cp, i, count, waveOffset);
                }
            }
        });
    }

    createParticle(connectionPath, particleIndex, totalInGroup, waveOffset = 0) {
        const pathEl = connectionPath.element;
        const totalLength = pathEl.getTotalLength();
        if (totalLength === 0) return;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const size = 1.8 + connectionPath.data.strength * 0.5;
        circle.setAttribute('r', size);
        circle.setAttribute('fill', connectionPath.data.color);
        circle.setAttribute('opacity', '0');
        circle.setAttribute('class', 'flow-particle');
        circle.setAttribute('filter', 'url(#glow)');
        this.particleLayer.appendChild(circle);

        const classification = this.classifyConnection(connectionPath.data);
        // Slight spread within a group so particles aren't perfectly stacked
        const groupSpread = totalInGroup > 1 ? (particleIndex / (totalInGroup - 1) - 0.5) * 0.03 : 0;

        const particle = {
            element: circle,
            path: pathEl,
            totalLength: totalLength,
            color: connectionPath.data.color,
            size: size,
            connectionIndex: connectionPath.index,
            // Pulse-wave properties
            stage: classification.stage,
            phaseOffset: (classification.phase + groupSpread + waveOffset) % 1.0,
            speedMult: classification.speed,
            strength: connectionPath.data.strength,
        };
        this.particles.push(particle);
    }

    clearParticles() {
        this.particles.forEach(p => p.element.remove());
        this.particles = [];
    }

    animate(now) {
        if (!this.running) return;
        if (!now) now = performance.now();

        // Global cycle progress (0–1), repeating
        const cycleProgress = ((now - this.pulseTime) % this.cycleDuration) / this.cycleDuration;

        this.particles.forEach(p => {
            // How far into its travel this particle should be
            // Based on global cycle minus its phase offset
            let localProgress = (cycleProgress - p.phaseOffset) * p.speedMult;

            // The particle's active window — it travels for ~20% of the cycle
            const travelWindow = 0.18;

            // Normalize to 0–1 within the travel window
            // Handle wrap-around for the closed loop
            if (localProgress < -0.5) localProgress += 1;
            if (localProgress > 1) localProgress -= 1;

            const t = localProgress / travelWindow;

            if (t < 0 || t > 1) {
                // Particle is not in its active phase — hide it
                p.element.setAttribute('opacity', '0');
                return;
            }

            try {
                // Smooth easing: ease-in-out for natural pulse feel
                const eased = t < 0.5
                    ? 2 * t * t
                    : 1 - Math.pow(-2 * t + 2, 2) / 2;

                const point = p.path.getPointAtLength(eased * p.totalLength);
                p.element.setAttribute('cx', point.x);
                p.element.setAttribute('cy', point.y);

                // Pulse opacity: bright in the middle, fade at edges
                const pulse = Math.sin(t * Math.PI);
                const opacity = 0.3 + 0.7 * pulse;
                p.element.setAttribute('opacity', opacity);

                // Pulse size: slightly larger at peak
                const dynamicSize = p.size * (0.8 + 0.4 * pulse);
                p.element.setAttribute('r', dynamicSize);
            } catch (e) {
                p.element.setAttribute('opacity', '0');
            }
        });

        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    refreshPaths() {
        this.clearParticles();
        if (this.running) this.spawnParticles();
    }
}

// === Background ambient animation ===
class AmbientAnimator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.dots = [];
    }

    init(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.15;z-index:0;';
        container.insertBefore(this.canvas, container.firstChild);
        this.resize();
        this.createDots();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    createDots() {
        this.dots = [];
        const count = 60;
        for (let i = 0; i < count; i++) {
            this.dots.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                r: 1 + Math.random() * 1.5,
                alpha: 0.2 + Math.random() * 0.3,
            });
        }
    }

    animate() {
        const { ctx, canvas, dots } = this;
        if (!ctx) { this.ctx = this.canvas.getContext('2d'); }
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        dots.forEach(d => {
            d.x += d.vx; d.y += d.vy;
            if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
            if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(99, 102, 241, ${d.alpha})`;
            this.ctx.fill();
        });
        // Draw faint lines between nearby dots
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(dots[i].x, dots[i].y);
                    this.ctx.lineTo(dots[j].x, dots[j].y);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

