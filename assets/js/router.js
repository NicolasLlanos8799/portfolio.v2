/**
 * Vanilla JS SPA Router (Hash Based)
 * Architecture: No external dependencies. Strict hash mapping.
 */

const routes = {
    '#/': 'view-home',
    '#/projects': 'view-projects',
    '#/work': 'view-work'
};

const scrollState = new Map();

class HashRouter {
    constructor() {
        this.currentHash = window.location.hash || '#/';
        this.isTransitioning = false;
        this.prefetched = false;
        this.init();
    }

    init() {
        // Intercept clicks on links with data-link
        document.body.addEventListener('click', e => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                const targetHash = link.getAttribute('href');
                if (targetHash && targetHash.startsWith('#/')) {
                    e.preventDefault();
                    if (this.currentHash !== targetHash) {
                        // Save scroll state before leaving the current view entirely
                        scrollState.set(this.currentHash, window.scrollY);
                        window.location.hash = targetHash;
                    } else {
                        // Same main route clicked, just scroll to section target or top
                        this.scrollToSection(targetHash);
                    }
                }
            }
        });

        // Prefetch on hover/focus
        document.body.addEventListener('mouseover', e => {
            const link = e.target.closest('[data-link]');
            if (link && link.getAttribute('href') === '#/projects') {
                this.prefetchProjects();
            }
        });

        // Trigger view swapping strictly when hashchange happens 
        window.addEventListener('hashchange', () => {
            // No strict control of back/forward over hash, so we 
            // implicitly accept window.location.hash as the ultimate state truth
            this.handleRoute(window.location.hash);
        });

        // Initialization logic for normal load / refresh
        if (!window.location.hash || !window.location.hash.startsWith('#/')) {
            window.location.hash = '#/';
        } else {
            this.handleRoute(window.location.hash, true);
        }
    }

    prefetchProjects() {
        if (this.prefetched) return;
        this.prefetched = true;
        const carousels = document.querySelectorAll('#view-projects [data-images]');
        carousels.forEach(c => {
            try {
                const images = JSON.parse(c.getAttribute('data-images') || "[]");
                images.forEach(src => {
                    const img = new Image();
                    img.src = src;
                });
            } catch (e) { }
        });
    }

    parseHash(hash) {
        if (!hash || !hash.startsWith('#/')) hash = '#/';

        // Exact Route (e.g "#/" or "#/projects")
        if (routes[hash]) {
            return { route: hash, section: null };
        }

        // Section Anchor in Home (e.g "#/work", "#/about")
        if (hash.length > 2) {
            const section = hash.substring(2);
            return { route: '#/', section: section };
        }

        return { route: '#/', section: null };
    }

    async handleRoute(newHash, isInitial = false) {
        if (this.isTransitioning) return;

        const parsedOld = this.parseHash(this.currentHash);
        const parsedNew = this.parseHash(newHash);

        // If the main structural route is identical, only the scroll needs changing
        if (parsedOld.route === parsedNew.route && !isInitial) {
            this.currentHash = newHash;
            this.scrollToSection(newHash);
            return;
        }

        this.isTransitioning = true;

        const newViewId = routes[parsedNew.route];
        const oldViewId = routes[parsedOld.route];

        const newView = document.getElementById(newViewId);
        const oldView = oldViewId ? document.getElementById(oldViewId) : null;

        let transitionedOut = false;

        // Transition out
        if (oldView && oldView !== newView && !isInitial) {
            oldView.classList.remove('is-active');
            oldView.classList.add('transitioning-out');

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!prefersReducedMotion) {
                // Wait for the exact CSS fadeout time (0.4s default in styles.css)
                await new Promise(r => setTimeout(r, 400));
            }

            oldView.classList.remove('transitioning-out');
            oldView.classList.add('hidden');
            oldView.setAttribute('aria-hidden', 'true');
            transitionedOut = true;
        }

        // Hide remaining rogue pages
        if (isInitial || !transitionedOut) {
            Object.values(routes).forEach(id => {
                if (id !== newViewId) {
                    const v = document.getElementById(id);
                    if (v) {
                        v.classList.add('hidden');
                        v.classList.remove('is-active');
                        v.setAttribute('aria-hidden', 'true');
                    }
                }
            });
        }

        this.currentHash = newHash;

        // Transition in
        if (newView) {
            newView.classList.remove('hidden');
            newView.setAttribute('aria-hidden', 'false');

            // Layout reflow force
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

            newView.classList.add('is-active');
            this.runHooks(parsedNew.route, newView);
        }

        // Check if we need to restore scroll or jump natively
        if (parsedNew.section) {
            setTimeout(() => this.scrollToSection(newHash), 50);
        } else if (!isInitial && scrollState.has(newHash)) {
            // It's a "back" button click navigation to a visited path
            window.scrollTo({
                top: scrollState.get(newHash),
                behavior: 'instant'
            });
        } else {
            // Complete fresh visit -> force scroll top
            window.scrollTo({
                top: 0,
                behavior: isInitial ? 'instant' : 'smooth'
            });
        }

        this.isTransitioning = false;
    }

    runHooks(route, view) {
        if (route === '#/projects') {
            // Force browser to recalculate bounds before attempting logic
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (typeof window.initProjectCarousels === 'function') {
                        window.initProjectCarousels();
                    }
                });
            });
        }

        // Focus management: screen readers
        const heading = view.querySelector('h1, h2, h3');
        if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
        }
    }

    scrollToSection(hash) {
        const parsed = this.parseHash(hash);
        if (parsed.section) {
            const el = document.getElementById(parsed.section);
            if (el) {
                const headerOffset = 100;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Global invocation tracking
document.addEventListener('DOMContentLoaded', () => {
    window.spaRouter = new HashRouter();
});
