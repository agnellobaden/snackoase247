document.addEventListener('DOMContentLoaded', () => {
    // -1. 3D Deal of the Week Overlay Logic
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const enterBtn = document.getElementById('enter-site-btn');

    // Check if user has already seen the intro in this session
    // Remove sessionStorage check if you want it EVERY time for debugging, but typically session is good.
    // For "WOW" factor every refresh, we can comment out the check.
    if (welcomeOverlay) {
        welcomeOverlay.style.display = 'flex';
        // Force reflow to enable transition
        void welcomeOverlay.offsetWidth;
        welcomeOverlay.style.opacity = '1';

        const closeOverlay = () => {
            welcomeOverlay.style.opacity = '0';
            setTimeout(() => {
                welcomeOverlay.style.display = 'none';
                // Trigger auto-play music logic here if needed as user has interacted
                if (typeof playAudioSource === 'function') {
                    // This serves as the 'user interaction' to unlock audio
                    // playAudioSource().catch(e => console.log("Audio waiting")); 
                    // We actually leverage the existing click listener on document for audio
                }
            }, 500);
        };

        // Auto-close after 10 seconds
        setTimeout(() => {
            if (welcomeOverlay.style.display !== 'none') {
                closeOverlay();
            }
        }, 10000);

        enterBtn.addEventListener('click', closeOverlay);
        // Also allow clicking background to close
        welcomeOverlay.addEventListener('click', (e) => {
            if (e.target === welcomeOverlay) closeOverlay();
        });
    }

    // 0. "Hot Now" Ticker (Simulated Live Activity)
    setTimeout(() => {
        const ticker = document.createElement('div');
        ticker.style.cssText = `
            position: fixed;
            bottom: 0px;
            left: 0;
            width: 100%;
            background: rgba(0,0,0,0.8);
            border-top: 1px solid var(--accent);
            color: #fff;
            padding: 8px 0;
            font-size: 0.8rem;
            z-index: 9999;
            overflow: hidden;
            white-space: nowrap;
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
        `;

        const tickerContent = document.createElement('div');
        tickerContent.style.cssText = `
            display: inline-block;
            padding-left: 100%;
            animation: ticker-scroll 80s linear infinite;
        `;

        // Dynamic Events Pool
        const allEvents = [
            "🔥 Jemand aus Bühl hat gerade ein Mystery Pack gekauft!",
            "⚡ Red Bull Bestand knapp! Nur noch wenige Stück.",
            "🕒 SnackOase ist JETZT geöffnet - 24/7!",
            "🚀 Neu: Prime Hydration jetzt verfügbar.",
            "💎 Tipp: Check die Vibe Section für exklusive Deals.",
            "👀 5 Besucher schauen sich gerade die Angebote an.",
            "🍫 Takis Fuego sind fast ausverkauft!",
            "🧊 Eiskalte Drinks warten auf dich.",
            "📍 Komm vorbei: Hauptstraße 29.",
            "💰 Mega Deal: Mystery Pack für nur 10€.",
            "✨ Neue Vapes eingetroffen!"
        ];

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Initialize with random selection
        // Let's make the list longer and randomized on load for now to ensure variety.
        let currentEvents = shuffle([...allEvents]);

        function updateTickerContent() {
            tickerContent.innerHTML = currentEvents.map(e => `<span style="margin-right: 50px; color: #fff;">${e}</span>`).join('');
        }

        updateTickerContent();

        ticker.appendChild(tickerContent);
        document.body.appendChild(ticker);

        // Add Keyframes for Ticker
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes ticker-scroll {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-100%, 0, 0); }
            }
        `;
        document.head.appendChild(style);

        // Periodically refresh the content to simulate "live" updates
        setInterval(() => {
            // Create a new diversified list
            currentEvents = shuffle([...allEvents]);
            // Update the visible content (might jump slightly, but ensures new data)
            updateTickerContent();
        }, 30000); // Update every 30 seconds

    }, 2000); // Start after 2 seconds

    // 1. Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // If it's a stat-count element, animate it
                if (entry.target.classList.contains('stat-count')) {
                    animateValue(entry.target);
                }
            }
        });
    }, observerOptions);

    function animateValue(obj) {
        const text = obj.innerText;
        const target = parseInt(text.replace(/\D/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        let start = 0;
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * target);
            obj.innerText = current + suffix;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    // Initial check for elements already in view
    const revealElements = document.querySelectorAll('.reveal, .offer-card, .glass-card, .info-section, .stat-count');
    revealElements.forEach(el => {
        if (!el.classList.contains('stat-count')) el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // 3. Smooth Scroll for all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 4. Video Sound Control & Background Music
    const video = document.getElementById('kiosk-video');
    const bgMusic = document.getElementById('bg-music');
    const unmuteBtn = document.getElementById('unmute-btn');

    let isMusicPlaying = false;

    function playAudioSource() {
        if (bgMusic && bgMusic.querySelector('source').src && bgMusic.querySelector('source').src !== window.location.href) {
            if (video) video.muted = true;
            bgMusic.volume = 1.0;
            bgMusic.muted = false;
            return bgMusic.play().then(() => {
                isMusicPlaying = true;
                updateButtonState(true);
            });
        } else if (video) {
            video.muted = false;
            video.volume = 1.0;
            return video.play().then(() => {
                isMusicPlaying = true;
                updateButtonState(true);
            });
        }
        return Promise.reject("No audio source");
    }

    function muteAll() {
        if (bgMusic) {
            bgMusic.pause(); // Pause instead of just mute for clean stop
            bgMusic.muted = true;
        }
        if (video) video.muted = true;
        isMusicPlaying = false;
        updateButtonState(false);
    }

    function updateButtonState(playing) {
        if (unmuteBtn) {
            // Always show button so user can toggle
            unmuteBtn.style.display = 'flex';
            if (playing) {
                unmuteBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Sound aus';
            } else {
                unmuteBtn.innerHTML = '<i class="fas fa-volume-up"></i> Sound an';
            }
        }
    }

    if (unmuteBtn) {
        // Attempt initial auto-play
        playAudioSource().catch(() => {
            muteAll();
            if (video) video.play();
        });

        // Toggle on button click
        unmuteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document listener from double-firing
            if (isMusicPlaying) {
                muteAll();
            } else {
                playAudioSource();
            }
        });

        // "Unlock" audio context on first interaction anywhere
        const interactionEvents = ['click', 'touchstart', 'scroll', 'keydown', 'mousemove'];

        const unlockAudio = () => {
            if (isMusicPlaying) {
                // Already playing, clean up and exit
                interactionEvents.forEach(event => document.removeEventListener(event, unlockAudio));
                return;
            }

            playAudioSource().then(() => {
                // Success! Now we can remove the listeners
                interactionEvents.forEach(event => document.removeEventListener(event, unlockAudio));
            }).catch((error) => {
                // Auto-play failed (likely blocked by browser policy). 
                // We leave the listeners active to try again on the next interaction.
                // console.log("Autoplay attempt failed, waiting for stronger interaction:", error);
            });
        };

        interactionEvents.forEach(event => document.addEventListener(event, unlockAudio, { passive: true }));
    }

    // 5. Bubble Effect for Aquaman Style
    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');

        const size = Math.random() * 40 + 10 + 'px';
        bubble.style.width = size;
        bubble.style.height = size;

        bubble.style.left = Math.random() * 100 + 'vw';
        bubble.style.animation = `rise ${Math.random() * 4 + 4}s linear forwards`;

        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 8000);
    }

    setInterval(createBubble, 500);
});
