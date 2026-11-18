const markdownIt = require("markdown-it");
const Image = require("@11ty/eleventy-img").default;

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
  // For writing where only the month is known: "August 2014".
  eleventyConfig.addFilter("monthLongYear", (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }));
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

  // Whether a menu item, or one of its sub-items, is the page being shown, so the menu can highlight it.
  // Links to a spot on a page (like "/#ritual") never count as the current page.
  const isCurrent = (item, url) =>
    (!item.href.includes("#") && url.startsWith(item.href)) ||
    (item.children || []).some((child) => isCurrent(child, url));
  eleventyConfig.addFilter("isCurrent", isCurrent);

  // Sorts pages by the `order` number in their header; pages without one go last.
  eleventyConfig.addFilter("byOrder", (pages) =>
    [...(pages || [])].sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999)));

  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  // A file's name without its folder or extension: "/assets/img/art/towhee.jpg" -> "towhee".
  const fileName = (path) => String(path).split("/").pop().replace(/\.[^.]+$/, "");
  eleventyConfig.addFilter("fileName", fileName);

  // Web-sized copies of images, so tiles and galleries don't download full-size originals.
  //   {{ "/assets/img/art/towhee.jpg" | resized }}       -> a 600px-wide WebP copy (tiles)
  //   {{ "/assets/img/art/towhee.jpg" | resized(900) }}  -> wider, for galleries and features
  // The originals are untouched; links that open a piece still point at the full-size file.
  // Copies are made during the build into _site/img/ and named after the original, e.g.
  // /img/art-towhee-600.webp. An image already smaller than the width is not enlarged.
  // Anything that isn't a local site path (an empty value or an outside URL) is passed through.
  const resizeOptions = (width) => ({
    widths: [width],
    formats: ["webp"],
    outputDir: "./_site/img/",
    urlPath: "/img/",
    filenameFormat: (id, src, w, format) => {
      const folder = src.split("/").slice(-2, -1)[0];
      return folder + "-" + fileName(src) + "-" + w + "." + format;
    },
  });
  eleventyConfig.addAsyncFilter("resized", async (path, width = 600) => {
    if (!path || !String(path).startsWith("/")) return path;
    const made = await Image("." + path, resizeOptions(width));  // site path -> file in this folder
    return made.webp[0].url;
  });

  // Looks up portfolio pieces by file name, keeping the order of the list given.
  // Used for the home page's `featured` list in _data/art.js. Unknown names are skipped.
  eleventyConfig.addFilter("piecesByFile", (pieces, files) =>
    files.map((file) => pieces.find((piece) => piece.file === file)).filter(Boolean));

  // The scrolling rows (_includes/row.njk) all take the same "tile" shape:
  //   { src, alt, title, note, name, w, h }  where w/h is the image's shape.
  // These two filters turn art pieces and music releases into tiles.
  eleventyConfig.addFilter("artTiles", (pieces) =>
    pieces.map((piece) => {
      const src = "/assets/img/art/" + piece.file;
      return { src, alt: piece.alt, title: piece.title, note: piece.medium, name: fileName(src), w: 3, h: 4 };
    }));
  eleventyConfig.addFilter("musicTiles", (releases) =>
    releases.map((release) => {
      const src = "/assets/img/music/" + release.file;
      return { src, alt: release.title + " album cover", title: release.title, note: release.note, name: fileName(src), w: release.w, h: release.h };
    }));

  // Neighbours in a collection, for earlier/later links.
  eleventyConfig.addFilter("neighbors", (items, url) => {
    const i = items.findIndex((p) => p.url === url);
    return { later: i > 0 ? items[i - 1] : null, earlier: i >= 0 && i < items.length - 1 ? items[i + 1] : null };
  });

  return { dir: { input: ".", includes: "_includes", data: "_data", output: "_site" }, markdownTemplateEngine: false };
};
