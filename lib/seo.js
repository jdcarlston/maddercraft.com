// Search engines and AI tools. The same file is in jdcarlston.com and maddercraft.com: each site
// calls it from eleventy.config.js with its own settings (who the site is about, what's on it).
//
// It adds:
//   - robots.txt    what crawlers may read (site.allowAITraining switches AI model training on or off)
//   - sitemap.xml   every public page, with dates where the page has one
//   - llms.txt      a plain-language map of the site for AI tools (llmstxt.org)
//   - {% structuredData %}   JSON-LD for the page <head>: who and what the page is (schema.org)
//   - offsite links open in a new tab, and screen readers hear "(opens in a new tab)"
//
// Settings (see the call in eleventy.config.js):
//   ownSite      a pattern for this site's own addresses (those links stay in the same tab)
//   people       { key: schema.org Person } — the people the site is about, by a short key
//   main         the key of the person (or organization) the site belongs to
//   organization optional schema.org Organization for a brand or business
//   pageNode(data, helpers)  returns the structured data for one page, or nothing
//   llms         { intro, sections: [{ heading, links(collections) => [{ title, url, note }] }] }

const NEW_TAB = " (opens in a new tab)";

function plain(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = function seo(eleventyConfig, opts) {
  const site = opts.site;
  const abs = (url) => new URL(url, site.url).href;
  const ref = (key) => ({ "@id": `${site.url}/#${key}` });

  // ---- Offsite links open in a new tab (every finished HTML page).
  eleventyConfig.addTransform("offsite-links", function (html) {
    if (!(this.page.outputPath || "").endsWith(".html")) return html;
    return html.replace(/<a\b([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi,
      (link, before, href, after, text) => {
        if (opts.ownSite.test(href)) return link;
        let attrs = (before + after).replace(/\s(target|rel)="[^"]*"/g, "");
        if (/aria-label="/.test(attrs)) {
          attrs = attrs.replace(/aria-label="([^"]*)"/, (m, label) =>
            `aria-label="${label.endsWith(NEW_TAB) ? label : label + NEW_TAB}"`);
        } else if (!text.includes(NEW_TAB)) {
          text += `<span class="sr-only">${NEW_TAB}</span>`;
        }
        return `<a href="${href}"${attrs.replace(/\s+$/, "")} target="_blank" rel="noopener">${text}</a>`;
      });
  });

  // ---- {% structuredData %} in the page <head>.
  eleventyConfig.addShortcode("structuredData", function (shareImage) {
    const data = { ...this.ctx, page: this.page };
    const graph = [
      ...Object.entries(opts.people).map(([key, p]) => ({ "@type": "Person", ...ref(key), ...p })),
      { "@type": "WebSite", ...ref("website"), name: site.name, url: site.url + "/", publisher: ref(opts.main) },
    ];
    if (opts.organization) graph.push({ "@type": "Organization", ...ref("org"), url: site.url + "/", ...opts.organization });
    const node = opts.pageNode(data, { abs, ref, plain, url: abs(this.page.url), image: shareImage });
    if (node) graph.push(...[].concat(node));
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
    return `<script type="application/ld+json">${json}</script>`;
  });

  // ---- robots.txt
  eleventyConfig.addTemplate("seo-robots.njk", `User-agent: *
Allow: /
Disallow: /admin/
{% if not site.allowAITraining %}
# AI model training: not allowed (allowAITraining is false in _data/site.js).
# AI answer and search crawlers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot) are still welcome.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
User-agent: meta-externalagent
Disallow: /
{% endif %}
Sitemap: {{ site.url }}/sitemap.xml
`, { permalink: "/robots.txt", eleventyExcludeFromCollections: true });

  // ---- sitemap.xml: every HTML page except the editor, thank-you pages and anything marked noindex.
  eleventyConfig.addTemplate("seo-sitemap.njk", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{%- for p in collections.all %}
{%- if p.url and p.outputPath.endsWith(".html") and not p.url.startsWith("/admin") and not p.data.noindex and p.url != "/404.html" %}
  <url><loc>{{ site.url }}{{ p.url }}</loc>{% if p.data.date or p.data.medium_url %}<lastmod>{{ p.date.toISOString().slice(0, 10) }}</lastmod>{% endif %}</url>
{%- endif %}
{%- endfor %}
</urlset>
`, { permalink: "/sitemap.xml", eleventyExcludeFromCollections: true });

  // ---- llms.txt
  eleventyConfig.addShortcode("llmsSections", function () {
    const collections = this.ctx.collections;
    return opts.llms.sections.map((s) =>
      `## ${s.heading}\n\n` + s.links(collections).map((l) =>
        `- [${plain(l.title)}](${abs(l.url)})${l.note ? ": " + plain(l.note) : ""}`).join("\n")
    ).join("\n\n");
  });
  eleventyConfig.addTemplate("seo-llms.njk", `# {{ site.name | safe }}

> {{ site.description | safe }}

${opts.llms.intro}

{% llmsSections %}
`, { permalink: "/llms.txt", eleventyExcludeFromCollections: true });
};
