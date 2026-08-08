// Smooth Scroll Frame Sequence Animation Engine
(function () {
  'use strict';

  const TOTAL_FRAMES = 300;
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');
  
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderProgress = document.getElementById('loader-progress');
  const loaderText = document.getElementById('loader-text');

  const images = [];
  let loadedCount = 0;
  
  // Interpolation variables
  let currentFrame = 0;
  let targetFrame = 0;
  const lerpFactor = 0.12; // Smooth dampening factor

  // Generate frame file path
  function getFramePath(index) {
    const frameNumber = String(index).padStart(3, '0');
    return `frames/ezgif-frame-${frameNumber}.jpg`;
  }

  // Preload all 300 frames into memory
  function preloadImages() {
    return new Promise((resolve) => {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFramePath(i);

        img.onload = () => {
          loadedCount++;
          updateLoaderProgress(loadedCount);
          if (loadedCount === TOTAL_FRAMES) resolve();
        };

        img.onerror = () => {
          loadedCount++;
          updateLoaderProgress(loadedCount);
          if (loadedCount === TOTAL_FRAMES) resolve();
        };

        images.push(img);
      }
    });
  }

  // Update loading progress UI
  function updateLoaderProgress(count) {
    const percent = Math.floor((count / TOTAL_FRAMES) * 100);
    if (loaderProgress) {
      loaderProgress.style.width = `${percent}%`;
    }
    if (loaderText) {
      loaderText.textContent = `Loading ${percent}%`;
    }
  }

  // Canvas resize for High DPI / Retina crispness
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    renderFrame(Math.round(currentFrame));
  }

  // Calculate target frame from scroll position
  function updateTargetFrame() {
    const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (scrollHeight <= 0) {
      targetFrame = 0;
      return;
    }

    const scrollFraction = Math.max(0, Math.min(1, scrollTop / scrollHeight));
    targetFrame = scrollFraction * (TOTAL_FRAMES - 1);
  }

  // Draw current frame on canvas centered with cover aspect scale
  function renderFrame(index) {
    const imgIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    const img = images[imgIndex];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const containerRatio = width / height;

    let drawWidth, drawHeight;

    if (containerRatio > imgRatio) {
      drawWidth = width;
      drawHeight = width / imgRatio;
    } else {
      drawHeight = height;
      drawWidth = height * imgRatio;
    }

    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  // Continuous animation loop using linear interpolation
  function animationLoop() {
    updateTargetFrame();

    const delta = targetFrame - currentFrame;
    if (Math.abs(delta) > 0.001) {
      currentFrame += delta * lerpFactor;
    } else {
      currentFrame = targetFrame;
    }

    renderFrame(Math.round(currentFrame));
    requestAnimationFrame(animationLoop);
  }

  // Handle contact form submission
  function setupFormHandler() {
    const form = document.getElementById('portfolio-contact-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('.btn-submit');
        if (submitBtn) {
          submitBtn.textContent = 'Application Sent! ✓';
          submitBtn.style.backgroundColor = '#00C853';
          setTimeout(() => {
            submitBtn.innerHTML = 'Submit Application <span class="btn-icon-circle">→</span>';
            submitBtn.style.backgroundColor = '';
            form.reset();
          }, 3000);
        }
      });
    }
  }

  // Motion Graphics 5-Video Portfolio Repository
  const MOTION_GRAPHICS_DATA = [
    { id: '01', video: 'videos/motion_01.mp4', thumbnail: '' },
    { id: '02', video: 'videos/motion_02.mp4', thumbnail: '' },
    { id: '03', video: 'videos/motion_03.mp4', thumbnail: '' },
    { id: '04', video: 'videos/motion_04.mp4', thumbnail: '' },
    { id: '05', video: 'videos/motion_05.mp4', thumbnail: '' }
  ];

  // Short-Form Editing 7-Video Client Portfolio Repository
  const SHORT_FORM_VIDEOS_DATA = [
    { id: '01', video: 'videos/short_01.mp4', thumbnail: '' },
    { id: '02', video: 'videos/short_02.mp4', thumbnail: '' },
    { id: '03', video: 'videos/short_03.mp4', thumbnail: '' },
    { id: '04', video: 'videos/short_04.mp4', thumbnail: '' },
    { id: '05', video: 'videos/short_05.mp4', thumbnail: '' },
    { id: '06', video: 'videos/short_06.mp4', thumbnail: '' },
    { id: '07', video: 'videos/short_07.mp4', thumbnail: '' }
  ];

  // Viewport IntersectionObserver to handle video playback when scrolling
  function setupPortfolioVideoObservers() {
    const videos = document.querySelectorAll('.motion-video, .short-video');
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Browser autoplay safeguard
              });
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    videos.forEach((video) => observer.observe(video));
  }

  // Mobile Hamburger Navigation Handler
  function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('main-nav');
    if (!menuBtn || !navMenu) return;

    function toggleMenu() {
      const isActive = menuBtn.classList.toggle('active');
      navMenu.classList.toggle('active', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    }

    function closeMenu() {
      menuBtn.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', toggleMenu);

    // Auto-close navigation menu when clicking any link
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close when resizing back to desktop width
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // Initialize
  async function init() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', updateTargetFrame, { passive: true });

    setupFormHandler();
    setupPortfolioVideoObservers();
    setupMobileMenu();
    resizeCanvas();
    await preloadImages();

    if (loaderOverlay) {
      loaderOverlay.classList.add('hidden');
    }

    animationLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
