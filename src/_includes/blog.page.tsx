import Base from "./base.page.tsx";
import { header } from "./header.ts";

export default (
  { content, title, description, search, showPostsList, bio, icon, url }: Lume.Data,
  helpers: Lume.Helpers,
) => {
  const posts = search
    .pages()
    .filter((page) => page.type !== "page")
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const tags = [...new Set(posts.map((page) => page.tags).flat())];

  return (
    <Base title={title || "title"} icon={icon} description={description} url={url}>
      {/* Styles inline pour le filtrage CSS-only par tag */}
      <style>{`.invisibility{display:none}.post{display:var(--display,flex)}${
        tags.map((tag) =>
          `#tag-${tag}:target~main .post:not([data-tag~="${tag}"])`
        ).join(",")
      }{--display:none}${
        tags.map((tag) => `#tag-${tag}:target~main .clear-filter`).join(",")
      }{display:block}`}</style>

      {/* Anchres invisibles pour le filtrage (aria-hidden pour les lecteurs d'écran) */}
      {tags.map((tag) => (
        <a
          class="invisibility"
          href={`#tag-${tag}`}
          id={`tag-${tag}`}
          aria-hidden="true"
          tabIndex={-1}
        >
        </a>
      ))}

      <header class="site-header">
        <h1 class="text-2xl font-bold">{title}</h1>
        {bio && <p class="bio">{bio}</p>}

        <nav aria-label="Navigation principale" class="site-nav">
          {[...Object.entries(header.nav), ["rss", "/feed.xml"]].map((
            [key, value],
            index,
          ) => (
            <>
              {index !== 0 && (
                <span class="nav-sep" aria-hidden="true">·</span>
              )}
              <a
                href={value as string}
                target={value.includes("http") ? "_blank" : "_self"}
                rel={value.includes("http") ? "noopener noreferrer" : undefined}
                aria-label={key === "rss" ? "Flux RSS" : undefined}
              >
                {key}
              </a>
            </>
          ))}
        </nav>

        <hr />
      </header>

      <main id="main-content" aria-label="Contenu principal">
        {content && (
          <section>
            <article class="md">
              {{ __html: content }}
            </article>
            {showPostsList && <hr />}
          </section>
        )}

        {showPostsList && (
          <section class="posts" aria-label="Liste des articles">
            <a href="#" class="clear-filter" aria-live="polite">
              ← Afficher tous les articles
            </a>
            {posts.map((page) => {
              // Calcul du temps de lecture
              const wordCount = (page.content as string || "")
                .replace(/<[^>]+>/g, "")
                .split(/\s+/)
                .filter(Boolean).length;
              const readingMin = Math.max(1, Math.ceil(wordCount / 200));

              return (
                <article class="post" data-tag={page.tags.join(" ")}>
                  <time
                    datetime={page.date.toISOString()}
                    class="post-date"
                  >
                    {helpers.date(page.date)}
                  </time>
                  <span class="flex-1 m-0">
                    <a href={page.url}>{page.title}</a>
                  </span>
                  <span
                    class="reading-time"
                    aria-label={`${readingMin} minute${readingMin > 1 ? "s" : ""} de lecture`}
                    title={`${readingMin} min de lecture`}
                  >
                    {readingMin} min
                  </span>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </Base>
  );
};
