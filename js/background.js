export function initBackground() {
  const lights = document.querySelectorAll(".cursor-light");
  if (!lights.length) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  let lastMoveTime = Date.now();

  // Animation loop
  function animate() {
    const now = Date.now();

    // ✅ Idle mode → si pas de mouvement depuis 3s
    if (now - lastMoveTime > 3000) {
      const idleX = window.innerWidth / 2 + Math.sin(now / 2000) * 80;
      const idleY = window.innerHeight / 2 + Math.cos(now / 2500) * 80;
      targetX = idleX;
      targetY = idleY;
    }

    // Interpolation fluide
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    lights.forEach((light, i) => {
      const offset = i * 25; // décalage progressif entre halos
      light.style.transform = `translate(${currentX - 200 + offset}px, ${
        currentY - 200 + offset
      }px)`;
    });

    requestAnimationFrame(animate);
  }

  // Capture mouvement souris
  document.addEventListener("mousemove", (e) => {
    targetX = e.pageX;
    targetY = e.pageY;
    lastMoveTime = Date.now(); // reset idle timer
  });

  // ✅ Mobile → désactive halos
  if ("ontouchstart" in window) {
    lights.forEach((l) => (l.style.display = "none"));
  }

  animate();
}
