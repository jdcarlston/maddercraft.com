// How images are named in the media bucket. Shared by the site build (eleventy.config.js)
// and the export script (export-images.js), so both always agree.
//
//   webName("/assets/img/art/towhee.jpg", 600)   -> "art-towhee-600.webp"   (in images/web/)
//   originalName("/assets/img/art/towhee.jpg")    -> "art/towhee.jpg"        (in images/originals/)
//
// The folder name goes first so two pictures with the same file name in different folders never clash.
const path = require("path");

function webName(sitePath, width) {
  const folder = path.basename(path.dirname(sitePath));        // "art", "modeling", "venus-hum", "img"
  const name = path.basename(sitePath, path.extname(sitePath)); // "towhee"
  return `${folder}-${name}-${width}.webp`;
}

function originalName(sitePath) {
  return sitePath.replace(/^\/assets\/img\//, "");
}

module.exports = { webName, originalName };
