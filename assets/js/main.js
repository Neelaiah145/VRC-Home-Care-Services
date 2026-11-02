/**
 * VRC Home Care Services - Interactive & Animation Engine
 * Uses GSAP 3 & ScrollTrigger with vanilla fallbacks
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic'
    });
  }
  initNavbar();
  initHeroSlider();
  initHowStepCards();
  initHowItWorksScrollZoom();
  initScrollAnimations();
  initTestimonialSlider();
  initFaqAccordion();
  initCounters();
  initModalAndForms();
  initBackToTop();
});

/**
 * Autoplay engine for About Us elderly care video
 * Ensures seamless, silent ambient playback without play buttons
 */
function initAboutVideoAutoplay() {
  const video = document.querySelector('.about-main-video');
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  const tryPlay = () => {
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Fallback on first gesture if browser security policies restrict instant auto-execution
        const onFirstGesture = () => {
          video.play().catch(() => {});
          window.removeEventListener('scroll', onFirstGesture);
          window.removeEventListener('click', onFirstGesture);
          window.removeEventListener('touchstart', onFirstGesture);
        };
        window.addEventListener('scroll', onFirstGesture, { passive: true, once: true });
        window.addEventListener('click', onFirstGesture, { passive: true, once: true });
        window.addEventListener('touchstart', onFirstGesture, { passive: true, once: true });
      });
    }
  };

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener('loadeddata', tryPlay, { once: true });
  }
}

function initHowStepCards() {
  const section = document.querySelector('#how-it-works');
  if (!section) return;

  const cards = section.querySelectorAll('.work-steps-item, .how-step-card');
  const setActiveCard = (activeCard) => {
    cards.forEach((card) => {
      const isActive = card === activeCard;
      card.classList.toggle('active', isActive);
      card.classList.toggle('is-active', isActive);
      if (isActive) {
        card.setAttribute('aria-current', 'step');
      } else {
        card.removeAttribute('aria-current');
      }
    });
  };

  const initialActiveCard = section.querySelector('.work-steps-item.active, .how-step-card.is-active') || cards[0];
  if (initialActiveCard) {
    setActiveCard(initialActiveCard);
  }

  cards.forEach((card) => {
    card.addEventListener('pointerenter', () => setActiveCard(card));
    card.addEventListener('focusin', () => setActiveCard(card));
    card.addEventListener('click', () => setActiveCard(card));
  });
}

/**
 * How It Works Background Image Handler:
 * Keeps the background image completely fixed and stationary while content scrolls naturally over it.
 * Zero zooming in/out, zero scaling, and zero animation.
 */
function initHowItWorksScrollZoom() {
  const bgImg = document.querySelector('.how-it-works-background-image');
  if (bgImg) {
    bgImg.style.transform = 'none';
  }
}

/* ==========================================================================
   1. Navbar & Mobile Drawer
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Subtle scroll class
  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile drawer toggle
  function toggleMobileMenu(open) {
    const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
    if (isOpen) {
      mobileDrawer.classList.add('open');
      overlay.classList.add('active');
      mobileToggle.classList.add('active');
      header.classList.add('menu-open');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileToggle.setAttribute('aria-label', 'Close Mobile Menu');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer.classList.remove('open');
      overlay.classList.remove('active');
      mobileToggle.classList.remove('active');
      header.classList.remove('menu-open');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-label', 'Open Mobile Menu');
      document.body.style.overflow = '';
    }
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => toggleMobileMenu());
  }

  if (overlay) {
    overlay.addEventListener('click', () => toggleMobileMenu(false));
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMobileMenu(false);
    });
  });

  // Active section indicator on scroll
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -65% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else if (link.getAttribute('href')?.startsWith('#')) {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));
}

/* ==========================================================================
   2. Hero Full-Width Image Slider
   ========================================================================== */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.querySelector('.hero-nav-btn.prev');
  const nextBtn = document.querySelector('.hero-nav-btn.next');
  const sliderContainer = document.querySelector('.hero-section');

  if (!slides.length) return;

  let currentIndex = 0;
  let slideInterval = null;
  const slideDuration = 6000;
  let isTransitioning = false;

  function showSlide(index, direction = 'next') {
    if (isTransitioning || (index === currentIndex && slides[currentIndex].classList.contains('active'))) return;
    isTransitioning = true;

    const currentSlide = slides[currentIndex];
    const targetSlide = slides[index];

    // Update dots (0: elongated pill —, 1: •, 2: •)
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    if (window.gsap) {
      // Outgoing slide animation
      gsap.to(currentSlide, {
        opacity: 0,
        x: direction === 'next' ? -35 : 35,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          currentSlide.classList.remove('active');
          gsap.set(currentSlide, { x: 0 });
        }
      });

      // Incoming slide animation
      targetSlide.classList.add('active');
      gsap.fromTo(targetSlide,
        { opacity: 0, x: direction === 'next' ? 35 : -35 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: 'power2.out',
          onComplete: () => {
            isTransitioning = false;
          }
        }
      );
    } else {
      currentSlide.classList.remove('active');
      targetSlide.classList.add('active');
      isTransitioning = false;
    }

    currentIndex = index;
  }

  function animateHeroContentOnLoad() {
    if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const badge = document.querySelector('.hero-tagline-pills');
    const title = document.querySelector('.hero-title');
    const desc = document.querySelector('.hero-description');
    const buttons = document.querySelectorAll('.hero-buttons .btn');
    const pagination = document.querySelector('.hero-pagination');
    const paginationDots = document.querySelectorAll('.hero-pagination .hero-dot');
    const note = document.querySelector('.hero-note-container');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Tagline pills enter subtly
    if (badge) {
      tl.fromTo(badge,
        { opacity: 0, y: -14, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'back.out(1.5)' }
      );
    }
    // 2. Main hero heading enters smoothly upward
    if (title) {
      tl.fromTo(title,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.75 },
        badge ? '-=0.35' : 0
      );
    }
    // 3. Description paragraph enters smoothly
    if (desc) {
      tl.fromTo(desc,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.65 },
        '-=0.4'
      );
    }
    // 4. CTA Buttons enter smoothly with subtle stagger
    if (buttons.length) {
      tl.fromTo(buttons,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 },
        '-=0.35'
      );
    }
    // 5. Pagination dots
    if (paginationDots.length) {
      tl.fromTo(paginationDots,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        '-=0.25'
      );
    } else if (pagination) {
      tl.fromTo(pagination,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.25'
      );
    }
    // 6. Right handwritten note entrance
    if (note) {
      tl.fromTo(note,
        { opacity: 0, rotate: -10, scale: 0.92, y: 14 },
        { opacity: 1, rotate: -6, scale: 1, y: 0, duration: 0.75, ease: 'back.out(1.4)' },
        '-=0.3'
      );
    }
  }

  // Initial Entrance Animation
  animateHeroContentOnLoad();

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex, 'next');
  }

  function prevSlide() {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex, 'prev');
  }

  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, slideDuration);
  }

  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx, idx > currentIndex ? 'next' : 'prev');
      startAutoplay();
    });
  });

  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoplay);
    sliderContainer.addEventListener('mouseleave', startAutoplay);
  }

  // Mobile touch swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;

  sliderContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 40) {
      nextSlide();
      startAutoplay();
    } else if (touchEndX > touchStartX + 40) {
      prevSlide();
      startAutoplay();
    }
  }, { passive: true });

  startAutoplay();
}

/* ==========================================================================
   3. Scroll-Triggered Entrance Animations (GSAP + ScrollTrigger)
   ========================================================================== */
function initScrollAnimations() {
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !window.gsap ||
    !window.ScrollTrigger
  ) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  let refreshTimer;
  const scheduleScrollRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 100);
  };

  window.addEventListener('load', scheduleScrollRefresh, { once: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleScrollRefresh);
  }
  document.querySelectorAll('img').forEach((image) => {
    if (!image.complete) {
      image.addEventListener('load', scheduleScrollRefresh, { once: true });
    }
  });

  function animateOnEnter(trigger, animate, start = 'top 78%') {
    if (!trigger) return;

    ScrollTrigger.create({
      trigger,
      start,
      once: true,
      onEnter: animate
    });
  }

  // --------------------------------------------------------------------------
  // Additional Generic Scroll Animations for fade/slide effects
  // --------------------------------------------------------------------------
  // Elements with data-animation attribute will animate on scroll.
  const genericElements = document.querySelectorAll('[data-animation]');
  genericElements.forEach(el => {
    const animType = el.getAttribute('data-animation');
    const animConfig = {
      fadeIn: { opacity: 0, y: 20 },
      fadeUp: { opacity: 0, y: 30 },
      slideLeft: { opacity: 0, x: -30 },
      slideRight: { opacity: 0, x: 30 }
    }[animType] || { opacity: 0 };
    animateOnEnter(el, () => {
      gsap.fromTo(el, animConfig, { opacity: 1, x: animConfig.x || 0, y: animConfig.y || 0, duration: 0.6, ease: 'power3.out' });
    }, 'top 80%');
  });

  // --- Unified Section Heading Animation Function ---
  // Ensures every section heading and badge animates with identical smooth choreography
  function animateSectionHeader(headerContainer, tl) {
    if (!headerContainer) return;
    const badge = headerContainer.querySelector('.section-pill-badge');
    const title = headerContainer.querySelector('.about-title, .section-title, .why-title, .how-title');
    const desc = headerContainer.querySelector('.about-description, .section-desc, .how-it-works-copy p');

    if (badge) {
      tl.fromTo(badge,
        { y: -18, opacity: 0, scale: 0.92 },
        { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(1.7)', immediateRender: false }
      );
    }
    if (title) {
      tl.fromTo(title,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', immediateRender: false },
        badge ? '-=0.35' : 0
      );
    }
    if (desc) {
      tl.fromTo(desc,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', immediateRender: false },
        '-=0.35'
      );
    }
  }

  // --- About Us Section Animations ---
  const aboutSection = document.querySelector('#about');
  if (aboutSection) {
    const textCol = aboutSection.querySelector('.about-text-content');
    const aboutImgCards = aboutSection.querySelectorAll('.about-img-card');
    const decorCircle = aboutSection.querySelector('.about-decor-circle');
    const decorDot = aboutSection.querySelector('.about-decor-dot');
    const decorBadge = aboutSection.querySelector('.about-decor-badge');
    const highlightCards = aboutSection.querySelectorAll('.about-highlight-card');
    const statItems = aboutSection.querySelectorAll('.stat-item');
    const aboutButtons = textCol ? textCol.querySelectorAll('.about-action-buttons .btn') : [];

    animateOnEnter(aboutSection, () => {
      const tlAbout = gsap.timeline({ defaults: { ease: 'power3.out' } });

      animateSectionHeader(textCol, tlAbout);

      tlAbout
        .fromTo(highlightCards,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, immediateRender: false }, '-=0.25')
        .fromTo(aboutImgCards,
          { y: 35, scale: 0.95, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.8, stagger: 0.18, ease: 'power3.out', immediateRender: false }, 0.2)
        .fromTo([decorCircle, decorDot],
          { scale: 0.7, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.7, stagger: 0.1, immediateRender: false }, '-=0.5')
        .fromTo(decorBadge,
          { y: 25, scale: 0.85, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.6, immediateRender: false }, '-=0.4')
        .fromTo(statItems,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, immediateRender: false }, '-=0.4')
        .fromTo(aboutButtons,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, immediateRender: false }, '-=0.2');
    });
  }

  // --- Services Section Animations (Prompt & Clean) ---
  const servicesSection = document.querySelector('#services');
  if (servicesSection) {
    const cards = servicesSection.querySelectorAll('.service-card');
    const header = servicesSection.querySelector('.center-header');

    animateOnEnter(servicesSection, () => {
      const tlServices = gsap.timeline({ defaults: { ease: 'power2.out' } });
      animateSectionHeader(header, tlServices);
    }, 'top 88%');

    const grid = servicesSection.querySelector('.services-grid');
    if (grid) {
      animateOnEnter(grid, () => {
        gsap.fromTo(cards,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            stagger: 0.06,
            ease: 'power2.out',
            immediateRender: false,
            onComplete: () => {
              gsap.set(cards, { clearProps: 'transform' });
            }
          });
      }, 'top 92%');
    }
  }

  // --- Why Choose Us Modern 3-Column Trio Animation ---
  const whySection = document.querySelector('#why-choose-us, .dual-feature-section');
  if (whySection) {
    const whyHeader = whySection.querySelector('.center-header');
    const leftBoxes = whySection.querySelectorAll('.why-trio-left .why-feature-box');
    const centerFrame = whySection.querySelector('.why-center-frame');
    const rightBoxes = whySection.querySelectorAll('.why-trio-right .why-feature-box');
    const bottomBtn = whySection.querySelector('.why-bottom-action .btn');

    animateOnEnter(whySection, () => {
      const tlWhy = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (whyHeader) animateSectionHeader(whyHeader, tlWhy);

      if (leftBoxes.length) {
        tlWhy.fromTo(leftBoxes,
          { x: -24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out', immediateRender: false }, '-=0.2');
      }

      if (centerFrame) {
        tlWhy.fromTo(centerFrame,
          { scale: 0.94, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out', immediateRender: false }, '-=0.35');
      }

      if (rightBoxes.length) {
        tlWhy.fromTo(rightBoxes,
          { x: 24, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out', immediateRender: false }, '-=0.35');
      }

      if (bottomBtn) {
        tlWhy.fromTo(bottomBtn,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out', immediateRender: false }, '-=0.2');
      }

      tlWhy.eventCallback('onComplete', () => {
        if (centerFrame) gsap.set(centerFrame, { clearProps: 'transform' });
      });
    }, 'top 85%');

    // Interactive scroll-driven horizontal slide animation on Why Choose Us center image
    // Scrolling down -> moves naturally towards the right; scrolling up -> moves back towards the left
    const whyPhoto = whySection.querySelector('.why-center-photo');
    if (whyPhoto && window.ScrollTrigger && window.gsap) {
      gsap.fromTo(whyPhoto,
        { x: -30 },
        {
          x: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: whySection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
            invalidateOnRefresh: true
          }
        }
      );
    }
  }

  // --- Full-width How It Works section with parallax background ---
  const howSection = document.querySelector('#how-it-works');
  if (howSection) {
    const background = howSection.querySelector('.how-it-works-background-image');
    const curvedWave = howSection.querySelector('.how-curved-reveal-wave');
    const heading = howSection.querySelector('.section-title-center, .how-it-works-heading');
    const headingCopy = howSection.querySelector('.section-title-center, .how-it-works-copy');
    const cards = howSection.querySelectorAll('.work-steps-item, .how-step-card');
    const contact = howSection.querySelector('.section-footer-text, .how-it-works-contact');

    animateOnEnter(howSection, () => {
      const tlHow = gsap.timeline({ defaults: { ease: 'power3.out' } });

      animateSectionHeader(headingCopy, tlHow);

      tlHow
        .fromTo(cards,
          { y: 45, scale: 0.94, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.65, stagger: 0.1, immediateRender: false }, '-=0.25')
        .fromTo(contact,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, immediateRender: false }, '-=0.2');

      tlHow.eventCallback('onComplete', () => {
        gsap.set(cards, { clearProps: 'transform' });
      });
    }, 'top 82%');

    // Note: Continuous background zoom is handled by initHowItWorksScrollZoom() for instant bidirectional scroll responsiveness

    // Bottom-to-top curved color reveal wave linked to scroll
    if (curvedWave) {
      gsap.fromTo(curvedWave,
        { y: 130, opacity: 0.35 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: howSection,
            start: 'top bottom',
            end: 'center center',
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    }

    // Layered parallax on heading moving slightly slower than background
    if (headingCopy) {
      gsap.to(headingCopy, {
        y: -24,
        ease: 'none',
        scrollTrigger: {
          trigger: howSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
    }
  }

  // --- Testimonials Section Animation ---
  const testimonialsSection = document.querySelector('.testimonials-section');
  if (testimonialsSection) {
    const tHeader = testimonialsSection.querySelector('.center-header');
    const tCards = testimonialsSection.querySelectorAll('.testimonial-full-card');

    animateOnEnter(testimonialsSection, () => {
      const tlT = gsap.timeline({ defaults: { ease: 'power3.out' } });
      animateSectionHeader(tHeader, tlT);
      if (tCards.length) {
        tlT.fromTo(tCards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.15, immediateRender: false }, '-=0.4');
      }
    });
  }

  // --- FAQs Section Animation ---
  const faqsSection = document.querySelector('.faqs-section');
  if (faqsSection) {
    const fHeader = faqsSection.querySelector('.center-header');
    const fItems = faqsSection.querySelectorAll('.accordion-item');

    animateOnEnter(faqsSection, () => {
      const tlF = gsap.timeline({ defaults: { ease: 'power3.out' } });
      animateSectionHeader(fHeader, tlF);
      if (fItems.length) {
        tlF.fromTo(fItems,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, immediateRender: false }, '-=0.4');
      }
    });
  }

  // --- Footer Entrance Animation ---
  const footer = document.querySelector('.site-footer');
  if (footer) {
    animateOnEnter(footer, () => {
      const cols = footer.querySelectorAll('.footer-top-grid > div');
      const bottomBar = footer.querySelector('.footer-bottom-bar');
      const tlFooter = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tlFooter
        .fromTo(cols,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, immediateRender: false });

      if (bottomBar) {
        tlFooter.fromTo(bottomBar,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, immediateRender: false }, '-=0.2');
      }
    }, 'top 85%');
  }
}

/* ==========================================================================
   4. Animated Stat Counters
   ========================================================================== */
function initCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));

  function animateCounter(el) {
    const text = el.innerText.trim();
    const hasPlus = text.includes('+');
    const hasSlash = text.includes('/');

    if (hasSlash) {
      el.style.transform = 'scale(1.15)';
      setTimeout(() => {
        el.style.transition = 'transform 0.4s ease';
        el.style.transform = 'scale(1)';
      }, 120);
      return;
    }

    const targetNum = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (isNaN(targetNum)) return;

    let current = 0;
    const duration = 1600;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      current = Math.floor(easeProgress * targetNum);

      el.innerText = `${current}${hasPlus ? '+' : ''}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        el.innerText = `${targetNum}${hasPlus ? '+' : ''}`;
      }
    }

    requestAnimationFrame(updateCounter);
  }
}

/* ==========================================================================
   5. Testimonials Slider
   ========================================================================== */
function initTestimonialSlider() {
  const wrapper = document.querySelector('.testimonial-carousel-wrapper');
  if (!wrapper) return;

  const track = wrapper.querySelector('.testimonial-carousel-track');
  const slides = wrapper.querySelectorAll('.testimonial-card-slide');
  const prevBtn = wrapper.querySelector('.t-nav-arrow.t-prev');
  const nextBtn = wrapper.querySelector('.t-nav-arrow.t-next');
  const dotsContainer = document.querySelector('.testimonial-carousel-dots');

  if (!track || !slides.length) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const autoPlayInterval = 2700; // 2.7s interval (2–3 seconds as requested)

  function getCardsPerView() {
    const width = window.innerWidth;
    if (width > 992) return 3; // 3 on desktop
    if (width > 640) return 2; // 2 on tablet
    return 1;                  // 1 on mobile
  }

  function getMaxIndex() {
    const perView = getCardsPerView();
    return Math.max(0, slides.length - perView);
  }

  function renderDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();
    const count = maxIdx + 1;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = `t-dot-btn ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.t-dot-btn');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function updateSlidePosition() {
    const perView = getCardsPerView();
    const slideWidthPercent = 100 / perView;
    const gapOffset = (perView > 1) ? (currentIndex * (24 / perView)) : 0;
    const translateX = -(currentIndex * slideWidthPercent);
    track.style.transform = `translateX(calc(${translateX}% - ${gapOffset}px))`;
    updateDots();
  }

  function goToSlide(idx) {
    const maxIdx = getMaxIndex();
    if (idx > maxIdx) {
      currentIndex = 0; // Wrap around smoothly
    } else if (idx < 0) {
      currentIndex = maxIdx;
    } else {
      currentIndex = idx;
    }
    updateSlidePosition();
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      goToSlide(0);
    } else {
      goToSlide(currentIndex + 1);
    }
  }

  function prevSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      goToSlide(maxIdx);
    } else {
      goToSlide(currentIndex - 1);
    }
  }

  // Click Listeners
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  // Hover Pause & Resume
  wrapper.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  wrapper.addEventListener('mouseleave', () => startAutoplay());

  // Touch / Swipe Navigation for Mobile & Tablet
  let touchStartX = 0;
  let touchEndX = 0;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 45;
    if (touchEndX < touchStartX - threshold) {
      nextSlide(); // Swiped left -> next
      resetAutoplay();
    } else if (touchEndX > touchStartX + threshold) {
      prevSlide(); // Swiped right -> prev
      resetAutoplay();
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, autoPlayInterval);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  window.addEventListener('resize', () => {
    const maxIdx = getMaxIndex();
    if (currentIndex > maxIdx) currentIndex = maxIdx;
    renderDots();
    updateSlidePosition();
  }, { passive: true });

  renderDots();
  updateSlidePosition();
  startAutoplay();
}

/* ==========================================================================
   6. FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      accordionItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.accordion-content');
          if (otherContent) otherContent.style.maxHeight = null;
          otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });

      if (!isActive) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 24 + 'px';
        header.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('active');
        content.style.maxHeight = null;
        header.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Open first item by default
  if (accordionItems.length > 0) {
    const firstItem = accordionItems[0];
    const firstHeader = firstItem.querySelector('.accordion-header');
    const firstContent = firstItem.querySelector('.accordion-content');
    firstItem.classList.add('active');
    firstContent.style.maxHeight = firstContent.scrollHeight + 24 + 'px';
    firstHeader.setAttribute('aria-expanded', 'true');
  }
}

/* ==========================================================================
   7. Booking Modal & Interactive Forms
   ========================================================================== */
function initModalAndForms() {
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const modalClose = document.querySelector('.modal-close-btn');
  const bookingForm = document.querySelector('#bookingForm');
  const toast = document.querySelector('.toast-notice');

  const modalTriggers = document.querySelectorAll('[data-open-modal]');
  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service');
      if (serviceName && bookingForm) {
        const select = bookingForm.querySelector('select[name="service"]');
        if (select) select.value = serviceName;
      }
      openModal();
    });
  });

  function openModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Booking Request...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        bookingForm.reset();
        closeModal();
        showToast('Thank you! Your care request has been received. Our team will contact you shortly.');
      }, 1000);
    });
  }

  function showToast(message) {
    if (!toast) return;
    const textSpan = toast.querySelector('.toast-message') || toast;
    textSpan.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
}

/* ==========================================================================
   8. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
