const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Poems keep their line breaks exactly as written.
  eleventyConfig.setLibrary("md", markdownIt({ html: true, breaks: true, typographer: true }));

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("writing/images");
  eleventyConfig.ignores.add("README.md");

  const byDateDesc = (a, b) => b.date - a.date;
  eleventyConfig.addCollection("poems", (c) => c.getFilteredByGlob("poetry/*.md").sort(byDateDesc));
  eleventyConfig.addCollection("essays", (c) => c.getFilteredByGlob("essays/*.md").sort(byDateDesc));

  eleventyConfig.addFilter("monthYear", (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase());
  eleventyConfig.addFilter("longDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }));
  eleventyConfig.addFilter("year", (d) => new Date(d).getUTCFullYear());

  // First few lines of a poem's text, for previews.
  eleventyConfig.addFilter("openingLines", (html, n = 2) => {
    const text = String(html || "")
      .replace(/<figure[\s\S]*?<\/figure>/g, "")
      .replace(/<img[^>]*>/g, "")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<\/p>|<hr\s*\/?>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ");
    return text.split("\n").map((s) => s.trim()).filter((s) => s && !/^[*\s·]+$/.test(s)).slice(0, n).join("\n");
  });

  // First image in a page, for cards.
  eleventyConfig.addFilter("firstImage", (html) => {
    const m = String(html || "").match(/<img[^>]+src="([^"]+)"/);
    return m ? m[1] : "";
  });

  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("artTiles", (pieces) => pieces.map((p) => ({ src: "/assets/img/art/" + p.file, alt: p.alt, title: p.title, note: p.medium, w: 3, h: 4 })));
  eleventyConfig.addFilter("musicTiles", (rel) => rel.map((r) => ({ src: "/assets/img/music/" + r.file, alt: r.title + " album cover", title: r.title, note: r.note, w: r.w, h: r.h })));

  // Neighbours in a collection, for earlier/later links.
  eleventyConfig.addFilter("neighbors", (items, url) => {
    const i = items.findIndex((p) => p.url === url);
    return { later: i > 0 ? items[i - 1] : null, earlier: i >= 0 && i < items.length - 1 ? items[i + 1] : null };
  });

  return { dir: { input: ".", includes: "_includes", data: "_data", output: "_site" }, markdownTemplateEngine: false };
};
