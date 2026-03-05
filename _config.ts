import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import date from "lume/plugins/date.ts";
import sitemap from "lume/plugins/sitemap.ts";
import feed from "lume/plugins/feed.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";

import mila from "markdown-it-link-attributes";
import buildProfiler from "./_plugins/build_profiler.ts";

const site = lume({
  location: new URL("https://fbik.top"),
  src: "src",
  server: {
    port: 4173,
    debugBar: false,
  },
});

site.use(buildProfiler());
site.use(jsx());
site.use(date());
site.use(sitemap());
site.use(feed({
  output: ["./feed.xml"],
}));
site.use(slugifyUrls());
site.use(codeHighlight({
  theme: [{
    name: "github-dark-dimmed",
    cssFile: "/highlight.css",
    placeholder: "/* dark */",
  }, {
    name: "github",
    cssFile: "/highlight.css",
    placeholder: "/* light */",
  }],
}));

// Liens externes dans des nouveaux onglets
site.hooks.addMarkdownItPlugin(mila, {
  attrs: {
    target: "_blank",
    rel: "noopener noreferrer",
  },
});

// Lazy-loading sur toutes les images markdown (P6)
site.hooks.addMarkdownItRule("image_lazy", (md) => {
  const defaultRender = md.renderer.rules.image!;
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    token.attrSet("loading", "lazy");
    token.attrSet("decoding", "async");
    return defaultRender(tokens, idx, options, env, self);
  };
});

// Optimisations production uniquement
if (!Deno.args.includes("-s")) {
  site.use((await import("lume/plugins/lightningcss.ts")).default());
  site.use((await import("lume/plugins/purgecss.ts")).default({
    // Safelist : classes générées dynamiquement (tags, invisibility)
    safelist: {
      standard: [
        /^tag-/,
        "invisibility",
        "clear-filter",
        "reading-progress",
        "data-theme",
      ],
      deep: [/data-theme/],
    },
  }));
  site.use((await import("lume/plugins/minify_html.ts")).default());
}

site.add("_readme.md", "index.html");

// Nouveaux fichiers CSS (architecture modernisée)
site.add("public/tokens.css", "tokens.css");
site.add("public/base.css", "base.css");
site.add("public/components.css", "components.css");
site.add("public/prose.css", "prose.css");
site.add("public/highlight.css", "highlight.css");

// Fichiers statiques
site.add("public/theme.js", "theme.js");
site.add("public/favicon.ico", "favicon.ico");
site.add("public/prose.ico", "prose.ico");

// Backward compat : anciens fichiers CSS redirigés (au cas où)
// smol.css et smol-v2.css ne sont plus utilisés

export default site;
