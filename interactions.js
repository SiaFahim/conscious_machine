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
            if (e.key === 'Escape') this.deselectComponent();
        });
    }
}

