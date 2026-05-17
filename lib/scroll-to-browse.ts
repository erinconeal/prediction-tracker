/** Scrolls the browse forecasts section into view (home dashboard). */
export function scrollBrowseForecastsIntoView(): void {
  const el = document.getElementById("forecasts-heading");
  if (!el || typeof el.scrollIntoView !== "function") return;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  el.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
}
