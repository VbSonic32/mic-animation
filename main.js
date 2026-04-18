document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("mic-canvas");
    const ctx = canvas.getContext("2d");
    
    const loadingScreen = document.getElementById("loading-screen");
    const loaderFill = document.getElementById("loader-fill");
    const progressBar = document.getElementById("progress-bar");

    const frameCount = 192;
    const currentFrame = index => (
        `frames_all/frame_${index.toString().padStart(4, '0')}.png`
    );

    const images = [];
    let loadedImages = 0;

    const preloadImages = () => {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedImages++;
                
                // Update loading bar
                const progress = (loadedImages / frameCount) * 100;
                loaderFill.style.width = `${progress}%`;
                
                if (loadedImages === frameCount) {
                    // All images loaded
                    setTimeout(() => {
                        loadingScreen.style.opacity = "0";
                        loadingScreen.style.visibility = "hidden";
                    }, 500); // Small delay for visual effect
                }
                
                // Initial draw when first image is loaded
                if (i === 1) {
                    drawImage(0);
                }
            };
            images.push(img);
        }
    };

    const drawImage = (index) => {
        index = Math.max(0, Math.min(images.length - 1, index));
        const img = images[index];
        if (!img || !img.complete || img.naturalWidth === 0) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate the scale to contain the image nicely preserving aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        
        ctx.drawImage(img, x, y, w, h);
    };

    const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawImage(lastDrawnIndex !== -1 ? lastDrawnIndex : 0);
    };

    window.addEventListener('resize', setCanvasSize);
    
    // Smooth scroll interpolation variables
    let currentIndex = 0;
    let targetIndex = 0;
    let lastDrawnIndex = -1;
    let scrollFraction = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
        
        if (maxScrollTop > 0) {
            scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
        } else {
            scrollFraction = 0;
        }

        // Update top progress bar
        progressBar.style.width = `${scrollFraction * 100}%`;
        
        // Update target index based on scroll
        targetIndex = Math.floor(scrollFraction * (frameCount - 1));
    });

    const updateCanvas = () => {
        // Interpolate current index towards target index for buttery smoothness
        currentIndex += (targetIndex - currentIndex) * 0.08;
        
        const roundedIndex = Math.round(currentIndex);
        
        // Only draw if index has changed visually
        if (roundedIndex !== lastDrawnIndex) {
            drawImage(roundedIndex);
            lastDrawnIndex = roundedIndex;
        }
        
        requestAnimationFrame(updateCanvas);
    };

    // Intersection observer for fading in text blocks
    const setupObservers = () => {
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    // Optional: remove visible class if we want to re-trigger on scroll up
                    // entry.target.classList.remove('visible'); 
                }
            });
        }, options);

        document.querySelectorAll('.text-block').forEach(block => {
            observer.observe(block);
        });
    };

    // Initialization
    preloadImages();
    setCanvasSize();
    updateCanvas();
    setupObservers();
});
