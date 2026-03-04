import Footer from "./footer.page.tsx";

export default (
  {
    title,
    children,
    isPost,
    icon: avatar,
    description,
    url,
    date,
  }: {
    title: string;
    children: JSX.Children;
    isPost?: boolean;
    icon?: string;
    description?: string;
    url?: string;
    date?: Date;
  },
) => {
  const siteUrl = "https://fbik.top";
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;
  const metaDescription = description || title;
  const ogImage = `${siteUrl}/favicon.ico`;

  return (
    <>
      {{ __html: "<!DOCTYPE html>" }}
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#0969da" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)" />

          {/* Anti-FOUC : applique le thème avant le premier rendu */}
          <script>{`(function(){var s=localStorage.getItem("theme"),d=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",s||(d?"dark":"light"));})()`}</script>

          {/* Feuilles de style — toujours chargées */}
          <link rel="stylesheet" href="/tokens.css" />
          <link rel="stylesheet" href="/base.css" />
          <link rel="stylesheet" href="/components.css" />

          {/* Feuilles de style — conditionnelles */}
          {isPost && <link rel="stylesheet" href="/prose.css" />}
          {isPost && <link rel="stylesheet" href="/highlight.css" />}

          {/* SEO — Métadonnées de base */}
          <title>{title}</title>
          <meta name="description" content={metaDescription} />
          <link rel="canonical" href={pageUrl} />

          {/* SEO — Open Graph */}
          <meta property="og:type" content={isPost ? "article" : "website"} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={pageUrl} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:site_name" content="FBIK." />
          {isPost && date && (
            <meta
              property="article:published_time"
              content={date.toISOString()}
            />
          )}

          {/* SEO — Twitter Card */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={ogImage} />

          {/* Favicon */}
          <link rel="icon" href={avatar || "/favicon.ico"} />

          {/* RSS */}
          <link
            rel="alternate"
            type="application/rss+xml"
            title="RSS Feed"
            href="/feed.xml"
          />
        </head>
        <body>
          {/* Skip link (P0 — accessibilité) */}
          <a href="#main-content" class="skip-link">
            Aller au contenu principal
          </a>

          {children}

          <Footer />

          {/* Toggle thème dark/light (P5) */}
          <button
            id="theme-toggle"
            class="theme-toggle"
            aria-label="Changer le thème"
            type="button"
          >
            <span class="icon-sun" aria-hidden="true">☀</span>
            <span class="icon-moon" aria-hidden="true">☽</span>
          </button>

          {/* Script toggle — chargé en fin de body */}
          <script src="/theme.js" defer></script>
        </body>
      </html>
    </>
  );
};
