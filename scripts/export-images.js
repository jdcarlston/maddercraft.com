// Makes the web-sized copies of every image in assets/img, plus a copy of each original,
// laid out exactly as the site expects to find them in the media bucket:
//
//   ../maddercraft-media-upload/images/web/art-towhee-600.webp   (and -900, and -1920 for big ones)
//   ../maddercraft-media-upload/images/originals/art/towhee.jpg
//   ../maddercraft-media-upload/writing/images/<poem>/<picture>   (pictures inside poems and essays)
//
// Run it with `npm run media:images`, then upload the `images` folder to the bucket.
// It skips files that are already made, so re-running after adding a picture is quick.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { webName, originalName } = require("./image-names.js");

const SOURCE = "assets/img";
const OUT = path.join("..", "maddercraft-media-upload", "images");
const SKIP = ["ornament"];                                // small site graphics stay with the site
const WIDTHS = [600, 900];                                // the sizes the pages use
const EXTRA_WIDTHS = { "pleromic-nursery-art.jpg": [1920] }; // the home page's big background
const IMAGE = /\.(jpe?g|png|webp|gif)$/i;

function* imagesIn(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (!SKIP.includes(entry.name)) yield* imagesIn(full); }
    else if (IMAGE.test(entry.name)) yield full;
  }
}

async function main() {
  let made = 0;
  for (const file of imagesIn(SOURCE)) {
    const sitePath = "/" + file.split(path.sep).join("/"); // "/assets/img/art/towhee.jpg"

    const original = path.join(OUT, "originals", originalName(sitePath));
    if (!fs.existsSync(original)) {
      fs.mkdirSync(path.dirname(original), { recursive: true });
      fs.copyFileSync(file, original);
    }

    for (const width of [...WIDTHS, ...(EXTRA_WIDTHS[path.basename(file)] || [])]) {
      const target = path.join(OUT, "web", webName(sitePath, width));
      if (fs.existsSync(target)) continue;
      fs.mkdirSync(path.dirname(target), { recursive: true });
      await sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(target);
      made++;
    }
  }
  // Pictures inside poems and essays are copied as they are, keeping their folders.
  const WRITING = path.join("writing", "images");
  let copied = 0;
  for (const file of imagesIn(WRITING)) {
    const target = path.join(OUT, "..", file);              // ../maddercraft-media-upload/writing/images/...
    if (fs.existsSync(target)) continue;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(file, target);
    copied++;
  }
  console.log(`Done: ${made} new web copies in ${OUT}, ${copied} poem and essay pictures copied`);
}

main();
