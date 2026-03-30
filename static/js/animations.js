// ============================================================
// PERSONA 5 PORTFOLIO — ANIMATIONS & INTERACTIONS
// ============================================================

(() => {
  'use strict';

  // ── SOUND EFFECTS (Web Audio API) ──────────────────────────
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let soundEnabled = true;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new AudioCtx();
    return audioCtx;
  }

  function playTone(freq, duration, type = 'square', volume = 0.08) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* audio not available */ }
  }

  // P5-style sound effects
  function playMenuHover() {
    playTone(800, 0.06, 'square', 0.05);
  }

  function playMenuSelect() {
    playTone(1200, 0.08, 'square', 0.06);
    setTimeout(() => playTone(1600, 0.1, 'square', 0.05), 60);
  }

  function playNavClick() {
    playTone(600, 0.05, 'triangle', 0.06);
    setTimeout(() => playTone(900, 0.08, 'triangle', 0.05), 40);
  }

  function playIntroSwoosh() {
    playTone(200, 0.3, 'sawtooth', 0.04);
    setTimeout(() => playTone(400, 0.2, 'square', 0.03), 100);
  }

  // Sound toggle
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    // Restore preference
    if (localStorage.getItem('p5SoundOff') === '1') {
      soundEnabled = false;
      soundBtn.classList.add('muted');
      soundBtn.textContent = '\u266B\u0338'; // muted icon
    }
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('p5SoundOff', soundEnabled ? '0' : '1');
      soundBtn.classList.toggle('muted', !soundEnabled);
      soundBtn.textContent = soundEnabled ? '\u266B' : '\u266B\u0338';
      if (soundEnabled) playMenuSelect();
    });
  }

  // ── PAGE TRANSITIONS ──────────────────────────────────────
  const wipe = document.getElementById('p5-wipe');

  // Page-enter animation runs automatically via CSS class on load
  if (wipe) {
    wipe.classList.remove('p5-wipe-exit');
    wipe.classList.add('p5-wipe-enter');
  }

  // Add hover sounds and visual feedback to links, but DON'T intercept navigation
  // The page-enter wipe handles the "arrival" animation on each page load
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || !a.href) return;

    try {
      const url = new URL(a.href, window.location.origin);
      const isInternal = url.origin === window.location.origin;
      if (!isInternal || a.target === '_blank') return;

      // Play sound (non-blocking — navigation proceeds immediately)
      playNavClick();
    } catch (err) { /* ignore invalid URLs */ }
  });

  // ── INTRO OVERLAY ─────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const intro = document.getElementById('p5-intro');
    if (!intro) return;

    // Play once per session
    if (sessionStorage.getItem('p5IntroSeen')) {
      intro.remove();
      return;
    }

    // Wait for the page-enter wipe to finish
    setTimeout(() => {
      intro.hidden = false;
      intro.classList.add('play');
      playIntroSwoosh();
    }, 650);

    // Calculate total intro duration and auto-dismiss
    // The longest animation is jokerSlideOut at 1.6s + 0.3s = 1.9s
    const introDuration = 2100;

    setTimeout(() => {
      intro.classList.add('done');
      sessionStorage.setItem('p5IntroSeen', '1');
      // Remove from DOM after fade out
      setTimeout(() => {
        intro.remove();
      }, 400);
    }, 650 + introDuration);
  });

  // ── MOBILE NAV TOGGLE ─────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      navToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
      playMenuSelect();
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.innerHTML = '&#9776;';
      });
    });
  }

  // ── MENU ITEM HOVER SOUNDS ────────────────────────────────
  document.querySelectorAll('.p5-menu-item').forEach(item => {
    item.addEventListener('mouseenter', playMenuHover);
    item.addEventListener('click', playMenuSelect);
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => playTone(600, 0.04, 'square', 0.03));
  });

  // ── SCROLL-TRIGGERED ANIMATIONS ───────────────────────────
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible', 'reveal');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe elements for scroll reveal
  document.querySelectorAll('.fade-up, .skill-card, .persona-card, .stat-bar').forEach(el => {
    revealObserver.observe(el);
  });

  // ── PARALLAX MOUSE TRACKING ON HERO ───────────────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const character = document.querySelector('.hero-character');
      if (character) {
        character.style.transform = `translate(${x * 20}px, ${y * 15}px) scale(1)`;
      }

      // Subtle parallax on stars
      document.querySelectorAll('.p5-star').forEach((star, i) => {
        const speed = (i + 1) * 3;
        star.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    });
  }

  // ── CONTACT FORM HANDLER ──────────────────────────────────
  window.handleContactSubmit = function(form) {
    playMenuSelect();
    const messages = document.querySelector('.chat-messages');
    if (messages) {
      const name = form.querySelector('input[name="name"]').value;
      const message = form.querySelector('textarea[name="message"]').value;

      // Add sent bubble
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble sent';
      bubble.textContent = message;
      messages.appendChild(bubble);

      // Auto-reply after delay
      setTimeout(() => {
        const reply = document.createElement('div');
        reply.className = 'chat-bubble received';
        reply.textContent = `Thanks ${name}! I'll get back to you soon. The Phantom Thieves never ignore a calling card.`;
        messages.appendChild(reply);
        playTone(1000, 0.1, 'sine', 0.05);
      }, 800);

      form.reset();
    }
  };

  // ── P5 WEATHER & DATE WIDGET ──────────────────────────────
  // Simplified version inspired by caffi-nate/Persona5-Weather-Forecast
  // Uses sprite sheets for authentic P5 visual style

  const weatherWidget = document.getElementById('p5-weather-widget');
  if (weatherWidget) {
    let weatherSpriteFrame = 0;

    // SCALED sprite cell dimensions (must match CSS background-size)
    // Numbers: bg-size 460x207, 10 cols x 3 rows → cell 46x69
    const NUM_W = 46, NUM_H = 69;
    // Month: bg-size 600x150, 12 cols x 3 rows → cell 50x50
    const MONTH_W = 50, MONTH_H = 50;
    // Weekday: bg-size 228x88, 3 cols x 3 rows → cell 76x29.3
    const WKDAY_W = 76, WKDAY_H = 29.33;
    // Weather: bg-size 152x112, 4 cols x 3 rows → cell 38x37.3
    const WTHR_W = 38, WTHR_H = 37.33;

    function updateDateSprites() {
      const now = new Date();
      const date = now.getDate();
      const month = now.getMonth(); // 0-indexed
      const day = (now.getDay() + 6) % 7; // Mon=0
      const tens = Math.floor(date / 10);
      const ones = date % 10;

      // Date tens
      setStackedSprite(tens, '.wgt-date-tens', NUM_W, NUM_H);
      // Date ones
      setStackedSprite(ones, '.wgt-date-ones', NUM_W, NUM_H);
      // Month
      setStackedSprite(month, '.wgt-month', MONTH_W, MONTH_H);
      // Weekday (3 cols layout)
      const wkSprite = weatherWidget.querySelector('.wgt-weekday');
      if (wkSprite) {
        const xPos = (day % 3) * -WKDAY_W;
        const yPos = Math.floor(day / 3) * -WKDAY_H;
        wkSprite.style.backgroundPosition = `${xPos}px ${yPos}px`;
      }
    }

    function setStackedSprite(idx, cls, w, h) {
      const top = weatherWidget.querySelector(cls + '-top');
      const mid = weatherWidget.querySelector(cls + '-mid');
      const base = weatherWidget.querySelector(cls + '-base');
      if (top) top.style.backgroundPosition = `${-idx * w}px 0px`;
      if (mid) mid.style.backgroundPosition = `${-idx * w}px ${-h}px`;
      if (base) base.style.backgroundPosition = `${-idx * w}px ${-2 * h}px`;
    }

    function updateWeatherIcon(conditionInt) {
      const sprite = weatherWidget.querySelector('.wgt-weather-sprite');
      if (!sprite) return;
      const xPos = -conditionInt * WTHR_W;
      const yPos = -(weatherSpriteFrame * WTHR_H);
      sprite.style.backgroundPosition = `${xPos}px ${yPos}px`;
    }

    function updateTimeDisplay() {
      const timeEl = weatherWidget.querySelector('.wgt-time');
      if (!timeEl) return;
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      timeEl.textContent = `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}${ampm}`;
    }

    // Fetch weather from OpenWeatherMap
    function fetchWeather() {
      if (!navigator.geolocation) {
        updateWeatherIcon(0); // default to sunny
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const key = '32aa9a705e117c99f3cd712e3a521b18';
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
          fetch(url)
            .then(r => r.json())
            .then(data => {
              if (data.weather && data.weather[0]) {
                const icon = data.weather[0].icon;
                const condition = convertWeatherIcon(icon);
                updateWeatherIcon(condition);
                // Show temp
                const tempEl = weatherWidget.querySelector('.wgt-temp');
                if (tempEl && data.main) {
                  const celsius = Math.round(data.main.temp - 273.15);
                  tempEl.textContent = `${celsius}\u00B0C`;
                }
              }
            })
            .catch(() => updateWeatherIcon(0));
        },
        () => updateWeatherIcon(0), // denied geolocation
        { timeout: 5000 }
      );
    }

    function convertWeatherIcon(iconID) {
      switch (iconID) {
        case '01d': case '01n': return 0; // Sun
        case '02d': case '02n': case '03d': case '03n': case '04d': case '04n': return 1; // Clouds
        case '09d': case '09n': case '10d': case '10n': case '11d': case '11n': return 2; // Rain
        case '13d': case '13n': return 3; // Snow
        default: return 0;
      }
    }

    // Animate weather sprite (cycle 3 frames)
    setInterval(() => {
      weatherSpriteFrame = (weatherSpriteFrame + 1) % 3;
      const sprite = weatherWidget.querySelector('.wgt-weather-sprite');
      if (sprite) {
        // Re-apply with new frame
        const currentBg = sprite.style.backgroundPosition || '0px 0px';
        const xPos = parseInt(currentBg) || 0;
        sprite.style.backgroundPosition = `${xPos}px ${-(weatherSpriteFrame * WTHR_H)}px`;
      }
    }, 1000);

    // Initialize
    updateDateSprites();
    updateTimeDisplay();
    fetchWeather();

    // Update time every second
    setInterval(updateTimeDisplay, 1000);
    // Update date every minute
    setInterval(updateDateSprites, 60000);
  }

  // ── KEYBOARD NAVIGATION (P5 STYLE) ───────────────────────
  const menuItems = document.querySelectorAll('.p5-menu-item');
  if (menuItems.length > 0) {
    let focusIdx = -1;

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (e.key === 'ArrowDown') {
          focusIdx = (focusIdx + 1) % menuItems.length;
        } else {
          focusIdx = (focusIdx - 1 + menuItems.length) % menuItems.length;
        }
        menuItems[focusIdx].focus();
        playMenuHover();
      }
      if (e.key === 'Enter' && focusIdx >= 0) {
        menuItems[focusIdx].click();
        playMenuSelect();
      }
    });
  }

})();
