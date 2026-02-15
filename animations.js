// === Conscious Machine — Animations ===

class FlowAnimator {
    constructor(renderer) {
        this.renderer = renderer;
        this.particles = [];
        this.running = true;
        this.animationId = null;
        this.particleLayer = document.querySelector('#particles-layer');
    }

    start() {
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
            const count = Math.max(1, cp.data.strength);
            for (let i = 0; i < count; i++) {
                this.createParticle(cp);
            }
        });
    }

    createParticle(connectionPath) {
        const pathEl = connectionPath.element;
        const totalLength = pathEl.getTotalLength();
        if (totalLength === 0) return;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const size = 1.5 + connectionPath.data.strength * 0.4;
        circle.setAttribute('r', size);
        circle.setAttribute('fill', connectionPath.data.color);
        circle.setAttribute('opacity', '0.8');
        circle.setAttribute('class', 'flow-particle');
        circle.setAttribute('filter', 'url(#glow)');
        this.particleLayer.appendChild(circle);

        const particle = {
            element: circle,
            path: pathEl,
            totalLength: totalLength,
            progress: Math.random(),
            speed: (0.15 + Math.random() * 0.2) / Math.max(totalLength, 100),
            color: connectionPath.data.color,
            size: size,
            connectionIndex: connectionPath.index,
        };
        this.particles.push(particle);
    }

    clearParticles() {
        this.particles.forEach(p => p.element.remove());
        this.particles = [];
    }

    animate() {
        if (!this.running) return;
        this.particles.forEach(p => {
            p.progress += p.speed;
            if (p.progress > 1) p.progress -= 1;

            try {
                const point = p.path.getPointAtLength(p.progress * p.totalLength);
                p.element.setAttribute('cx', point.x);
                p.element.setAttribute('cy', point.y);
                // Pulse opacity
                const pulse = 0.4 + 0.6 * Math.sin(p.progress * Math.PI);
                p.element.setAttribute('opacity', pulse);
            } catch (e) {
                // Path may have been removed during rerender
            }
        });
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    refreshPaths() {
        // Re-sync particles with new paths after rerender
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

