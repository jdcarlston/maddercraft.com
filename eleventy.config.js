const markdownIt = require("markdown-it");
const yaml = require("js-yaml");
const Image = require("@11ty/eleventy-img").default;
const site = require("./_data/site.js");
const { webName, originalName } = require("./scripts/image-names.js");

module.exports = function (eleventyConfig) {
  // Poems keep their line breaks exactly as written.
  eleventyConfig.setLibrary("md", markdownIt({ html: true, breaks: true, typographer: true }));

  if (site.imagesFromMedia) {
    // Pictures come from the media bucket, so only the site's own files are published here:
    // styles, scripts, the logo, icons, ornaments and the link-preview image.
    ["assets/site.css", "assets/js", "assets/img/ornament", "assets/img/logo.svg", "assets/img/logo-512.png",
     "assets/img/favicon.png", "assets/img/apple-touch-icon.png", "assets/img/share.jpg"]
      .forEach((p) => eleventyConfig.addPassthroughCopy(p));
  } else {
    eleventyConfig.addPassthroughCopy("assets");
  }
  // Pictures inside poems and essays. With `imagesFromMedia` on, they're served from the media bucket
  // at the same path (media.maddercraft.com/writing/images/...), so pages are rewritten to point there.
  if (site.imagesFromMedia) {
    eleventyConfig.addTransform("writingImagesFromMedia", (content, outputPath) =>
      outputPath && outputPath.endsWith(".html")
        ? content.replaceAll('"/writing/images/', `"${site.media}/writing/images/`)
        : content);
  } else {
    eleventyConfig.addPassthroughCopy("writing/images");
  }
  // Data files can be YAML (_data/*.yml), which the site editor at /admin can read and write.
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  // Page text written in Markdown in _data/pages/*.yml.
  // `markdown` turns a block of text into paragraphs; `markdownInline` is for one line (no <p> around it).
  const pageMd = markdownIt({ html: true });
  eleventyConfig.addFilter("markdown", (text) => pageMd.render(String(text || "")));
  eleventyConfig.addFilter("markdownInline", (text) => pageMd.renderInline(String(text || "")));

  eleventyConfig.addPassthroughCopy("admin"); // the site editor at /admin (see admin/config.yml)
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("_to_delete/**"); // old files waiting to be deleted
  eleventyConfig.ignores.add(".wtmp/**"); // temporary files some editors leave behind

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

  // Wraps each sentence in a "keep-together" span, so a sentence only breaks onto a new
  // line when it can't fit on one. Used for short introductions under page titles.
  const escapeHtml = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  eleventyConfig.addFilter("keepSentences", (text) =>
    String(text || "").split(/(?<=[.!?])\s+/)
      .map((sentence) => `<span class="keep-together">${escapeHtml(sentence)}</span>`).join(" "));

  // The full-size original of an image, for links that open a piece. From the media bucket when
  // `imagesFromMedia` is on in _data/site.js, otherwise from this site.
  eleventyConfig.addFilter("original", (path) =>
    site.imagesFromMedia && String(path).startsWith("/assets/img/") ? `${site.media}/images/originals/${originalName(path)}` : path);

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
    if (site.imagesFromMedia && path.startsWith("/assets/img/")) return `${site.media}/images/web/${webName(path, width)}`;
    const made = await Image("." + path, resizeOptions(width));  // site path -> file in this folder
    return made.webp[0].url;
  });

  // Looks up portfolio pieces by file name, keeping the order of the list given.
  // Used for the home page's `featured` list in _data/art.js. Unknown names are skipped.
  eleventyConfig.addFilter("piecesByFile", (pieces, files) =>
    files.map((file) => pieces.find((piece) => piece.file === file)).filter(Boolean));

  // The scrolling rows (_includes/row.njk) all take the same "tile" shape:
  //   { src, alt, title, note, name, w, h }  where w/h is the image's shape.
  // These filters turn art pieces, music releases and ritual photos into tiles.
  eleventyConfig.addFilter("artTiles", (pieces) =>
    pieces.map((piece) => {
      const src = "/assets/img/art/" + piece.file;
      return { src, alt: piece.alt, title: piece.title, note: piece.medium, name: fileName(src), w: 3, h: 4, href: piece.page };
    }));
  eleventyConfig.addFilter("musicTiles", (releases) =>
    releases.map((release) => {
      const src = "/assets/img/music/" + release.file;
      return { src, alt: release.title + " album cover", title: release.title, note: release.note, name: fileName(src), w: release.w, h: release.h };
    }));
  // Ritual photos (_data/ritual.yml → photos). A file name is looked for in assets/img/ritual/;
  // a full path (starting with /) is used as it is. w/h default to a 4:5 portrait when left out.
  eleventyConfig.addFilter("ritualTiles", (photos = []) =>
    photos.map((photo) => {
      const src = photo.file.startsWith("/") ? photo.file : "/assets/img/ritual/" + photo.file;
      return { src, alt: photo.alt, title: photo.title, note: photo.note, name: fileName(src), w: photo.w || 4, h: photo.h || 5 };
    }));

  // Neighbours in a collection, for earlier/later links.
  eleventyConfig.addFilter("neighbors", (items, url) => {
    const i = items.findIndex((p) => p.url === url);
    return { later: i > 0 ? items[i - 1] : null, earlier: i >= 0 && i < items.length - 1 ? items[i + 1] : null };
  });

  // Search engines and AI tools: robots.txt, sitemap.xml, llms.txt, structured data, and offsite links
  // opening in a new tab. The workings are in lib/seo.js (the same file jdcarlston.com uses).
  require("./lib/seo.js")(eleventyConfig, {
    site,
    ownSite: /^https?:\/\/([a-z0-9-]+\.)*maddercraft\.com(\/|$)/i,
    main: "jd",
    people: {
      jd: {
        name: "JD Carlston",
        alternateName: ["Roz Madder", "Rose Madder"],
        description: "Engineer, artist and ritualist: the person behind Madder Craft, the music of Rose Madder and the poetry of Roz Madder.",
        url: site.url + "/bio/",
        sameAs: ["https://jdcarlston.com", "https://www.red-thread-labs.com/about/jd/", "https://rozmadder.medium.com"],
      },
    },
    organization: { name: site.name, description: site.description, founder: { "@id": site.url + "/#jd" } },
    pageNode(data, { ref, plain, url, image }) {
      const date = data.page.date.toISOString().slice(0, 10);
      const where = data.page.inputPath;
      if (where.includes("/poetry/") && data.title) {
        return { "@type": "CreativeWork", genre: "Poetry", name: plain(data.title), author: ref("jd"), datePublished: date, url, isPartOf: { "@type": "CollectionPage", name: "Poetry", url: site.url + "/poetry/" } };
      }
      if (where.includes("/essays/") && data.title) {
        return { "@type": "BlogPosting", headline: plain(data.title), description: plain(data.description || data.subtitle), author: ref("jd"), publisher: ref("org"), datePublished: date, image, url, mainEntityOfPage: url };
      }
      if (where.includes("/projects/")) {
        return { "@type": "CreativeWork", name: plain(data.title), description: plain(data.description), creator: ref("jd"), image, url };
      }
      if (data.page.url === "/bio/") return { "@type": "ProfilePage", url, mainEntity: ref("jd") };
    },
    llms: {
      intro: "Madder Craft is the creative home of JD Carlston: visual art, sculpture and fiber work, the music of Rose Madder, the poetry of Roz Madder, essays, and ritual and ceremony. JD's relationship coaching and Practice Labs are at red-thread-labs.com; JD's engineering work is at jdcarlston.com.",
      sections: [
        { heading: "Main pages", links: () => site.nav.map((n) => ({ title: n.label, url: n.href })).concat(
          [{ title: "Contact", url: "/contact/" }]) },
        { heading: "Workshop: art and projects", links: (c) => (c.projects || []).map((p) => ({ title: p.data.title, url: p.url, note: p.data.description })) },
        { heading: "Essays", links: (c) => c.essays.map((p) => ({ title: p.data.title, url: p.url, note: p.data.description || p.data.subtitle })) },
        { heading: "Poetry", links: (c) => [{ title: `Poetry by Roz Madder (${c.poems.length} poems)`, url: "/poetry/" }] },
      ],
    },
  });

  return { dir: { input: ".", includes: "_includes", data: "_data", output: "_site" }, markdownTemplateEngine: false };
};
