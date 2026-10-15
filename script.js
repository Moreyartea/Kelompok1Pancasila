/**
 * Neubrutalism Slide Deck Presentation Logic (Mobile-Optimized & Highly Interactive)
 * Mata Kuliah: Pendidikan Kewarganegaraan (Kelompok 1)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // CORE ELEMENTS
  // ==========================================================================
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
  const slideIndicator = document.getElementById('slideIndicator');

  // Interactive Header & Footer buttons
  const btnSlideDrawer = document.getElementById('btnSlideDrawer');
  const btnQuiz = document.getElementById('btnQuiz');
  const btnGlossary = document.getElementById('btnGlossary');
  const btnNotes = document.getElementById('btnNotes');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const soundIconOn = document.getElementById('soundIconOn');
  const soundIconOff = document.getElementById('soundIconOff');

  // Mobile quick buttons
  const mobileBtnQuiz = document.getElementById('mobileBtnQuiz');
  const mobileBtnNotes = document.getElementById('mobileBtnNotes');
  const mobileBtnGlossary = document.getElementById('mobileBtnGlossary');

  // Edge tap buttons
  const edgeTapPrev = document.getElementById('edgeTapPrev');
  const edgeTapNext = document.getElementById('edgeTapNext');

  // Modals
  const slideDrawerModal = document.getElementById('slideDrawerModal');
  const quizModal = document.getElementById('quizModal');
  const glossaryModal = document.getElementById('glossaryModal');
  const notesModal = document.getElementById('notesModal');
  const neuToast = document.getElementById('neuToast');

  // Modal close buttons
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const closeQuizBtn = document.getElementById('closeQuizBtn');
  const closeGlossaryBtn = document.getElementById('closeGlossaryBtn');
  const closeNotesBtn = document.getElementById('closeNotesBtn');

  // ==========================================================================
  // AUDIO SYNTHESIZER (Pure Web Audio API - Zero Asset Dependency)
  // ==========================================================================
  let soundEnabled = localStorage.getItem('pkn_sound_enabled') !== 'false';
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function updateSoundUI() {
    if (soundIconOn && soundIconOff) {
      if (soundEnabled) {
        soundIconOn.style.display = 'block';
        soundIconOff.style.display = 'none';
        btnSoundToggle?.setAttribute('title', 'Efek Suara: Aktif (Klik untuk Matikan)');
      } else {
        soundIconOn.style.display = 'none';
        soundIconOff.style.display = 'block';
        btnSoundToggle?.setAttribute('title', 'Efek Suara: Senyap (Klik untuk Aktifkan)');
      }
    }
  }
  updateSoundUI();

  function playSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'click') {
        // Crisp tactile mechanical click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'pop') {
        // Soft bubble pop for drawers/modals
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.07);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.075);
      } else if (type === 'success') {
        // Cheerful chord chime for quiz success
        const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
        freqs.forEach((freq, idx) => {
          const chordOsc = audioCtx.createOscillator();
          const chordGain = audioCtx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(audioCtx.destination);

          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(freq, now + idx * 0.05);
          chordGain.gain.setValueAtTime(0.12, now + idx * 0.05);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
          chordOsc.start(now + idx * 0.05);
          chordOsc.stop(now + idx * 0.05 + 0.28);
        });
      } else if (type === 'error') {
        // Low soft thud
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.13);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Haptic Feedback for Mobile Devices
  function triggerHaptic(duration = 20) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(text, duration = 2000) {
    if (!neuToast) return;
    neuToast.textContent = text;
    neuToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      neuToast.classList.remove('show');
    }, duration);
  }

  // Format number with leading zero
  const padZero = (num) => (num < 10 ? `0${num}` : `${num}`);

  // Set total slides in UI
  if (totalSlidesNumEl) {
    totalSlidesNumEl.textContent = padZero(totalSlides);
  }

  // ==========================================================================
  // SLIDE NAVIGATION ENGINE
  // ==========================================================================
  window.goToSlide = function(index, triggerSound = true) {
    if (index < 1 || index > totalSlides) return;

    const prevIndex = currentSlide;
    currentSlide = index;

    if (triggerSound && prevIndex !== currentSlide) {
      playSound('click');
      triggerHaptic(20);
    }

    // Update slides visibility & directional class
    slides.forEach((slide) => {
      const slideNum = parseInt(slide.getAttribute('data-slide'), 10);
      slide.classList.remove('active', 'prev');
      slide.style.transform = ''; // reset any drag transform

      if (slideNum === currentSlide) {
        slide.classList.add('active');
        // Reset scroll position to top
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      } else {
        btnNext.innerHTML = `
          <span class="nav-btn-text">Berikutnya</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
      }
    }

    // Update Slide Drawer Active Item
    updateDrawerActiveItem();

    // Update Speaker Notes if Notes Modal is currently open
    if (notesModal && notesModal.classList.contains('open')) {
      renderSpeakerNotes();
    }
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
    } else {
      // Tactile gentle bounce on final slide
      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide) {
        activeSlide.animate([
          { transform: 'translate3d(0, 0, 0) scale(1)' },
          { transform: 'translate3d(0, 0, -25px) scale(0.985)' },
          { transform: 'translate3d(0, 0, 0) scale(1)' }
        ], { duration: 220, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' });
      }
      showToast('🎉 Ini adalah slide penutup');
      triggerHaptic(40);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    } else {
      showToast('📌 Ini adalah slide pertama');
    }
  };

  // Event Listeners for Nav Buttons
  if (btnNext) btnNext.addEventListener('click', nextSlide);
  if (btnPrev) btnPrev.addEventListener('click', prevSlide);

  // Edge Tap Hotspots
  if (edgeTapPrev) edgeTapPrev.addEventListener('click', prevSlide);
  if (edgeTapNext) edgeTapNext.addEventListener('click', nextSlide);

  // Dropdown change listener
  if (slideSelect) {
    slideSelect.addEventListener('change', (e) => {
      const target = parseInt(e.target.value, 10);
      goToSlide(target);
    });
  }

  // Sound FX toggle
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('pkn_sound_enabled', String(soundEnabled));
      updateSoundUI();
      if (soundEnabled) {
        playSound('pop');
        showToast('🔊 Efek suara diaktifkan');
      } else {
        showToast('🔇 Mode senyap');
      }
    });
  }

  // ==========================================================================
  // SMART DIRECTIONAL TOUCH & SWIPE ENGINE FOR MOBILE
  // ==========================================================================
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  const stage = document.querySelector('.presentation-stage');
  const slideFrame = document.getElementById('slideFrame');

  if (stage) {
    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      isSwiping = true;
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (!isSwiping || e.touches.length !== 1) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;

      // If user is clearly scrolling vertically, don't interfere
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }

      // If moving horizontally, apply slight visual resistance drag
      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide && Math.abs(deltaX) > 10) {
        const dragEffect = deltaX * 0.28;
        const rotateEffect = deltaX * 0.02;
        activeSlide.style.transform = `translate3d(${dragEffect}px, 0, 0) rotateY(${rotateEffect}deg)`;
      }
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;

      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const elapsedTime = Date.now() - touchStartTime;

      const activeSlide = document.querySelector('.slide.active');
      if (activeSlide) {
        activeSlide.style.transition = 'transform 0.25s ease';
        activeSlide.style.transform = '';
        setTimeout(() => {
          if (activeSlide) activeSlide.style.transition = '';
        }, 260);
      }

      // Check if horizontal movement dominates vertical movement (prevent accidental trigger on scroll)
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.35;
      const isFastFlick = elapsedTime < 280 && Math.abs(deltaX) > 35;
      const isDistanceReached = Math.abs(deltaX) > 55;

      if (isHorizontal && (isFastFlick || isDistanceReached)) {
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, { passive: true });
  }

  // ==========================================================================
  // SLIDE DRAWER / BOTTOM SHEET SYSTEM
  // ==========================================================================
  const drawerSlidesGrid = document.getElementById('drawerSlidesGrid');
  const drawerSearchInput = document.getElementById('drawerSearchInput');
  const clearDrawerSearch = document.getElementById('clearDrawerSearch');
  const drawerCategories = document.getElementById('drawerCategories');

  // Slide Metadata Extractor
  const slideDataList = [];
  slides.forEach((slide) => {
    const num = parseInt(slide.getAttribute('data-slide'), 10);
    const titleEl = slide.querySelector('.slide-title');
    const rawTitle = titleEl ? titleEl.textContent.trim() : `Slide ${padZero(num)}`;
    const badgeEl = slide.querySelector('.badge-group .neu-badge:first-child');
    const chapter = badgeEl ? badgeEl.textContent.trim() : 'Materi Umum';

    // Map to chapter category key
    let catKey = 'all';
    if (num <= 5) catKey = 'bab1';
    else if (num <= 8) catKey = 'bab2';
    else if (num <= 14) catKey = 'bab3';
    else if (num <= 20) catKey = 'bab4';
    else if (num <= 25) catKey = 'bab5';
    else if (num <= 31) catKey = 'bab6';
    else if (num <= 37) catKey = 'bab7';
    else if (num <= 43) catKey = 'bab8';
    else catKey = 'bab9';

    slideDataList.push({
      num,
      title: rawTitle,
      chapter,
      catKey,
      slideEl: slide
    });
  });

  function renderDrawerSlides(filterText = '', filterCat = 'all') {
    if (!drawerSlidesGrid) return;
    drawerSlidesGrid.innerHTML = '';

    const query = filterText.toLowerCase().trim();

    const filtered = slideDataList.filter((item) => {
      const matchCat = filterCat === 'all' || item.catKey === filterCat;
      const matchText =
        !query ||
        item.num.toString().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.chapter.toLowerCase().includes(query);
      return matchCat && matchText;
    });

    if (filtered.length === 0) {
      drawerSlidesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2.5rem; text-align: center;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔍</div>
          <strong style="font-family: var(--font-heading); font-size: 1.1rem;">Tidak ada slide yang cocok</strong>
          <p style="font-size: 0.9rem; color: #555; margin-top: 4px;">Coba gunakan kata kunci lain atau pilih kategori Semua.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = `drawer-slide-item ${item.num === currentSlide ? 'active-slide-item' : ''}`;
      card.setAttribute('data-target-slide', item.num);
      card.innerHTML = `
        <div class="drawer-slide-num">${padZero(item.num)}</div>
        <div class="drawer-slide-info">
          <span class="drawer-slide-badge">${item.chapter}</span>
          <span class="drawer-slide-title">${item.title}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        goToSlide(item.num);
        closeModal(slideDrawerModal);
        showToast(`📍 Berpindah ke Slide ${padZero(item.num)}`);
      });

      drawerSlidesGrid.appendChild(card);
    });
  }

  function updateDrawerActiveItem() {
    if (!drawerSlidesGrid) return;
    const items = drawerSlidesGrid.querySelectorAll('.drawer-slide-item');
    items.forEach((item) => {
      const num = parseInt(item.getAttribute('data-target-slide'), 10);
      if (num === currentSlide) {
        item.classList.add('active-slide-item');
      } else {
        item.classList.remove('active-slide-item');
      }
    });
  }

  // Drawer Search & Filter Listeners
  if (drawerSearchInput) {
    drawerSearchInput.addEventListener('input', (e) => {
      const activePill = drawerCategories?.querySelector('.cat-pill.active');
      const activeCat = activePill ? activePill.getAttribute('data-cat') : 'all';
      renderDrawerSlides(e.target.value, activeCat);
      if (clearDrawerSearch) {
        clearDrawerSearch.style.display = e.target.value ? 'block' : 'none';
      }
    });
  }

  if (clearDrawerSearch) {
    clearDrawerSearch.addEventListener('click', () => {
      if (drawerSearchInput) {
        drawerSearchInput.value = '';
        clearDrawerSearch.style.display = 'none';
        const activePill = drawerCategories?.querySelector('.cat-pill.active');
        const activeCat = activePill ? activePill.getAttribute('data-cat') : 'all';
        renderDrawerSlides('', activeCat);
        drawerSearchInput.focus();
      }
    });
  }

  if (drawerCategories) {
    const pills = drawerCategories.querySelectorAll('.cat-pill');
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-cat');
        const query = drawerSearchInput ? drawerSearchInput.value : '';
        renderDrawerSlides(query, cat);
        playSound('click');
      });
    });
  }

  // Open / Close Modal Helpers
  function openModal(modal) {
    if (!modal) return;
    initAudio();
    playSound('pop');
    triggerHaptic(25);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    // Scroll active item into view if opening slide drawer
    if (modal === slideDrawerModal) {
      renderDrawerSlides(drawerSearchInput?.value || '', 'all');
      setTimeout(() => {
        const activeItem = drawerSlidesGrid?.querySelector('.active-slide-item');
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    playSound('click');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Close modals on overlay backdrop click
  [slideDrawerModal, quizModal, glossaryModal, notesModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Close button triggers
  closeDrawerBtn?.addEventListener('click', () => closeModal(slideDrawerModal));
  closeQuizBtn?.addEventListener('click', () => closeModal(quizModal));
  closeGlossaryBtn?.addEventListener('click', () => closeModal(glossaryModal));
  closeNotesBtn?.addEventListener('click', () => closeModal(notesModal));

  // Open modal triggers
  btnSlideDrawer?.addEventListener('click', () => openModal(slideDrawerModal));
  slideIndicator?.addEventListener('click', () => openModal(slideDrawerModal));

  btnQuiz?.addEventListener('click', () => {
    openModal(quizModal);
    startQuiz();
  });
  mobileBtnQuiz?.addEventListener('click', () => {
    openModal(quizModal);
    startQuiz();
  });

  btnGlossary?.addEventListener('click', () => {
    openModal(glossaryModal);
    renderGlossary();
  });
  mobileBtnGlossary?.addEventListener('click', () => {
    openModal(glossaryModal);
    renderGlossary();
  });

  btnNotes?.addEventListener('click', () => {
    openModal(notesModal);
    renderSpeakerNotes();
  });
  mobileBtnNotes?.addEventListener('click', () => {
    openModal(notesModal);
    renderSpeakerNotes();
  });

  // ==========================================================================
  // INTERACTIVE PKN QUIZ ENGINE
  // ==========================================================================
  const quizData = [
    {
      question: "Apa esensi perbedaan mendasar antara 'Civics' dan 'Citizenship Education'?",
      options: [
        "Civics fokus pada kurikulum formal/sekolah, sedangkan Citizenship Education mencakup pengalaman formal, nonformal, hingga komunitas.",
        "Civics mempelajari undang-undang luar negeri, sedangkan Citizenship Education hanya untuk warga lokal.",
        "Civics adalah hafalan pasal konstitusi, sedangkan Citizenship Education tidak memiliki landasan akademik.",
        "Tidak ada perbedaan sama sekali, keduanya identik dalam segala aspek."
      ],
      correctIndex: 0,
      explanation: "Civics berfokus pada mata pelajaran dan kajian formal di institusi pendidikan, sedangkan Citizenship Education melingkupi proses pembentukan watak warga negara secara luas sepanjang hayat (keluarga, komunitas, media)."
    },
    {
      question: "Manakah komponen dari 'The Civic Triad' yang memampukan seseorang memilah fakta dari hoaks dan berdialog damai?",
      options: [
        "Civic Knowledge (Pengetahuan Kewarganegaraan)",
        "Civic Skills (Keterampilan Intelektual & Partisipatif)",
        "Civic Disposition (Watak dan Sikap)",
        "Civic Obligation (Kewajiban Mutlak)"
      ],
      correctIndex: 1,
      explanation: "Civic Skills mencakup kecakapan berpikir kritis (menyaring fakta, mendeteksi bias/hoaks) serta keterampilan partisipatif seperti musyawarah, negosiasi, dan advokasi damai."
    },
    {
      question: "Dalam landasan pembelajaran Pendidikan Kewarganegaraan di Indonesia, Pancasila berkedudukan sebagai...",
      options: [
        "Landasan Yuridis",
        "Landasan Ilmiah",
        "Landasan Idiil (Sumber Nilai Kebangsaan)",
        "Landasan Operasional Sementara"
      ],
      correctIndex: 2,
      explanation: "Pancasila berkedudukan sebagai landasan idiil (dasar filsafat dan sumber nilai), sedangkan UUD 1945 adalah landasan yuridis, dan disiplin ilmu politik/hukum/sosiologi adalah landasan ilmiah."
    },
    {
      question: "Berikut ini yang merupakan perwujudan nyata karakter 'Good Citizen' di era ruang publik digital adalah...",
      options: [
        "Menyebarkan informasi sensasional secepat mungkin sebelum diverifikasi pihak berwenang.",
        "Tabayyun / cek fakta sebelum membagikan konten, menolak ujaran kebencian, dan menjaga adab komunikasi.",
        "Mendominasi kolom komentar dengan menyerang pandangan yang berbeda.",
        "Mengabaikan isu-isu kebangsaan karena merasa tidak berdampak langsung."
      ],
      correctIndex: 1,
      explanation: "Good Citizen di era digital menunjukkan integritas dan literasi kritis: memverifikasi sumber berita, menghormati kebinekaan, serta menyampaikan gagasan secara beradab dan bertanggung jawab."
    },
    {
      question: "Dalam studi kasus perundungan berlatar perbedaan latar belakang di sekolah, prinsip etika penanganan apa yang paling krusial?",
      options: [
        "Menyebarkan identitas dan foto anak di media sosial agar mendapat sanksi sosial.",
        "Mengedepankan perlindungan hak anak, kerahasiaan identitas, pemulihan korban, dan penegakan keadilan yang adil.",
        "Menutup-nutupi kasus sepenuhnya agar nama baik sekolah tidak tercemar.",
        "Menyerahkan penyelesaian secara sepihak kepada senior tanpa melibatkan pihak berwenang."
      ],
      correctIndex: 1,
      explanation: "Prinsip etis utama penanganan kekerasan/perundungan anak meliputi perlindungan hak dan kerahasiaan anak (korban & pelaku di bawah umur), pemulihan trauma, serta investigasi objektif berbasis fakta."
    }
  ];

  let currentQuestionIndex = 0;
  let quizScore = 0;
  let hasAnsweredCurrent = false;

  const quizStepText = document.getElementById('quizStepText');
  const quizScoreBadge = document.getElementById('quizScoreBadge');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizQuestionText = document.getElementById('quizQuestionText');
  const quizOptionsList = document.getElementById('quizOptionsList');
  const quizFeedbackBox = document.getElementById('quizFeedbackBox');
  const feedbackText = document.getElementById('feedbackText');
  const btnQuizNext = document.getElementById('btnQuizNext');
  const quizContent = document.getElementById('quizContent');
  const quizResultView = document.getElementById('quizResultView');
  const resultTitle = document.getElementById('resultTitle');
  const resultScoreText = document.getElementById('resultScoreText');
  const resultDesc = document.getElementById('resultDesc');
  const btnRestartQuiz = document.getElementById('btnRestartQuiz');
  const btnCloseQuizResult = document.getElementById('btnCloseQuizResult');

  function startQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    hasAnsweredCurrent = false;
    if (quizContent) quizContent.style.display = 'flex';
    if (quizResultView) quizResultView.style.display = 'none';
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (!quizQuestionText || !quizOptionsList) return;
    const q = quizData[currentQuestionIndex];
    hasAnsweredCurrent = false;

    if (quizStepText) {
      quizStepText.textContent = `Pertanyaan ${currentQuestionIndex + 1} dari ${quizData.length}`;
    }
    if (quizScoreBadge) {
      quizScoreBadge.textContent = `Skor: ${quizScore}`;
    }
    if (quizProgressFill) {
      const pct = ((currentQuestionIndex + 1) / quizData.length) * 100;
      quizProgressFill.style.width = `${pct}%`;
    }

    quizQuestionText.textContent = q.question;
    quizOptionsList.innerHTML = '';
    if (quizFeedbackBox) quizFeedbackBox.style.display = 'none';
    if (btnQuizNext) btnQuizNext.style.display = 'none';

    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `
        <span class="quiz-option-letter">${letters[idx]}</span>
        <span class="quiz-option-text">${optText}</span>
      `;

      btn.addEventListener('click', () => {
        if (hasAnsweredCurrent) return;
        hasAnsweredCurrent = true;

        const isCorrect = idx === q.correctIndex;
        if (isCorrect) {
          quizScore += 20;
          btn.classList.add('correct');
          playSound('success');
          triggerHaptic(40);
        } else {
          btn.classList.add('wrong');
          playSound('error');
          triggerHaptic(60);
          // Highlight correct option
          const allOptions = quizOptionsList.querySelectorAll('.quiz-option-btn');
          if (allOptions[q.correctIndex]) {
            allOptions[q.correctIndex].classList.add('correct');
          }
        }

        // Disable all options
        quizOptionsList.querySelectorAll('.quiz-option-btn').forEach((b) => {
          b.disabled = true;
        });

        // Show explanation
        if (quizFeedbackBox && feedbackText) {
          feedbackText.innerHTML = `<strong>${isCorrect ? '✅ Jawaban Benar!' : '❌ Jawaban Kurang Tepat.'}</strong> ${q.explanation}`;
          quizFeedbackBox.style.display = 'flex';
        }

        if (quizScoreBadge) {
          quizScoreBadge.textContent = `Skor: ${quizScore}`;
        }

        // Next button or finish
        if (btnQuizNext) {
          btnQuizNext.style.display = 'inline-flex';
          if (currentQuestionIndex === quizData.length - 1) {
            btnQuizNext.textContent = 'Lihat Hasil Akhir 🏆';
          } else {
            btnQuizNext.textContent = 'Pertanyaan Berikutnya →';
          }
        }
      });

      quizOptionsList.appendChild(btn);
    });
  }

  if (btnQuizNext) {
    btnQuizNext.addEventListener('click', () => {
      playSound('click');
      if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        renderQuizQuestion();
      } else {
        showQuizResults();
      }
    });
  }

  function showQuizResults() {
    if (quizContent) quizContent.style.display = 'none';
    if (quizResultView) {
      quizResultView.style.display = 'flex';
      playSound('success');
      triggerHaptic([40, 60, 40]);

      if (resultScoreText) {
        resultScoreText.textContent = `Skor Akhir: ${quizScore} / 100`;
      }

      if (resultDesc) {
        if (quizScore >= 80) {
          resultDesc.textContent = '🎉 Luar biasa! Pemahaman Anda tentang konsep, tujuan, landasan, dan etika PKn sangat mendalam dan matang.';
        } else if (quizScore >= 60) {
          resultDesc.textContent = '👍 Bagus! Anda telah memahami sebagian besar konsep inti. Silakan telaah kembali slide materi untuk menyempurnakan kompetensi.';
        } else {
          resultDesc.textContent = '📚 Mari belajar bersama lagi! Jelajahi slide materi dan kamus istilah untuk memperkuat fondasi kewarganegaraan Anda.';
        }
      }
    }
  }

  btnRestartQuiz?.addEventListener('click', () => {
    playSound('click');
    startQuiz();
  });

  btnCloseQuizResult?.addEventListener('click', () => {
    closeModal(quizModal);
  });

  // ==========================================================================
  // KAMUS ISTILAH PKN (GLOSSARY)
  // ==========================================================================
  const glossaryData = [
    {
      term: 'Civics',
      badge: 'Disiplin Ilmu',
      def: 'Mata pelajaran atau bidang kajian mengenai struktur pemerintahan, hak dan kewajiban warga, serta cara kerja lembaga publik dalam masyarakat.'
    },
    {
      term: 'Civic Education',
      badge: 'Pendidikan Formal',
      def: 'Program pendidikan kewarganegaraan terstruktur yang dirancang melalui kurikulum formal di sekolah dan perguruan tinggi.'
    },
    {
      term: 'Citizenship Education',
      badge: 'Pendidikan Luas',
      def: 'Proses pembentukan kompetensi dan karakter warga negara yang berlangsung sepanjang hayat melalui lingkungan formal, nonformal, keluarga, dan komunitas.'
    },
    {
      term: 'Civic Knowledge',
      badge: 'Triad 1',
      def: 'Penguasaan materi pengetahuan tentang dasar negara, hukum konstitusi, tata kelola demokrasi, hak asasi manusia, serta lembaga negara.'
    },
    {
      term: 'Civic Skills',
      badge: 'Triad 2',
      def: 'Keterampilan intelektual (berpikir kritis, menganalisis data, menyaring hoaks) dan keterampilan partisipatif (musyawarah, negosiasi, advokasi damai).'
    },
    {
      term: 'Civic Disposition',
      badge: 'Triad 3',
      def: 'Watak moral, integritas, kejujuran, komitmen keadilan, kepedulian sosial, serta sikap toleransi dalam keberagaman kebinekaan.'
    },
    {
      term: 'Landasan Idiil',
      badge: 'Filsafat Nilai',
      def: 'Pancasila sebagai dasar filsafat bangsa dan sumber nilai etis tertinggi dalam perumusan materi dan tujuan pembelajaran PKn.'
    },
    {
      term: 'Landasan Yuridis',
      badge: 'Hukum Positif',
      def: 'UUD NRI 1945, UU Sisdiknas No. 20/2003, dan peraturan turunan yang mewajibkan Pendidikan Kewarganegaraan di seluruh jenjang pendidikan.'
    },
    {
      term: 'Good Citizen',
      badge: 'Profil Warga',
      def: 'Warga negara yang cerdas, terampil, taat hukum, berintegritas moral, menjunjung martabat kemanusiaan, serta aktif berpartisipasi demi kepentingan umum.'
    },
    {
      term: 'Bonus Demografi',
      badge: 'Tantangan Masa Depan',
      def: 'Kondisi struktur penduduk di mana usia produktif mendominasi; menuntut penguatan karakter dan kompetensi warga agar menjadi modal kemajuan nasional.'
    },
    {
      term: 'Restorative Justice',
      badge: 'Prinsip Keadilan',
      def: 'Pendekatan hukum dan mediasi yang berfokus pada pemulihan keadilan, rekonsiliasi para pihak, dan perlindungan masa depan anak, bukan sekadar pembalasan dendam.'
    }
  ];

  const glossaryList = document.getElementById('glossaryList');
  const glossarySearchInput = document.getElementById('glossarySearchInput');

  function renderGlossary(filterText = '') {
    if (!glossaryList) return;
    glossaryList.innerHTML = '';
    const query = filterText.toLowerCase().trim();

    const filtered = glossaryData.filter((item) => {
      return (
        !query ||
        item.term.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query) ||
        item.def.toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      glossaryList.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="font-weight: 800;">Istilah tidak ditemukan.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'glossary-item';
      card.innerHTML = `
        <div class="glossary-header-row">
          <strong class="glossary-term">${item.term}</strong>
          <span class="neu-badge cyan" style="font-size: 0.72rem;">${item.badge}</span>
        </div>
        <p class="glossary-def">${item.def}</p>
      `;
      glossaryList.appendChild(card);
    });
  }

  if (glossarySearchInput) {
    glossarySearchInput.addEventListener('input', (e) => {
      renderGlossary(e.target.value);
    });
  }

  // ==========================================================================
  // CATATAN PRESENTER (SPEAKER NOTES)
  // ==========================================================================
  const notesSlideNum = document.getElementById('notesSlideNum');
  const notesSlideTitle = document.getElementById('notesSlideTitle');
  const notesContent = document.getElementById('notesContent');
  const notesCounter = document.getElementById('notesCounter');
  const btnNotesPrev = document.getElementById('btnNotesPrev');
  const btnNotesNext = document.getElementById('btnNotesNext');

  function renderSpeakerNotes() {
    if (!notesSlideNum || !notesSlideTitle || !notesContent) return;

    notesSlideNum.textContent = padZero(currentSlide);
    if (notesCounter) {
      notesCounter.textContent = `${padZero(currentSlide)} / ${padZero(totalSlides)}`;
    }

    const currentSlideEl = document.querySelector(`.slide[data-slide="${currentSlide}"]`);
    const titleEl = currentSlideEl ? currentSlideEl.querySelector('.slide-title') : null;
    const titleText = titleEl ? titleEl.textContent.trim() : `Slide ${currentSlide}`;
    notesSlideTitle.textContent = titleText;

    // Generate smart context-aware notes
    let notesHtml = '';
    if (currentSlide === 1) {
      notesHtml = `
        <p><strong>Poin Kunci Pembuka:</strong></p>
        <ul>
          <li>Ucapkan salam hormat kepada Dosen Pengampu (Dr. Zulherman, M.Pd.) dan rekan mahasiswa.</li>
          <li>Perkenalkan Kelompok 1 secara ringkas dan lugas.</li>
          <li>Sampaikan bahwa presentasi ini menyajikan kajian lengkap 48 slide yang dirancang runtut mengacu pada buku rujukan Pendidikan Kewarganegaraan.</li>
        </ul>
      `;
    } else if (currentSlide === 2) {
      notesHtml = `
        <p><strong>Peta Alur Presentasi:</strong></p>
        <ul>
          <li>Jelaskan 3 pilar pembahasan hari ini: Konsep PKn, Landasan Pembelajaran, dan Tujuan Kompetensi.</li>
          <li>Tekankan bahwa presentasi ini menggabungkan kajian teori, sejarah kurikulum di Indonesia, hingga simulasi studi kasus toleransi nyata.</li>
        </ul>
      `;
    } else if (currentSlide === 7) {
      notesHtml = `
        <p><strong>Fokus Tugas Penelusuran Istilah:</strong></p>
        <ul>
          <li>Jelaskan pembedaan antara istilah Indonesia (Pendidikan & Kewarganegaraan) dengan istilah internasional (Civics & Citizenship).</li>
          <li>Rujuk definisi resmi UU No. 20/2003 dan Oxford Dictionary.</li>
        </ul>
      `;
    } else if (currentSlide === 8) {
      notesHtml = `
        <p><strong>Interaksi Diskusi Good Citizen:</strong></p>
        <ul>
          <li>Ajak audiens atau dosen mencoba widget simulasi interaktif di slide ini.</li>
          <li>Tegaskan 5 ciri utama: hak-kewajiban, ketaatan hukum, toleransi kebinekaan, kritis digital, dan integritas moral.</li>
        </ul>
      `;
    } else if (currentSlide === 13 || currentSlide === 14) {
      notesHtml = `
        <p><strong>Harmoni Civic Triad:</strong></p>
        <ul>
          <li>Tekankan diagram Venn The Civic Triad (Winataputra, 2001).</li>
          <li>Buktikan penerapannya pada kasus perundungan: analisis fakta (knowledge), verifikasi sumber (skills), dan empati pada korban (disposition).</li>
          <li>Gunakan filter tab di slide untuk menyoroti tiap komponen secara terfokus.</li>
        </ul>
      `;
    } else if (currentSlide >= 21 && currentSlide <= 25) {
      notesHtml = `
        <p><strong>Perkembangan Historis Kurikulum:</strong></p>
        <ul>
          <li>Bahas evolusi: Civics 1957/1962, PMP 1975, PPKn 1994, hingga PKn Kontemporer dan Kurikulum Merdeka.</li>
          <li>Soroti bagaimana perubahan kurikulum mencerminkan dinamika politik dan tuntutan demokratisasi bangsa.</li>
        </ul>
      `;
    } else if (currentSlide >= 39 && currentSlide <= 43) {
      notesHtml = `
        <p><strong>Praktik Kasus & Program Solusi:</strong></p>
        <ul>
          <li>Jelaskan program aksi TOLERANSI AKTIF (Slide 42).</li>
          <li>Ajak audiens memberikan vote dukungan interaktif pada 4 kuadran solusi.</li>
          <li>Tegaskan komitmen perlindungan hak anak dan penolakan kekerasan di lingkungan pendidikan.</li>
        </ul>
      `;
    } else if (currentSlide === 48) {
      notesHtml = `
        <p><strong>Penutup & Sesi Diskusi:</strong></p>
        <ul>
          <li>Sampaikan kutipan penutup mengenai pentingnya integritas moral warga negara sejati.</li>
          <li>Buka forum tanya jawab kepada rekan mahasiswa dan dosen pengampu dengan santun.</li>
        </ul>
      `;
    } else {
      notesHtml = `
        <p><strong>Uraian Materi Slide ${padZero(currentSlide)}:</strong></p>
        <ul>
          <li>Uraikan poin-poin kartu materi secara terstruktur dari kartu 01 hingga selesai.</li>
          <li>Hubungkan konsep teoritis dengan realitas kehidupan berbangsa dan bernegara di Indonesia saat ini.</li>
          <li>Perhatikan intonasi dan jaga kontak mata dengan audiens / layar presentasi.</li>
        </ul>
      `;
    }

    notesContent.innerHTML = notesHtml;
  }

  btnNotesPrev?.addEventListener('click', () => {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
      renderSpeakerNotes();
    }
  });

  btnNotesNext?.addEventListener('click', () => {
    if (currentSlide < totalSlides) {
      goToSlide(currentSlide + 1);
      renderSpeakerNotes();
    }
  });

  // ==========================================================================
  // SLIDE 08: CITIZEN CHECKER INTERACTIVE WIDGET
  // ==========================================================================
  const citizenChecker = document.getElementById('citizenChecker');
  if (citizenChecker) {
    const checkboxes = citizenChecker.querySelectorAll('.citizen-checkbox');
    const meterBadge = document.getElementById('citizenMeterBadge');
    const progressFill = document.getElementById('citizenProgressFill');
    const resultText = document.getElementById('citizenResultText');

    function updateCitizenScore() {
      let checkedCount = 0;
      checkboxes.forEach((cb) => {
        if (cb.checked) checkedCount++;
      });

      const percentage = (checkedCount / checkboxes.length) * 100;
      if (progressFill) progressFill.style.width = `${percentage}%`;
      if (meterBadge) meterBadge.textContent = `${checkedCount} / ${checkboxes.length} Terpenuhi`;

      if (resultText) {
        if (checkedCount === 0) {
          resultText.textContent = 'Ketuk kriteria di atas untuk melihat profil kewarganegaraan Anda!';
        } else if (checkedCount <= 2) {
          resultText.textContent = `Skor ${percentage}%: Pemula Kewarganegaraan 🌱 Terus tingkatkan kepedulian Anda!`;
        } else if (checkedCount <= 4) {
          resultText.textContent = `Skor ${percentage}%: Warga Berkarakter Baik ⭐ Anda sudah menunjukkan tanggung jawab nyata!`;
        } else {
          resultText.textContent = `Skor 100%: Good Citizen Teladan! 🏆 Anda mewujudkan nilai Pancasila sejati!`;
          playSound('success');
          triggerHaptic([30, 50, 30]);
        }
      }
    }

    checkboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        playSound('click');
        triggerHaptic(20);
        updateCitizenScore();
      });
    });
  }

  // ==========================================================================
  // SLIDE 14: TRIAD FILTER TABS
  // ==========================================================================
  const triadFilterTabs = document.getElementById('triadFilterTabs');
  const triadCardsGrid = document.getElementById('triadCardsGrid');

  if (triadFilterTabs && triadCardsGrid) {
    const filterBtns = triadFilterTabs.querySelectorAll('.filter-pill-btn');
    const cards = triadCardsGrid.querySelectorAll('.content-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        playSound('click');
        triggerHaptic(20);

        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === 'case' || category === filter) {
            card.classList.remove('dimmed');
            if (filter !== 'all' && category === filter) {
              card.classList.add('highlighted');
            } else {
              card.classList.remove('highlighted');
            }
          } else {
            card.classList.add('dimmed');
            card.classList.remove('highlighted');
          }
        });
      });
    });
  }

  // ==========================================================================
  // SLIDE 42: INTERACTIVE QUADRANT VOTING
  // ==========================================================================
  const voteActionBtns = document.querySelectorAll('.vote-action-btn');
  voteActionBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('success');
      triggerHaptic(30);

      const countEl = btn.querySelector('.vote-count');
      if (countEl) {
        let currentCount = parseInt(countEl.textContent, 10) || 0;
        currentCount++;
        countEl.textContent = currentCount;
      }

      btn.classList.add('voted');
      btn.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.15)' },
        { transform: 'scale(1)' }
      ], { duration: 250, easing: 'ease-out' });

      showToast('👍 Dukungan program berhasil ditambahkan!');
    });
  });

  // ==========================================================================
  // CONTENT CARDS TACTILE TAP HIGHLIGHT
  // ==========================================================================
  const allContentCards = document.querySelectorAll('.content-card');
  allContentCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Don't intercept if clicking an input, button or link
      if (['button', 'input', 'a'].includes(e.target.tagName.toLowerCase())) return;

      const isAlreadyActive = card.classList.contains('interactive-active');
      allContentCards.forEach((c) => c.classList.remove('interactive-active'));

      if (!isAlreadyActive) {
        card.classList.add('interactive-active');
        playSound('click');
        triggerHaptic(15);
      }
    });
  });

  // ==========================================================================
  // FULLSCREEN HANDLER
  // ==========================================================================
  function toggleFullscreen() {
    playSound('pop');
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

  // ==========================================================================
  // KEYBOARD NAVIGATION
  // ==========================================================================
  document.addEventListener('keydown', (e) => {
    // Avoid hijacking when typing in an input
    if (['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase())) {
      if (e.key === 'Escape') {
        document.activeElement.blur();
      }
      return;
    }

    // Modal close on Escape
    if (e.key === 'Escape') {
      [slideDrawerModal, quizModal, glossaryModal, notesModal].forEach((m) => closeModal(m));
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

      case 'm':
      case 'M':
        e.preventDefault();
        if (slideDrawerModal?.classList.contains('open')) {
          closeModal(slideDrawerModal);
        } else {
          openModal(slideDrawerModal);
        }
        break;

      case 'q':
      case 'Q':
        e.preventDefault();
        if (quizModal?.classList.contains('open')) {
          closeModal(quizModal);
        } else {
          openModal(quizModal);
          startQuiz();
        }
        break;

      case 'g':
      case 'G':
        e.preventDefault();
        if (glossaryModal?.classList.contains('open')) {
          closeModal(glossaryModal);
        } else {
          openModal(glossaryModal);
          renderGlossary();
        }
        break;

      case 'n':
      case 'N':
        e.preventDefault();
        if (notesModal?.classList.contains('open')) {
          closeModal(notesModal);
        } else {
          openModal(notesModal);
          renderSpeakerNotes();
        }
        break;

      case 's':
      case 'S':
        e.preventDefault();
        btnSoundToggle?.click();
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  });

  // Initial render on slide 1
  goToSlide(1, false);
});
