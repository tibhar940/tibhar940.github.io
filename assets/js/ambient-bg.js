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
  var fractals = [];
  var sparks = [];
  var nextSparkAt = 0;
  var rafId = 0;
  var running = false;
  var lastTs = 0;

  function isDark() {
    return document.documentElement.dataset.theme === "dark";
  }

  function palette() {
    if (isDark()) {
      return {
        clear: "#0a0c0f",
        stroke: "rgba(143, 179, 255, 0.16)",
        strokeSoft: "rgba(190, 210, 240, 0.08)",
        spark: "rgba(230, 240, 255, 0.95)",
        sparkGlow: "rgba(160, 195, 255, 0.45)"
      };
    }
    return {
      clear: "#f2f4f8",
      stroke: "rgba(58, 95, 191, 0.13)",
      strokeSoft: "rgba(58, 95, 191, 0.06)",
      spark: "rgba(255, 255, 255, 0.95)",
      sparkGlow: "rgba(90, 130, 210, 0.4)"
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createFractal(i) {
    var side = i % 2 === 0 ? -1 : 1;
    return {
      x: width * (0.15 + Math.random() * 0.7),
      y: height * (0.12 + Math.random() * 0.76),
      size: Math.min(width, height) * (0.08 + Math.random() * 0.12),
      angle: Math.random() * Math.PI * 2,
      spin: side * (0.00012 + Math.random() * 0.00018),
      driftX: side * (0.008 + Math.random() * 0.018),
      driftY: (Math.random() - 0.5) * 0.02,
      depth: 4 + Math.floor(Math.random() * 2),
      branch: 0.58 + Math.random() * 0.12,
      spread: 0.42 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2
    };
  }

  function seed() {
    var count = width < 720 ? 3 : 5;
    fractals = [];
    for (var i = 0; i < count; i++) fractals.push(createFractal(i));
    sparks = [];
    nextSparkAt = performance.now() + 1800 + Math.random() * 3200;
  }

  function drawBranch(x, y, len, angle, depth, colors) {
    if (depth <= 0 || len < 2.5) return;
    var x2 = x + Math.cos(angle) * len;
    var y2 = y + Math.sin(angle) * len;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = depth > 2 ? colors.stroke : colors.strokeSoft;
    ctx.lineWidth = Math.max(0.4, depth * 0.35);
    ctx.stroke();

    var next = len * (0.62 + 0.04 * Math.sin(angle + depth));
    drawBranch(x2, y2, next, angle - 0.55, depth - 1, colors);
    drawBranch(x2, y2, next, angle + 0.55, depth - 1, colors);
    if (depth > 2) {
      drawBranch(x2, y2, next * 0.72, angle, depth - 2, colors);
    }
  }

  function drawFractal(f, t, colors) {
    var breathe = 1 + Math.sin(t * 0.00035 + f.phase) * 0.06;
    var size = f.size * breathe;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);
    ctx.globalAlpha = 0.85;
    for (var i = 0; i < 6; i++) {
      ctx.rotate((Math.PI * 2) / 6);
      drawBranch(0, 0, size * f.branch, -Math.PI / 2, f.depth, colors);
      drawBranch(0, 0, size * f.branch * 0.7, -Math.PI / 2 + f.spread, f.depth - 1, colors);
    }
    ctx.restore();
  }

  function spawnSpark(now) {
    sparks.push({
      x: Math.random() * width,
      y: Math.random() * height,
      born: now,
      life: 700 + Math.random() * 900,
      size: 1.2 + Math.random() * 2.4,
      rays: 4 + Math.floor(Math.random() * 3)
    });
    nextSparkAt = now + 2200 + Math.random() * 5500;
  }

  function drawSpark(s, now, colors) {
    var age = (now - s.born) / s.life;
    if (age >= 1) return false;
    var fade = age < 0.2 ? age / 0.2 : age > 0.7 ? (1 - age) / 0.3 : 1;
    var r = s.size * (0.7 + fade * 0.8);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.globalAlpha = fade * 0.9;
    ctx.fillStyle = colors.sparkGlow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.spark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < s.rays; i++) {
      var a = (i / s.rays) * Math.PI * 2;
      ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2);
      ctx.lineTo(Math.cos(a) * r * 2.4, Math.sin(a) * r * 2.4);
    }
    ctx.stroke();
    ctx.fillStyle = colors.spark;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return true;
  }

  function tick(now) {
    if (!running) return;
    var dt = lastTs ? Math.min(32, now - lastTs) : 16;
    lastTs = now;
    var colors = palette();

    ctx.fillStyle = colors.clear;
    ctx.fillRect(0, 0, width, height);

    for (var i = 0; i < fractals.length; i++) {
      var f = fractals[i];
      f.angle += f.spin * dt;
      f.x += f.driftX * (dt / 16);
      f.y += f.driftY * (dt / 16) + Math.sin(now * 0.0004 + f.phase) * 0.04;
      if (f.x < -f.size) f.x = width + f.size;
      if (f.x > width + f.size) f.x = -f.size;
      if (f.y < -f.size) f.y = height + f.size;
      if (f.y > height + f.size) f.y = -f.size;
      drawFractal(f, now, colors);
    }

    if (now >= nextSparkAt) spawnSpark(now);

    var alive = [];
    for (var j = 0; j < sparks.length; j++) {
      if (drawSpark(sparks[j], now, colors)) alive.push(sparks[j]);
    }
    sparks = alive;

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running || reducedMotion.matches) return;
    running = true;
    lastTs = 0;
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
})();
