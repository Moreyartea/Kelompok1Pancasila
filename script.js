/**
 * Soft Neubrutalism Slide Deck Presentation Logic (Full 56-Slide Edition)
 * Mata Kuliah: Pendidikan Kewarganegaraan (Kelompok 1)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let currentSlide = 1;

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const currentSlideNumEl = document.getElementById('currentSlideNum');
  const totalSlidesNumEl = document.getElementById('totalSlidesNum');
  const progressBar = document.getElementById('progressBar');
  const slideSelect = document.getElementById('slideSelect');
  const btnFullscreen = document.getElementById('btnFullscreen');

  // Format number with leading zero
  const padZero = (num) => (num < 10 ? `0${num}` : `${num}`);

  // Set total slides number in UI
  if (totalSlidesNumEl) {
    totalSlidesNumEl.textContent = padZero(totalSlides);
  }

  // Navigate to a specific slide
  window.goToSlide = function(index) {
    if (index < 1 || index > totalSlides) return;

    currentSlide = index;

    // Update slides visibility & directional class
    slides.forEach((slide) => {
      const slideNum = parseInt(slide.getAttribute('data-slide'), 10);
      slide.classList.remove('active', 'prev');

      if (slideNum === currentSlide) {
        slide.classList.add('active');
        // Reset scroll position of slide and internal main body to top
        slide.scrollTop = 0;
        const mainBody = slide.querySelector('.slide-main-body');
        if (mainBody) {
          mainBody.scrollTop = 0;
        }
      } else if (slideNum < currentSlide) {
        slide.classList.add('prev');
      }
    });

    // Update Slide Counter
    if (currentSlideNumEl) {
      currentSlideNumEl.textContent = padZero(currentSlide);
    }

    // Update Progress Bar
    if (progressBar) {
      const progressPercent = (currentSlide / totalSlides) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // Update Dropdown Selector
    if (slideSelect) {
      slideSelect.value = String(currentSlide);
    }

    // Update Prev / Next Buttons State
    if (btnPrev) {
      btnPrev.disabled = currentSlide === 1;
    }
    if (btnNext) {
      if (currentSlide === totalSlides) {
        btnNext.innerHTML = `
          <span class="nav-btn-text">Selesai</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      } else {
        btnNext.innerHTML = `
          <span class="nav-btn-text">Berikutnya</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
      }
    }
  };

  // Next / Previous helpers
  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    } else {
      // Gentle 3D tactile pulse on last slide
      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide) {
        activeSlide.animate([
          { transform: 'translate3d(0, 0, 0) scale(1)' },
          { transform: 'translate3d(0, 0, -25px) scale(0.985)' },
          { transform: 'translate3d(0, 0, 0) scale(1)' }
        ], { duration: 220, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' });
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  };

  // Event Listeners for Nav Buttons
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);

  // Dropdown change listener
  if (slideSelect) {
    slideSelect.addEventListener('change', (e) => {
      const target = parseInt(e.target.value, 10);
      goToSlide(target);
    });
  }

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    // If user is focused on an input/select, avoid hijacking unless escape/enter
    if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ': // Spacebar
        e.preventDefault();
        nextSlide();
        break;

      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;

      case 'Home':
        e.preventDefault();
        goToSlide(1);
        break;

      case 'End':
        e.preventDefault();
        goToSlide(totalSlides);
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  });

  // Touch Swipe Support for Tablets & Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const handleGesture = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      nextSlide();
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      prevSlide();
    }
  };

  const stage = document.querySelector('.presentation-stage');
  if (stage) {
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });
  }

  // Fullscreen Handler
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', toggleFullscreen);
  }

  // Initial render on slide 1
  goToSlide(1);
});
