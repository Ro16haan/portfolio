const canvas = document.querySelector("#field");
const ctx = canvas.getContext("2d");
const pointer = { x: 0, y: 0, active: false };
let dots = [];
let animationFrame = null;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(42, Math.min(92, Math.floor(window.innerWidth / 18)));
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    radius: 1 + Math.random() * 1.9,
  }));
}

function drawField() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  dots.forEach((dot) => {
    dot.x += dot.vx;
    dot.y += dot.vy;

    if (dot.x < -20) dot.x = window.innerWidth + 20;
    if (dot.x > window.innerWidth + 20) dot.x = -20;
    if (dot.y < -20) dot.y = window.innerHeight + 20;
    if (dot.y > window.innerHeight + 20) dot.y = -20;

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 243, 238, 0.35)";
    ctx.fill();
  });

  for (let i = 0; i < dots.length; i += 1) {
    for (let j = i + 1; j < dots.length; j += 1) {
      const a = dots[i];
      const b = dots[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 132) {
        ctx.strokeStyle = `rgba(245, 243, 238, ${0.08 * (1 - dist / 132)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    if (pointer.active) {
      const dot = dots[i];
      const dist = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);

      if (dist < 180) {
        ctx.strokeStyle = `rgba(216, 210, 200, ${0.25 * (1 - dist / 180)})`;
        ctx.beginPath();
        ctx.moveTo(dot.x, dot.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }
  }

  animationFrame = requestAnimationFrame(drawField);
}

function initField() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.remove();
    return;
  }

  resizeCanvas();
  drawField();
}

window.addEventListener("resize", () => {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  drawField();
});

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
});

window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll("section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a")];

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px" },
);

sections.forEach((section) => navObserver.observe(section));

document.querySelector(".copy-email").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const original = button.textContent;

  try {
    await navigator.clipboard.writeText(button.dataset.email);
    button.textContent = "Copied";
  } catch {
    button.textContent = button.dataset.email;
  }

  window.setTimeout(() => {
    button.textContent = original;
  }, 1800);
});

function initRollingTitle() {
  const title = document.querySelector("#hero-title");
  if (!title) return;

  const text = title.textContent.trim();
  title.innerHTML = "";

  const words = text.split(/\s+/);
  const trackLength = 12; // 11 random characters + 1 target character

  function getRandomChar(target) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "$#@%&*+-=";
    
    if (uppercase.includes(target)) {
      const pool = uppercase + numbers + symbols;
      return pool[Math.floor(Math.random() * pool.length)];
    } else if (lowercase.includes(target)) {
      const pool = lowercase + symbols;
      return pool[Math.floor(Math.random() * pool.length)];
    } else if (numbers.includes(target)) {
      return numbers[Math.floor(Math.random() * numbers.length)];
    } else {
      return symbols[Math.floor(Math.random() * symbols.length)];
    }
  }

  // Rebuild the heading structure
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "roll-word";

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const container = document.createElement("span");
      container.className = "roll-char-container";

      const placeholder = document.createElement("span");
      placeholder.className = "roll-char-placeholder";
      placeholder.textContent = char;
      container.appendChild(placeholder);

      const track = document.createElement("span");
      track.className = "roll-char-track";

      for (let k = 0; k < trackLength - 1; k++) {
        const charSpan = document.createElement("span");
        charSpan.textContent = getRandomChar(char);
        track.appendChild(charSpan);
      }

      const finalSpan = document.createElement("span");
      finalSpan.textContent = char;
      track.appendChild(finalSpan);

      container.appendChild(track);
      wordSpan.appendChild(container);
    }

    title.appendChild(wordSpan);

    if (wordIndex < words.length - 1) {
      title.appendChild(document.createTextNode(" "));
    }
  });

  // GSAP animation staggered by letter index
  const tracks = title.querySelectorAll(".roll-char-track");
  const tl = gsap.timeline({
    onComplete: () => {
      // Restore clean, semantic static text on completion of all animations
      title.textContent = text;
    }
  });

  tracks.forEach((track, index) => {
    tl.fromTo(
      track,
      { yPercent: 0 },
      {
        yPercent: -((trackLength - 1) / trackLength) * 100,
        duration: 1.0 + Math.random() * 0.20,
        ease: "power4.out",
        force3D: true
      },
      index * 0.04 // 40ms stagger per character
    );
  });
}

function runTransition() {
  const landingScreen = document.getElementById("landing-screen");
  const transitionOverlay = document.getElementById("transition-overlay");
  
  if (!landingScreen || !transitionOverlay) return;

  const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Make overlay visible only when transition runs
  transitionOverlay.style.display = "block";

  if (isReduced) {
    // Elegant fade transition
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove("portfolio-hidden");
        landingScreen.remove();
        transitionOverlay.remove();
        initRollingTitle();
      }
    });

    tl.to(landingScreen, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out"
    })
    .fromTo([".site-header", "main", ".site-footer"],
      { opacity: 0, visibility: "visible" },
      { opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.2"
    );
  } else {
    // Curved SVG transition
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.classList.remove("portfolio-hidden");
        landingScreen.remove();
        transitionOverlay.remove();
        initRollingTitle();
      }
    });

    // Fade out landing enter button directly
    tl.to(".enter-btn", {
      opacity: 0,
      y: -20,
      scale: 0.95,
      duration: 0.35,
      ease: "power2.out"
    });

    // Animate paths sweeping up
    const endPath = "M 0 0 L 100 0 L 100 0 Q 50 -50 0 0 Z";
    const pathSelectors = [
      ".path-navy",
      ".path-emerald",
      ".path-blue",
      ".path-indigo",
      ".path-purple"
    ];

    pathSelectors.forEach((selector, index) => {
      tl.to(selector, {
        attr: { d: endPath },
        duration: 0.9,
        ease: "power4.inOut"
      }, 0.1 + index * 0.05); // staggered starts
    });

    // Fade in the actual portfolio content in parallel as the curves sweep up
    tl.fromTo([".site-header", "main", ".site-footer"],
      { opacity: 0, visibility: "visible" },
      { opacity: 1, duration: 0.8, ease: "power2.out" },
      0.35
    );
  }
}

function initTransition() {
  const visited = sessionStorage.getItem("portfolio_visited") === "true";
  const landingScreen = document.getElementById("landing-screen");
  const transitionOverlay = document.getElementById("transition-overlay");

  if (visited) {
    // Return visit: skip landing screen and transition
    document.body.classList.remove("portfolio-hidden");
    if (landingScreen) landingScreen.remove();
    if (transitionOverlay) transitionOverlay.remove();
    initField();
    initRollingTitle();
  } else {
    // First visit: show landing page
    document.body.classList.add("portfolio-hidden");
    if (landingScreen) landingScreen.style.display = "flex";
    if (transitionOverlay) transitionOverlay.style.display = "none"; // Hide initially!

    initField();

    const enterBtn = document.getElementById("enter-btn");
    if (enterBtn) {
      enterBtn.addEventListener("click", () => {
        sessionStorage.setItem("portfolio_visited", "true");
        enterBtn.style.display = "none";
        runTransition();
      });
    }
  }
}

initTransition();
