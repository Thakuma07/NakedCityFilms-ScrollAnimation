gsap.registerPlugin(ScrollTrigger, Flip);

/* ----------------------------- */
/* LENIS SETUP */
/* ----------------------------- */
const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* ----------------------------- */
/* NAVBAR ANIMATIONS */
/* ----------------------------- */
const initNavbarAnimations = () => {
    const navbarBg = document.querySelector(".navbar-background");
    const navbarItems = document.querySelector(".navbar-items");
    const navbarLinks = document.querySelectorAll(".navbar-links");
    const navbarLogo = document.querySelector(".navbar-logo");

    const isDesktop = window.innerWidth >= 720;

    if (!isDesktop) {
        navbarLogo.classList.add("navbar-logo-pinned");
        gsap.set(navbarLogo, { width: 250 });
        gsap.set([navbarBg, navbarItems], {
            width: "100%",
            height: "100vh",
        });
        return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const initialWidth = navbarBg.offsetWidth;
    const initialHeight = navbarBg.offsetHeight;

    const initialLinksWidths = Array.from(navbarLinks).map(
        (link) => link.offsetWidth
    );

    const state = Flip.getState(navbarLogo);

    navbarLogo.classList.add("navbar-logo-pinned");
    gsap.set(navbarLogo, { width: 250 });

    const flip = Flip.from(state, {
        duration: 1,
        ease: "none",
        paused: true,
    });

    ScrollTrigger.create({
        trigger: ".navbar-backdrop",
        start: "top top",
        end: `+=${viewportHeight}px`,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;

            gsap.set([navbarBg, navbarItems], {
                width: gsap.utils.interpolate(
                    initialWidth,
                    viewportWidth,
                    progress
                ),
                height: gsap.utils.interpolate(
                    initialHeight,
                    viewportHeight,
                    progress
                ),
            });

            navbarLinks.forEach((link, i) => {
                gsap.set(link, {
                    width: gsap.utils.interpolate(
                        link.offsetWidth,
                        initialLinksWidths[i],
                        progress
                    ),
                });
            });

            flip.progress(progress);
        },
    });

    // Marquee disappearing animation
    const scrollMarquee = document.querySelector(".scroll-marquee");

    ScrollTrigger.create({
        trigger: ".navbar-backdrop",
        start: "top top",
        end: `+=${viewportHeight}px`,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(scrollMarquee, {
                opacity: 1 - (progress * 2),
            });
        },
    });
};

/* ----------------------------- */
/* TEXT ANIMATIONS */
/* ----------------------------- */
const initTextAnimations = () => {
    // Inject CSS for custom property animation on pseudo-elements
    const style = document.createElement('style');
    style.textContent = `
        .highlight::before {
            transform: scaleX(var(--gray-scale, 0));
        }
        .highlight::after {
            transform: scaleX(var(--blue-scale, 0));
        }
    `;
    document.head.appendChild(style);

    // Animate highlight boxes (3-step swipe reveal: gray -> blue -> text)
    const highlights = document.querySelectorAll('.highlight');

    highlights.forEach((highlight) => {
        // Set initial CSS custom properties
        highlight.style.setProperty('--gray-scale', 0);
        highlight.style.setProperty('--blue-scale', 0);

        ScrollTrigger.create({
            trigger: highlight,
            start: 'top 85%',
            end: 'top 35%',
            scrub: 0.5,
            onUpdate: (self) => {
                const progress = self.progress;

                // Phase 1: Gray swipe (0% to 40%)
                let grayProgress = 0;
                if (progress <= 0.4) {
                    grayProgress = progress / 0.4;
                } else {
                    grayProgress = 1;
                }

                // Phase 2: Blue swipe (30% to 70%)
                let blueProgress = 0;
                if (progress > 0.3 && progress <= 0.7) {
                    blueProgress = (progress - 0.3) / 0.4;
                } else if (progress > 0.7) {
                    blueProgress = 1;
                }

                // Phase 3: Text reveal (60% to 100%)
                let textOpacity = 0;
                if (progress > 0.6) {
                    textOpacity = (progress - 0.6) / 0.4;
                }

                // Apply to element
                highlight.style.setProperty('--gray-scale', grayProgress);
                highlight.style.setProperty('--blue-scale', blueProgress);
                highlight.style.color = textOpacity > 0.5 ? 'var(--base-100)' : 'transparent';
            },
        });
    });

    // Animate tagline
    const tagline = document.querySelector('.hero-tagline p');
    if (tagline) {
        gsap.set(tagline, { opacity: 0, y: 20 });

        ScrollTrigger.create({
            trigger: tagline,
            start: 'top 90%',
            end: 'top 70%',
            scrub: 1,
            onUpdate: (self) => {
                gsap.to(tagline, {
                    opacity: self.progress,
                    y: 20 - (self.progress * 20),
                    duration: 0.1,
                });
            },
        });
    }
};

/* ----------------------------- */
/* INIT + RESIZE */
/* ----------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    initNavbarAnimations();
    initTextAnimations();

    let timer;

    window.addEventListener("resize", () => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            ScrollTrigger.getAll().forEach((t) => t.kill());

            const navbarBg = document.querySelector(".navbar-background");
            const navbarItems = document.querySelector(".navbar-items");
            const navbarLinks = document.querySelectorAll(".navbar-links");
            const navbarLogo = document.querySelector(".navbar-logo");

            gsap.set(
                [navbarBg, navbarItems, navbarLogo, ...navbarLinks],
                { clearProps: "all" }
            );

            navbarLogo.classList.remove("navbar-logo-pinned");

            initNavbarAnimations();
            initTextAnimations();
        }, 250);
    });
});
