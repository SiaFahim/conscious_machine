// === Conscious Machine — Main Application ===

document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('diagram');

    // Initialize renderer
    const renderer = new DiagramRenderer(svg);
    renderer.init();

    // Initialize flow animations
    const flowAnimator = new FlowAnimator(renderer);
    flowAnimator.start();

    // Initialize ambient background
    const ambient = new AmbientAnimator();
    ambient.init(document.getElementById('canvas-container'));

    // Initialize interactions
    const interactions = new InteractionManager(renderer, flowAnimator);
    interactions.init();

    // Handle window resize — refresh particles and rebind interactions
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            flowAnimator.refreshPaths();
            // Rebind click handlers to new elements
            interactions.bindComponentClicks();
        }, 350);
    });

    // Log ready
    console.log('Conscious Machine — Interactive Architecture Visualization loaded.');
});

