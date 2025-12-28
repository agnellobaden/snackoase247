document.addEventListener('DOMContentLoaded', () => {
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
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // revealObserver.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Initial check for elements already in view
    const revealElements = document.querySelectorAll('.reveal, .offer-card, .glass-card, .info-section');
    revealElements.forEach(el => {
        el.classList.add('reveal'); // Ensure class is present
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
});
