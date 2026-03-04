/* Theme toggle — LumeProse (anti-FOUC inline, ~15 lignes) */
(function () {
  const stored = localStorage.getItem("theme");
  const prefersDark = globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.setAttribute("aria-label", theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre");
    btn.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      btn.setAttribute("aria-label", next === "dark" ? "Passer en mode clair" : "Passer en mode sombre");
    });
  });
})();
