/* ============================================================
   BIRTHDAY PAGE — script.js
   ============================================================ */

(function () {
    'use strict';

    // ====================================================
    // 0. WRAP SECTIONS IN #snap-container
    //    Must run BEFORE any other DOM query so refs below
    //    point at elements that are already inside the wrapper.
    // ====================================================
    (function buildSnapContainer() {
        const wrapper = document.createElement('div');
        wrapper.id = 'snap-container';

        // Move every <section> into the wrapper
        const sectionEls = Array.from(document.querySelectorAll('section'));
        // Insert wrapper before the first section
        sectionEls[0].parentNode.insertBefore(wrapper, sectionEls[0]);
        sectionEls.forEach(s => wrapper.appendChild(s));
    })();

    // ─── DOM refs ───────────────────────────────────────────
    const audio       = document.getElementById('musik');
    const muteBtn     = document.getElementById('btn');
    const galeriEl    = document.querySelector('.galeri');
    const fotoEls     = document.querySelectorAll('.foto');
    const snapContainer = document.getElementById('snap-container');

    // ─── State ──────────────────────────────────────────────
    let isMuted       = false;
    let confettiFired = false;

    // ====================================================
    // 1. AUDIO POP-UP
    // ====================================================
    function buildPopup() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.id = 'audio-popup';

        overlay.innerHTML = `
            <div class="popup-box">
                <span class="popup-icon">🎵</span>
                <h3>Eh, sebentar dulu!</h3>
                <p>Apakah mau sambil memutar lagu<br>untuk menemanimu di sini?</p>
                <div class="popup-buttons">
                    <button class="btn-popup ya"  id="popup-ya">Ya, putar!</button>
                    <button class="btn-popup tidak" id="popup-tidak">Tidak</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        document.getElementById('popup-ya').addEventListener('click', () => {
            overlay.classList.add('hidden');
            audio.muted = false;
            audio.play().catch(() => {});
            isMuted = false;
            muteBtn.textContent = '🎵';
            if (!confettiFired) startConfetti();
        });

        document.getElementById('popup-tidak').addEventListener('click', () => {
            overlay.classList.add('hidden');
            audio.muted = true;
            audio.play().catch(() => {});
            isMuted = true;
            muteBtn.textContent = '🔇';
            if (!confettiFired) startConfetti();
        });
    }

    window.addEventListener('load', () => {
        audio.muted = true;
        audio.play().catch(() => {});
        setTimeout(buildPopup, 600);
    });

    // ====================================================
    // 2. MUTE TOGGLE BUTTON
    // ====================================================
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        audio.muted = isMuted;
        audio.play().catch(() => {});
        muteBtn.textContent = isMuted ? '🔇' : '🎵';
    });

    // ====================================================
    // 3. CONFETTI
    // ====================================================
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    const COLORS = [
        '#c9a96e', '#e8d5b0', '#b8a0d8', '#7b5ea7',
        '#d4b8e0', '#fdfbff', '#e8dff5', '#9b7fc7', '#f0e6ff'
    ];

    let particles = [];
    let animId    = null;

    function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function createParticle() {
        const size = Math.random() * 7 + 4;
        return {
            x:       Math.random() * canvas.width,
            y:       -size * 2,
            w:       size,
            h:       size * (Math.random() > 0.5 ? 0.4 : 1),   // mix squares & rects
            color:   COLORS[Math.floor(Math.random() * COLORS.length)],
            rot:     Math.random() * Math.PI * 2,
            rotV:    (Math.random() - 0.5) * 0.14,
            vx:      (Math.random() - 0.5) * 2.5,
            vy:      Math.random() * 2.5 + 1.5,
            alpha:   1,
            shape:   Math.random() > 0.7 ? 'circle' : 'rect',
        };
    }

    function startConfetti() {
        confettiFired = true;
        canvas.style.display = 'block';

        // Burst of 180 particles
        for (let i = 0; i < 180; i++) {
            const p = createParticle();
            p.y = -Math.random() * canvas.height * 0.5; // stagger entry
            particles.push(p);
        }

        if (animId) cancelAnimationFrame(animId);
        drawConfetti();

        // Stop spawning after 6 s, fade remaining particles out
        setTimeout(() => {
            const fadeOut = setInterval(() => {
                particles.forEach(p => p.alpha -= 0.012);
                particles = particles.filter(p => p.alpha > 0);
                if (particles.length === 0) {
                    clearInterval(fadeOut);
                    cancelAnimationFrame(animId);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }, 60);
        }, 6000);
    }

    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }
            ctx.restore();

            p.x   += p.vx;
            p.y   += p.vy;
            p.rot += p.rotV;

            // gentle drift
            p.vx += (Math.random() - 0.5) * 0.08;
            p.vy += 0.04;

            // wrap horizontally
            if (p.x < -20)            p.x = canvas.width + 20;
            if (p.x > canvas.width + 20) p.x = -20;
        });

        if (particles.length > 0) {
            animId = requestAnimationFrame(drawConfetti);
        }
    }

    // ====================================================
    // 4. TWINKLING STARS BACKGROUND
    // ====================================================
    function buildStars() {
        const container = document.createElement('div');
        container.className = 'stars-bg';
        document.body.prepend(container);

        for (let i = 0; i < 80; i++) {
            const s = document.createElement('div');
            s.className = 'star';
            const size = Math.random() * 2.5 + 1;
            s.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                top:  ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                --dur: ${(Math.random() * 5 + 3).toFixed(1)}s;
                --del: ${(Math.random() * 5).toFixed(1)}s;
            `;
            container.appendChild(s);
        }
    }
    buildStars();

    // ====================================================
    // 5. GALLERY — TRANSFORM-BASED SLIDER WITH INFINITE LOOP
    //    No overflow-x, no CSS scroll-snap on the gallery.
    //    Slides move via translateX on the .galeri flex container.
    //    This avoids ALL wheel/touch event conflicts with the
    //    vertical snap container.
    // ====================================================
    if (galeriEl && fotoEls.length) {
        const slides = Array.from(fotoEls); // real slides only
        const total  = slides.length;
        let current  = 0;         // 0-based real slide index
        let offsetPx = 0;         // live drag offset in px
        let isAnimating = false;

        // ── Positioning ─────────────────────────────────
        // Each slide is 100% wide. To show slide `i`, translate by -(i * 100%)
        // plus any live drag offsetPx.
        function applyTransform(animate) {
            const base = -(current * 100);     // percent
            if (animate) {
                galeriEl.style.transition = 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)';
            } else {
                galeriEl.style.transition = 'none';
            }
            galeriEl.style.transform = `translateX(calc(${base}% + ${offsetPx}px))`;
        }

        // ── Goto with optional animation ────────────────
        function goTo(index, animate = true) {
            // Wrap index for infinite loop
            current = ((index % total) + total) % total;
            offsetPx = 0;
            applyTransform(animate);
            updateDots();
        }

        // Init: show slide 0 instantly
        goTo(0, false);

        // ── Drag logic ───────────────────────────────────
        let isDragging = false;
        let dirLocked  = null;   // 'h' | 'v' | null
        let startX     = 0;
        let startY     = 0;
        const THRESHOLD = 8;     // px to decide direction

        function dragStart(x, y) {
            if (isAnimating) return;
            dirLocked = null;
            startX    = x;
            startY    = y;
            offsetPx  = 0;
        }

        function dragMove(x, y, e) {
            const dx = x - startX;
            const dy = y - startY;

            if (!dirLocked) {
                if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
                dirLocked = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
            }

            if (dirLocked === 'v') return; // vertical — don't touch gallery

            // Horizontal confirmed
            if (!isDragging) {
                isDragging = true;
                galeriEl.classList.add('is-dragging');
            }

            if (e && e.cancelable) e.preventDefault();

            offsetPx = dx;
            applyTransform(false);
        }

        function dragEnd() {
            if (!isDragging) { dirLocked = null; return; }
            isDragging = false;
            dirLocked  = null;
            galeriEl.classList.remove('is-dragging');

            const slideW    = galeriEl.clientWidth;
            const threshold = slideW * 0.2; // 20% of slide width to commit

            if (offsetPx < -threshold) {
                goTo(current + 1);          // next
            } else if (offsetPx > threshold) {
                goTo(current - 1);          // prev
            } else {
                goTo(current);              // snap back
            }
        }

        // Mouse
        galeriEl.addEventListener('mousedown', e => {
            e.preventDefault();
            dragStart(e.clientX, e.clientY);

            function onMove(e) { dragMove(e.clientX, e.clientY, e); }
            function onUp()    { dragEnd(); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); }

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup',   onUp);
        });

        // Touch
        galeriEl.addEventListener('touchstart', e => {
            dragStart(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        galeriEl.addEventListener('touchmove', e => {
            dragMove(e.touches[0].clientX, e.touches[0].clientY, e);
        }, { passive: false });
        galeriEl.addEventListener('touchend', () => dragEnd());

        // Prevent image drag
        galeriEl.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', e => e.preventDefault());
        });

        // No wheel intercept needed — .galeri has no overflow-x,
        // so wheel events naturally bubble up to #snap-container.

        // Expose goTo for dots
        galeriEl._goTo = goTo;

        // ── Update dots helper ───────────────────────────
        function updateDots() {
            const container = document.querySelector('.galeri-dots');
            if (!container) return;
            container.querySelectorAll('.dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }
    }

    // ====================================================
    // 6. GALLERY DOTS
    // ====================================================
    function buildGaleriDots() {
        if (!fotoEls.length || !galeriEl) return;

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'galeri-dots';
        const total = fotoEls.length;

        for (let i = 0; i < total; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => {
                if (galeriEl._goTo) galeriEl._goTo(i);
            });
            dotsContainer.appendChild(dot);
        }

        galeriEl.parentNode.insertBefore(dotsContainer, galeriEl.nextSibling);
    }
    buildGaleriDots();

    // ====================================================
    // 7. INTERSECTION OBSERVER — SECTION ANIMATIONS
    //    Root is the snap container, not the viewport.
    // ====================================================
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        },
        {
            root:      snapContainer,
            threshold: 0.25,
        }
    );

    document.querySelectorAll('.kenangan, .penutup').forEach(el => observer.observe(el));

    // ====================================================
    // 8. PREVENT DEFAULT LINK DRAG (safety)
    // ====================================================
    document.querySelectorAll('a, img').forEach(el => {
        el.addEventListener('dragstart', e => e.preventDefault());
    });

})();
