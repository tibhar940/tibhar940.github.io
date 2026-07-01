(function () {
  var THEME_STORAGE_KEY = "theme";

  function isDarkTheme() {
    return document.documentElement.dataset.theme === "dark";
  }

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.dataset.theme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch (e) {}
  }

  function syncThemeToggle(button) {
    if (!button) return;
    var dark = isDarkTheme();
    button.setAttribute("aria-pressed", dark ? "true" : "false");
    button.setAttribute("aria-label", dark ? "Go to light theme" : "Go to dark theme");
    button.textContent = dark ? "Go Light" : "Go Dark";
  }

  var themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    syncThemeToggle(themeToggle);
    themeToggle.addEventListener("click", function () {
      applyTheme(!isDarkTheme());
      syncThemeToggle(themeToggle);
    });
  }

  var achievementsCarousel = document.querySelector("[data-achievements-carousel]");
  if (achievementsCarousel) {
    var track = achievementsCarousel.querySelector("[data-carousel-track]");
    var carouselViewport = achievementsCarousel.querySelector(".carousel-viewport");
    var slides = achievementsCarousel.querySelectorAll("[data-carousel-slide]");
    var prevBtn = achievementsCarousel.querySelector("[data-carousel-prev]");
    var nextBtn = achievementsCarousel.querySelector("[data-carousel-next]");
    var dotButtons = achievementsCarousel.querySelectorAll("[data-carousel-dot]");
    var liveRegion = achievementsCarousel.querySelector("[data-carousel-live]");
    var total = slides.length;
    var index = 0;

    function slideTitle(slideEl) {
      var heading = slideEl.querySelector("h3");
      return heading ? heading.textContent.trim() : "Slide";
    }

    function go(to) {
      index = ((to % total) + total) % total;
      if (track) {
        track.style.transform = "translateX(-" + index * 100 + "%)";
      }
      if (carouselViewport) {
        carouselViewport.scrollTop = 0;
      }
      slides.forEach(function (slideEl, i) {
        var hidden = i !== index;
        slideEl.setAttribute("aria-hidden", hidden ? "true" : "false");
        slideEl.setAttribute(
          "aria-label",
          slideTitle(slideEl) + ", slide " + (i + 1) + " of " + total
        );
      });
      dotButtons.forEach(function (dot) {
        var dotIdx = Number(dot.getAttribute("data-carousel-index"));
        var on = dotIdx === index;
        dot.setAttribute("aria-selected", on ? "true" : "false");
        if (on) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
      if (liveRegion) {
        liveRegion.textContent =
          "Slide " + (index + 1) + " of " + total + ": " + slideTitle(slides[index]);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        go(index - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        go(index + 1);
      });
    }
    dotButtons.forEach(function (dot) {
      dot.addEventListener("click", function () {
        go(Number(dot.getAttribute("data-carousel-index")));
      });
    });
    achievementsCarousel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index + 1);
      }
    });
    go(0);
  }

  var config = window.SITE_CONFIG || {};
  var socialClassMap = {
    telegram: "social-link--telegram",
    instagram: "social-link--instagram",
    facebook: "social-link--facebook",
    strava: "social-link--strava",
    wandrerearth: "social-link--wandrer"
  };

  var yearNode = document.querySelector("[data-current-year]");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  var cvLinks = document.querySelectorAll("[data-cv-link]");
  cvLinks.forEach(function (link) {
    if (!config.cvUrl) {
      link.setAttribute("aria-disabled", "true");
      link.classList.add("muted");
      link.removeAttribute("href");
      return;
    }
    link.setAttribute("href", config.cvUrl);
  });

  var ownerNodes = document.querySelectorAll("[data-owner-name]");
  ownerNodes.forEach(function (node) {
    if (config.ownerName) {
      node.textContent = config.ownerName;
    }
  });

  var roleNodes = document.querySelectorAll("[data-role]");
  roleNodes.forEach(function (node) {
    if (config.role) {
      node.textContent = config.role;
    }
  });

  var blogLink = document.querySelector("[data-blog-link]");
  if (blogLink && config.blogUrl) {
    blogLink.setAttribute("href", config.blogUrl);
  }

  var socialList = document.querySelector("[data-social-links]");
  if (socialList && Array.isArray(config.socialLinks)) {
    socialList.innerHTML = "";
    config.socialLinks.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "social-item";
      var a = document.createElement("a");
      var normalizedLabel = item.label.toLowerCase().replace(/[^a-z0-9]/g, "");
      a.className = "social-link " + (socialClassMap[normalizedLabel] || "");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      var badge = document.createElement("span");
      badge.className = "social-badge";
      badge.textContent = item.label
        .split(/[\s.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(function (part) {
          return part[0].toUpperCase();
        })
        .join("");

      var label = document.createElement("span");
      label.className = "social-label";
      label.textContent = item.label;

      a.appendChild(badge);
      a.appendChild(label);
      li.appendChild(a);
      socialList.appendChild(li);
    });
  }

  function parseYm(ymText) {
    if (ymText === "present") {
      var now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1 };
    }
    var parts = ymText.split("-");
    return { year: Number(parts[0]), month: Number(parts[1]) };
  }

  function monthIndex(ym) {
    return ym.year * 12 + (ym.month - 1);
  }

  function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
  }

  var gantt = document.querySelector("[data-gantt]");
  if (gantt) {
    var start = parseYm(gantt.getAttribute("data-range-start"));
    var end = parseYm(gantt.getAttribute("data-range-end"));
    var startIdx = monthIndex(start);
    var endIdx = monthIndex(end);
    var total = Math.max(1, endIdx - startIdx + 1);

    var bars = gantt.querySelectorAll(".gantt-bar");
    bars.forEach(function (bar) {
      var barStart = parseYm(bar.getAttribute("data-start"));
      var barEnd = parseYm(bar.getAttribute("data-end"));
      var barStartIdx = Math.max(startIdx, monthIndex(barStart));
      var barEndIdx = Math.min(endIdx, monthIndex(barEnd));
      var leftPct = ((barStartIdx - startIdx) / total) * 100;
      var widthPct = ((barEndIdx - barStartIdx + 1) / total) * 100;
      bar.style.left = leftPct + "%";
      bar.style.width = Math.max(widthPct, 1.6) + "%";
    });

    var axis = gantt.querySelector("[data-gantt-axis]");
    if (axis) {
      axis.innerHTML = "";
      var yearStart = start.year;
      var yearEnd = end.year;
      for (var year = yearStart; year <= yearEnd; year++) {
        if (year !== yearStart && year !== yearEnd && year % 2 !== 0) {
          continue;
        }
        var label = document.createElement("span");
        label.className = "gantt-year";
        label.textContent = String(year);
        var leftPct;
        if (year === yearStart) {
          leftPct = 0;
          label.classList.add("gantt-year--start");
        } else if (year === yearEnd) {
          leftPct = 100;
          label.classList.add("gantt-year--end");
        } else {
          var idx = monthIndex({ year: year, month: 1 });
          leftPct = ((idx - startIdx) / total) * 100;
        }
        label.style.left = clamp(leftPct, 0, 100) + "%";
        axis.appendChild(label);
      }
    }
  }

  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function extractVisibleChars(htmlText) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlText, "text/html");
    var main = doc.querySelector("main") || doc.body;
    if (!main) return 0;
    var nodes = main.querySelectorAll("script, style, noscript");
    nodes.forEach(function (node) {
      node.remove();
    });
    return normalizeText(main.textContent).length;
  }

  function renderCubes(container, count, variant) {
    if (!container) return;
    container.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var cube = document.createElement("span");
      cube.className = "cube cube--" + variant;
      cube.style.opacity = String(0.62 + Math.random() * 0.34);
      cube.style.transform = "translateY(" + (Math.random() * 2 - 1) + "px)";
      container.appendChild(cube);
    }
  }

  var balanceChart = document.querySelector("[data-balance-chart]");
  if (balanceChart) {
    var workField = document.querySelector('[data-cube-field="work"]');
    var lifeField = document.querySelector('[data-cube-field="life"]');
    var workMeta = document.querySelector('[data-balance-meta="work"]');
    var lifeMeta = document.querySelector('[data-balance-meta="life"]');
    var ratioNode = document.querySelector("[data-balance-ratio]");
    var fallbackNode = document.querySelector("[data-balance-fallback]");

    function applyBalanceFromCounts(workChars, lifeChars, fromSnapshot) {
      var totalChars = Math.max(1, workChars + lifeChars);
      var totalCubes = 220;
      var workCubes = Math.max(8, Math.round((workChars / totalChars) * totalCubes));
      var lifeCubes = Math.max(8, totalCubes - workCubes);

      renderCubes(workField, workCubes, "work");
      renderCubes(lifeField, lifeCubes, "life");

      if (workMeta) {
        workMeta.textContent = "Characters: " + workChars.toLocaleString();
      }
      if (lifeMeta) {
        lifeMeta.textContent = "Characters: " + lifeChars.toLocaleString();
      }
      if (ratioNode) {
        var line =
          "Work/Life ratio by text volume: " +
          (workChars / totalChars * 100).toFixed(1) +
          "% / " +
          (lifeChars / totalChars * 100).toFixed(1) +
          "%";
        if (fromSnapshot) {
          line += " (embedded snapshot — use HTTP server for live counts)";
        }
        ratioNode.textContent = line;
      }
      if (fallbackNode) {
        fallbackNode.hidden = !fromSnapshot;
        if (fromSnapshot) {
          fallbackNode.textContent =
            "Fetch to /work / /life is blocked in this context (common with file://). Showing cubes and ratio from an embedded character snapshot in site.config.js.";
        }
      }
    }

    Promise.all([fetch("/work"), fetch("/life")])
      .then(function (responses) {
        return Promise.all(
          responses.map(function (response) {
            if (!response.ok) {
              throw new Error("Fetch failed");
            }
            return response.text();
          })
        );
      })
      .then(function (pages) {
        applyBalanceFromCounts(extractVisibleChars(pages[0]), extractVisibleChars(pages[1]), false);
      })
      .catch(function () {
        var snap = config.balanceCharCounts;
        if (snap && typeof snap.work === "number" && typeof snap.life === "number") {
          applyBalanceFromCounts(snap.work, snap.life, true);
        } else {
          if (fallbackNode) {
            fallbackNode.hidden = false;
          }
          if (ratioNode) {
            ratioNode.textContent = "Ratio unavailable in current context.";
          }
        }
      });
  }
})();
