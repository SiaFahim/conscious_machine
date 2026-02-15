// === Conscious Machine — SVG Renderer (Horizontal Pipeline Layout) ===

class DiagramRenderer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.cx = 0;
        this.cy = 0;
        this.positions = {};
        this.connectionPaths = [];
        this.componentElements = {};
        this.labelsVisible = true;
        this.flowLabelsVisible = false; // connection labels hidden by default to avoid clutter
    }

    init() {
        // Use SVG viewBox for automatic centering and scaling — no pixel-coordinate offsets needed
        this.svg.setAttribute('viewBox', '-520 -270 1040 530');
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        this.cx = 0;
        this.cy = 0;
        this.createDefs();
        this.computePositions();
        this.renderZoneBackgrounds();
        this.renderAwarenessZone();
        this.renderSelfNode();
        this.renderConnections();
        this.renderComponents();
        this.renderZoneLabels();
    }

    createDefs() {
        const defs = this.svg.querySelector('defs');
        defs.innerHTML = `
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <filter id="glow-soft" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="18" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="awareness-blur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="40" result="blur"/>
                <feMerge><feMergeNode in="blur"/></feMerge>
            </filter>
            <radialGradient id="awareness-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#c4b5fd" stop-opacity="0.12"/>
                <stop offset="40%" stop-color="#c4b5fd" stop-opacity="0.06"/>
                <stop offset="70%" stop-color="#c4b5fd" stop-opacity="0.02"/>
                <stop offset="100%" stop-color="#c4b5fd" stop-opacity="0"/>
            </radialGradient>
        `;
        // Arrowhead markers
        const usedColors = new Set();
        CONNECTIONS.forEach(conn => {
            if (usedColors.has(conn.color)) return;
            usedColors.add(conn.color);
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.id = `arrow-${conn.color.replace('#', '')}`;
            marker.setAttribute('viewBox', '0 0 10 10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '5');
            marker.setAttribute('markerWidth', '5');
            marker.setAttribute('markerHeight', '5');
            marker.setAttribute('orient', 'auto-start-reverse');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
            path.setAttribute('fill', conn.color);
            path.setAttribute('opacity', '0.7');
            marker.appendChild(path);
            defs.appendChild(marker);
        });
    }

    computePositions() {
        Object.values(COMPONENTS).forEach(comp => {
            comp._x = this.cx + comp.x;
            comp._y = this.cy + comp.y;
            this.positions[comp.id] = { x: comp._x, y: comp._y };
        });
    }

    renderZoneBackgrounds() {
        const layer = this.svg.querySelector('#connections-layer');
        // Vertical zone separator lines
        const zoneXs = Object.values(ZONES).map(z => z.x);
        const uniqueXs = [...new Set(zoneXs)].sort((a, b) => a - b);
        uniqueXs.forEach(zx => {
            if (zx === 0) return; // skip center
            const line = this.createSVG('line', {
                x1: this.cx + zx - 40, y1: this.cy - 250,
                x2: this.cx + zx - 40, y2: this.cy + 250,
                stroke: '#1a1a35', 'stroke-width': 1, 'stroke-dasharray': '3 6', opacity: 0.4
            });
            layer.appendChild(line);
        });
    }

    renderAwarenessZone() {
        const layer = this.svg.querySelector('#connections-layer');
        const ecx = this.cx + EGO_ZONE.cx;
        const ecy = this.cy + EGO_ZONE.cy;
        const erx = EGO_ZONE.rx;
        const ery = EGO_ZONE.ry;
        // Ego zone ellipse — encompasses all ego-zone components
        const aw = this.createSVG('ellipse', {
            cx: ecx, cy: ecy, rx: erx, ry: ery,
            fill: 'url(#awareness-grad)', class: 'awareness-zone'
        });
        layer.appendChild(aw);
        // Inner ego ring
        const ring = this.createSVG('ellipse', {
            cx: ecx, cy: ecy, rx: erx * 0.65, ry: ery * 0.65,
            fill: 'none', stroke: '#c4b5fd', 'stroke-width': 1,
            'stroke-dasharray': '4 8', opacity: 0.15
        });
        layer.appendChild(ring);
        // Outer ego boundary
        const outerRing = this.createSVG('ellipse', {
            cx: ecx, cy: ecy, rx: erx, ry: ery,
            fill: 'none', stroke: '#c4b5fd', 'stroke-width': 0.8,
            'stroke-dasharray': '2 6', opacity: 0.1
        });
        layer.appendChild(outerRing);
        // Label
        const lbl = this.createSVG('text', {
            x: ecx, y: ecy - ery - 10, 'text-anchor': 'middle',
            class: 'zone-label', style: 'font-size:9px;fill:#c4b5fd;opacity:0.4;letter-spacing:0.18em;font-weight:600'
        });
        lbl.textContent = 'EGO ZONE';
        this.svg.querySelector('#labels-layer').appendChild(lbl);
    }

    renderSelfNode() {
        const layer = this.svg.querySelector('#components-layer');
        const comp = COMPONENTS.self;
        const g = this.createSVG('g', {
            class: 'component-group self-node', 'data-id': 'self',
            transform: `translate(${comp._x}, ${comp._y})`
        });
        // Large soft glow
        g.appendChild(this.createSVG('circle', {
            r: 60, fill: comp.color, opacity: 0.04, filter: 'url(#glow-soft)'
        }));
        // Pulsing outer ring
        g.appendChild(this.createSVG('circle', {
            r: 42, fill: 'none', stroke: comp.color,
            'stroke-width': 2.5, opacity: 0.5, class: 'component-ring self-ring-anim'
        }));
        // Inner ring
        g.appendChild(this.createSVG('circle', {
            r: 36, fill: 'none', stroke: comp.color,
            'stroke-width': 1, opacity: 0.25
        }));
        // Core fill
        g.appendChild(this.createSVG('circle', {
            r: 32, fill: comp.color, opacity: 0.1
        }));
        // Icon
        const icon = this.createSVG('text', {
            x: 0, y: -4, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
            style: `font-size:20px;fill:${comp.color};opacity:0.9`
        });
        icon.textContent = comp.icon;
        g.appendChild(icon);
        // Label
        const label = this.createSVG('text', {
            x: 0, y: 16, 'text-anchor': 'middle',
            class: 'component-label', style: `font-size:11px;fill:${comp.color};font-weight:600`
        });
        label.textContent = comp.label;
        g.appendChild(label);

        layer.appendChild(g);
        this.componentElements['self'] = g;
    }

    renderConnections() {
        const layer = this.svg.querySelector('#connections-layer');
        this.connectionPaths = [];
        CONNECTIONS.forEach((conn, i) => {
            const from = this.positions[conn.from];
            const to = this.positions[conn.to];
            if (!from || !to) return;
            const path = this.createCurvedPath(from, to, i, conn);
            const markerId = `arrow-${conn.color.replace('#', '')}`;
            const pathEl = this.createSVG('path', {
                d: path, class: 'connection-path',
                stroke: conn.color, 'stroke-width': conn.strength * 0.6 + 0.4,
                'marker-end': `url(#${markerId})`,
                'data-from': conn.from, 'data-to': conn.to, 'data-index': i
            });
            pathEl.setAttribute('filter', 'url(#glow)');
            layer.appendChild(pathEl);

            // Invisible wider hit area for hover detection
            const hitPath = this.createSVG('path', {
                d: path, class: 'connection-hit',
                stroke: 'transparent', 'stroke-width': 12, fill: 'none',
                'data-label': conn.label, 'data-color': conn.color, 'data-index': i
            });
            layer.appendChild(hitPath);

            this.connectionPaths.push({ element: pathEl, hitElement: hitPath, data: conn, index: i });

            // Flow label — only shown when toggled on
            const totalLen = pathEl.getTotalLength();
            let pt;
            try { pt = pathEl.getPointAtLength(totalLen * 0.5); } catch (e) { pt = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }; }
            const flowLabel = this.createSVG('text', {
                x: pt.x, y: pt.y - 6, 'text-anchor': 'middle', class: 'flow-label',
                style: this.flowLabelsVisible ? '' : 'display:none'
            });
            flowLabel.textContent = conn.label;
            this.svg.querySelector('#labels-layer').appendChild(flowLabel);
        });
    }

    createCurvedPath(from, to, index, conn) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return `M${from.x},${from.y} L${to.x},${to.y}`;

        const sign = (index % 2 === 0 ? 1 : -1);
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        let offset;

        if (absDx > absDy * 2) {
            offset = sign * Math.min(dist * 0.15, 40);
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2 + offset;
            return `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;
        } else {
            offset = sign * Math.min(dist * 0.2, 35);
            const mx = (from.x + to.x) / 2 - (dy / dist) * offset;
            const my = (from.y + to.y) / 2 + (dx / dist) * offset;
            return `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;
        }
    }

    renderComponents() {
        const layer = this.svg.querySelector('#components-layer');
        Object.values(COMPONENTS).filter(c => c.id !== 'self').forEach((comp, idx) => {
            const g = this.createSVG('g', {
                class: 'component-group', 'data-id': comp.id,
                transform: `translate(${comp._x}, ${comp._y})`
            });
            const s = comp.size;
            g.appendChild(this.createSVG('circle', {
                r: s * 0.6, fill: comp.color, opacity: 0.05, filter: 'url(#glow-soft)'
            }));
            g.appendChild(this.createSVG('circle', {
                r: s * 0.42, fill: 'none', stroke: comp.color,
                'stroke-width': 1.5, opacity: 0.7, class: 'component-ring'
            }));
            g.appendChild(this.createSVG('circle', {
                r: s * 0.38, fill: comp.color, opacity: 0.07
            }));
            const icon = this.createSVG('text', {
                x: 0, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
                style: `font-size:${Math.max(s * 0.3, 10)}px;fill:${comp.color};opacity:0.9`
            });
            icon.textContent = comp.icon;
            g.appendChild(icon);
            const label = this.createSVG('text', {
                x: 0, y: s * 0.5 + 12, 'text-anchor': 'middle',
                class: 'component-label', style: `font-size:10px;fill:${comp.color}`
            });
            label.textContent = comp.label;
            g.appendChild(label);
            const sub = this.createSVG('text', {
                x: 0, y: s * 0.5 + 23, 'text-anchor': 'middle',
                class: 'component-sublabel', style: 'font-size:8px'
            });
            sub.textContent = comp.sublabel;
            g.appendChild(sub);

            g.style.opacity = '0';
            setTimeout(() => {
                g.style.transition = 'opacity 0.6s ease-out';
                g.style.opacity = '1';
            }, 100 + idx * 60);

            layer.appendChild(g);
            this.componentElements[comp.id] = g;
        });
    }

    renderZoneLabels() {
        const labelsLayer = this.svg.querySelector('#labels-layer');
        Object.values(ZONES).forEach(zone => {
            const lbl = this.createSVG('text', {
                x: this.cx + zone.x, y: this.cy - 260,
                'text-anchor': 'middle', class: 'zone-label',
                style: 'font-size:9px;fill:#8888aa;opacity:0.5;letter-spacing:0.08em;font-weight:500'
            });
            lbl.textContent = zone.label.toUpperCase();
            labelsLayer.appendChild(lbl);
        });
    }

    createSVG(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    }

    rerender() {
        ['#connections-layer', '#components-layer', '#labels-layer', '#particles-layer'].forEach(sel => {
            this.svg.querySelector(sel).innerHTML = '';
        });
        this.componentElements = {};
        this.connectionPaths = [];
        this.computePositions();
        this.renderZoneBackgrounds();
        this.renderAwarenessZone();
        this.renderSelfNode();
        this.renderConnections();
        this.renderComponents();
        this.renderZoneLabels();
    }

    highlightComponent(id) {
        Object.entries(this.componentElements).forEach(([cid, el]) => {
            el.classList.toggle('selected', cid === id);
            el.style.opacity = id ? (cid === id ? '1' : '0.25') : '1';
        });
        this.connectionPaths.forEach(cp => {
            const related = cp.data.from === id || cp.data.to === id;
            cp.element.classList.toggle('highlighted', id ? related : false);
            cp.element.style.opacity = id ? (related ? '0.85' : '0.06') : '0.4';
        });
    }

    clearHighlight() {
        this.highlightComponent(null);
    }

    toggleFlowLabels() {
        this.flowLabelsVisible = !this.flowLabelsVisible;
        this.svg.querySelectorAll('.flow-label').forEach(el => {
            el.style.display = this.flowLabelsVisible ? '' : 'none';
        });
        return this.flowLabelsVisible;
    }
}
