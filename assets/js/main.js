document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon = document.getElementById('close-icon');

    if (mobileMenuBtn && mobileMenu) {
        function toggleMobileMenu() {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);

            if (!isExpanded) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex');
                document.getElementById('navbar').classList.add('bg-white');
                document.getElementById('navbar').classList.remove('bg-white/80', 'backdrop-blur-md');
                hamburgerIcon.classList.add('hidden');
                hamburgerIcon.classList.remove('block');
                closeIcon.classList.remove('hidden');
                closeIcon.classList.add('block');
                document.body.style.overflow = 'hidden';
            } else {
                document.getElementById('navbar').classList.remove('bg-white');
                document.getElementById('navbar').classList.add('bg-white/80', 'backdrop-blur-md');
                mobileMenu.classList.remove('flex');
                mobileMenu.classList.add('hidden');
                hamburgerIcon.classList.remove('hidden');
                hamburgerIcon.classList.add('block');
                closeIcon.classList.add('hidden');
                closeIcon.classList.remove('block');
                document.body.style.overflow = '';
            }
        }

        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        const mobileLinks = mobileMenu.querySelectorAll('a[data-link]');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileMenuBtn.getAttribute('aria-expanded') === 'true') {
                    toggleMobileMenu();
                }
            });
        });
    }

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
});
