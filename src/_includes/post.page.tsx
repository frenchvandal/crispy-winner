import Base from "./base.page.tsx";

interface Author {
  name?: string;
  link?: string;
}

export default (
  {
    content,
    title,
    date,
    tags,
    description,
    footer,
    update,
    icon,
    author,
    url,
  }:
    & Lume.Data
    & { author: Author[] },
  helpers: Lume.Helpers,
) => {
  // Calcul du temps de lecture (P5)
  const wordCount = (content as string || "")
    .replace(/<[^>]+>/g, "")
    .split(/\s+/)
    .filter(Boolean).length;
  const readingMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Base
      title={title || "Sans titre"}
      isPost={true}
      icon={icon}
      description={description}
      url={url}
      date={date}
    >
      {/* Barre de progression de lecture (P5 — CSS only) */}
      <div class="reading-progress" aria-hidden="true" />

      <header class="post-header">
        <h1>{title}</h1>

        <div class="post-meta">
          <time datetime={date.toISOString()}>
            {helpers.date(date)}
          </time>
          <span aria-hidden="true">·</span>
          {author.map((a, i) => (
            <>
              <a
                href={a.link || "/"}
                target={a.link?.includes("http") ? "_blank" : "_self"}
                rel={a.link?.includes("http") ? "noopener noreferrer" : undefined}
              >
                {a.name || "anonyme"}
              </a>
              {i < author.length - 1 && <span aria-hidden="true">,</span>}
            </>
          ))}
          <span aria-hidden="true">·</span>
          <span
            class="reading-time"
            aria-label={`${readingMin} minute${readingMin > 1 ? "s" : ""} de lecture`}
          >
            {readingMin} min
          </span>
        </div>

        {description && description !== "" && (
          <blockquote class="post-description">
            {description}
          </blockquote>
        )}

        <hr />
      </header>

      <main aria-label="Contenu de l'article">
        <article class="md">
          {{ __html: content }}

          <div class="tags" aria-label="Tags de l'article">
            {tags.map((tag) => (
              <code class="pill tag">
                <a href={`/blog/#tag-${tag}`} aria-label={`Articles tagués ${tag}`}>
                  {`#${tag}`}
                </a>
              </code>
            ))}
          </div>

          <div id="last-updated">
            Mis à jour le{" "}
            <time datetime={new Date(update || date).toISOString()}>
              {helpers.date(update || date)}
            </time>
          </div>

          {footer && footer !== "" && (
            <div id="post-footer">
              <hr />
              {{ __html: helpers.md(footer) }}
            </div>
          )}
        </article>
      </main>
    </Base>
  );
};
