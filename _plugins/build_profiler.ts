import { metrics, SpanStatusCode, trace } from "npm:@opentelemetry/api@1";
import type { Site } from "lume/core/site.ts";

/**
 * Plugin de profilage du build Lume avec OpenTelemetry.
 *
 * Instrumente le cycle de vie du build avec des spans OTel et des logs
 * structurés. Fonctionne sans collecteur (logs console), et exporte vers
 * un endpoint OTLP quand OTEL_DENO=true est activé.
 *
 * Usage minimal :
 *   deno task build          → logs console uniquement
 *
 * Avec collecteur local :
 *   deno task profile        → logs + export OTLP vers localhost:4318
 */
export default function buildProfiler() {
  return (site: Site): void => {
    const tracer = trace.getTracer("lumeprose", "1.0.0");
    const meter = metrics.getMeter("lumeprose", "1.0.0");

    const buildDuration = meter.createHistogram("lumeprose.build.duration", {
      description: "Durée du build Lume en millisecondes",
      unit: "ms",
    });

    const pagesTotal = meter.createCounter("lumeprose.build.pages", {
      description: "Nombre de pages générées par build",
    });

    const isServe = Deno.args.includes("-s");
    const mode = isServe ? "serve" : "production";

    // ── Build complet ──────────────────────────────────────────────────────

    let buildStart = 0;
    let buildSpan = tracer.startSpan("lume.noop"); // placeholder typé

    site.addEventListener("beforeBuild", () => {
      buildStart = performance.now();
      buildSpan = tracer.startSpan("lume.build", {
        attributes: { "build.mode": mode },
      });
      console.log(`[build] ▶  Build démarré  (mode: ${mode})`);
    });

    site.addEventListener("afterBuild", () => {
      const duration = performance.now() - buildStart;
      const pageCount = site.pages.length;

      buildSpan.setAttributes({
        "build.pages": pageCount,
        "build.duration_ms": Math.round(duration),
        "build.mode": mode,
      });
      buildSpan.setStatus({ code: SpanStatusCode.OK });
      buildSpan.end();

      buildDuration.record(duration, { "build.mode": mode });
      pagesTotal.add(pageCount, { "build.mode": mode });

      console.log(
        `[build] ✔  Build terminé  — ${pageCount} pages en ${
          duration.toFixed(0)
        }ms`,
      );
    });

    // ── Rechargement à chaud (mode serve) ─────────────────────────────────

    let updateStart = 0;

    site.addEventListener("beforeUpdate", (event) => {
      updateStart = performance.now();
      const files: string[] = (event as CustomEvent<{ files: Set<string> }>)
        .detail?.files
        ? [...(event as CustomEvent<{ files: Set<string> }>).detail.files]
        : [];
      console.log(
        `[build] ↺  Rebuild — ${files.length} fichier(s) modifié(s)${
          files.length ? `: ${files.join(", ")}` : ""
        }`,
      );
    });

    site.addEventListener("afterUpdate", () => {
      const duration = performance.now() - updateStart;
      console.log(`[build] ✔  Rebuild terminé en ${duration.toFixed(0)}ms`);
    });
  };
}
