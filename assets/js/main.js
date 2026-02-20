document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-4');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial setup for animated elements (will be used in upcoming sections)
    const fadeElements = document.querySelectorAll('.animate-on-scroll');
    fadeElements.forEach(el => {
        el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-700', 'ease-out');
        observer.observe(el);
    });
    // Language Switcher Logic
    const langToggle = document.getElementById('lang-toggle');
    const html = document.documentElement;

    // Set default language to Spanish if not set
    if (!localStorage.getItem('lang')) {
        localStorage.setItem('lang', 'es');
    }

    const currentLang = localStorage.getItem('lang');
    setLanguage(currentLang);

    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const newLang = html.getAttribute('lang') === 'es' ? 'en' : 'es';
            setLanguage(newLang);
            localStorage.setItem('lang', newLang);
        });
    }

    function setLanguage(lang) {
        html.setAttribute('lang', lang);

        // Update Toggle Text
        if (langToggle) {
            langToggle.textContent = lang === 'es' ? 'EN' : 'ES'; // Show the option to switch TO
        }

        // Toggle visibility
        document.querySelectorAll('[data-lang]').forEach(el => {
            if (el.getAttribute('data-lang') === lang) {
                el.classList.remove('hidden');
                el.classList.add('block'); // Or inline-block/flex depending on element, but block is safe for most text containers
                // Clean up animation classes if needed to re-trigger
                if (el.classList.contains('animate-on-scroll')) {
                    el.classList.remove('opacity-0', 'translate-y-4');
                    el.classList.add('opacity-100', 'translate-y-0');
                }
            } else {
                el.classList.add('hidden');
                el.classList.remove('block');
            }
        });

        // Specific fix for flex containers if needed, or we rely on parent containers having translated content
    }
});
