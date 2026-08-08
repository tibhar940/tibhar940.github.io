(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  var canvas = document.createElement("canvas");
  canvas.id = "ambient-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var dpr = 1;
  var width = 0;
  var height = 0;
  var particles = [];
  var flashes = [];
  var nextFlashAt = 0;
  var rafId = 0;
  var running = false;
  var lastTs = 0;
  var time = 0;

  var LIGHT_HUES = [195, 168, 145, 32, 12, 210, 85];
  var DARK_HUES = [198, 172, 150, 38, 18, 215, 95];

  function isDark() {
    return document.documentElement.dataset.theme === "dark";
  }

  function bgColor(alpha) {
    if (isDark()) return "rgba(10, 12, 15, " + alpha + ")";
    return "rgba(242, 244, 248, " + alpha + ")";
  }

  function solidBg() {
    return isDark() ? "#0a0c0f" : "#f2f4f8";
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function particleCount() {
    var area = width * height;
    return Math.max(70, Math.min(180, Math.round(area / 12000)));
  }

  function makeParticle() {
    var hues = isDark() ? DARK_HUES : LIGHT_HUES;
    var hue = hues[Math.floor(Math.random() * hues.length)];
    var sat = isDark() ? 45 + Math.random() * 30 : 40 + Math.random() * 35;
    var light = isDark() ? 55 + Math.random() * 25 : 42 + Math.random() * 22;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.7 + Math.random() * 2.1,
      hue: hue,
      sat: sat,
      light: light,
      alpha: isDark() ? 0.28 + Math.random() * 0.42 : 0.22 + Math.random() * 0.38,
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.7,
      waveAmp: 0.35 + Math.random() * 1.1,
      waveFreq: 0.4 + Math.random() * 1.4,
      layer: Math.random(),
      twinkle: Math.random() * Math.PI * 2
    };
  }

  function seed() {
    particles = [];
    var n = particleCount();
    for (var i = 0; i < n; i++) particles.push(makeParticle());
    flashes = [];
    nextFlashAt = performance.now() + 1200 + Math.random() * 2400;
  }

  function flowAngle(x, y, t) {
    var nx = x / Math.max(width, 1);
    var ny = y / Math.max(height, 1);
    return (
      Math.sin((nx * 3.1 + t * 0.18) * Math.PI) * 0.9 +
      Math.cos((ny * 2.4 - t * 0.14) * Math.PI) * 0.7 +
      Math.sin((nx + ny) * 2.6 + t * 0.22) * 0.55 +
      Math.sin(t * 0.11 + nx * 6.0) * 0.35
    );
  }

  function spawnFlash(now) {
    flashes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      born: now,
      life: 500 + Math.random() * 700,
      size: 1.4 + Math.random() * 2.6
    });
    nextFlashAt = now + 1600 + Math.random() * 4200;
  }

  function drawFlash(f, now) {
    var age = (now - f.born) / f.life;
    if (age >= 1) return false;
    var fade = age < 0.18 ? age / 0.18 : age > 0.65 ? (1 - age) / 0.35 : 1;
    var r = f.size * (0.8 + fade);
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.globalAlpha = fade * (isDark() ? 0.85 : 0.7);
    ctx.fillStyle = isDark() ? "rgba(220, 235, 255, 0.55)" : "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isDark() ? "#eef5ff" : "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return true;
  }

  function tick(now) {
    if (!running) return;
    var dt = lastTs ? Math.min(34, now - lastTs) : 16;
    lastTs = now;
    time += dt * 0.001;

    ctx.fillStyle = bgColor(0.18);
    ctx.fillRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var angle = flowAngle(p.x, p.y, time * (0.55 + p.layer * 0.45) + p.phase);
      var step = p.speed * (0.55 + p.layer * 0.9) * (dt / 16);
      p.x += Math.cos(angle) * step + Math.sin(time * p.waveFreq + p.phase) * p.waveAmp * 0.15;
      p.y += Math.sin(angle) * step * 0.85 + Math.cos(time * (p.waveFreq * 0.8) + p.phase) * p.waveAmp * 0.12;

      if (p.x < -8) p.x = width + 8;
      if (p.x > width + 8) p.x = -8;
      if (p.y < -8) p.y = height + 8;
      if (p.y > height + 8) p.y = -8;

      var twinkle = 0.65 + 0.35 * Math.sin(time * 2.2 + p.twinkle);
      var alpha = p.alpha * twinkle;
      var glow = p.r * (1.8 + p.layer);

      ctx.beginPath();
      ctx.fillStyle =
        "hsla(" + p.hue + ", " + p.sat + "%, " + p.light + "%, " + alpha * 0.28 + ")";
      ctx.arc(p.x, p.y, glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle =
        "hsla(" + p.hue + ", " + Math.min(100, p.sat + 8) + "%, " + Math.min(92, p.light + 8) + "%, " + alpha + ")";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (now >= nextFlashAt) spawnFlash(now);
    var alive = [];
    for (var j = 0; j < flashes.length; j++) {
      if (drawFlash(flashes[j], now)) alive.push(flashes[j]);
    }
    flashes = alive;

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running || reducedMotion.matches) return;
    running = true;
    lastTs = 0;
    ctx.fillStyle = solidBg();
    ctx.fillRect(0, 0, width, height);
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  resize();
  seed();
  start();

  window.addEventListener("resize", function () {
    resize();
    seed();
    ctx.fillStyle = solidBg();
    ctx.fillRect(0, 0, width, height);
  });
  document.addEventListener("visibilitychange", onVisibility);
  reducedMotion.addEventListener("change", function () {
    if (reducedMotion.matches) {
      stop();
      ctx.clearRect(0, 0, width, height);
    } else {
      resize();
      seed();
      start();
    }
  });

  var themeObserver = new MutationObserver(function () {
    seed();
    ctx.fillStyle = solidBg();
    ctx.fillRect(0, 0, width, height);
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
