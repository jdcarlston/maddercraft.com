const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const menu = yaml.load(fs.readFileSync(path.join(__dirname, "menu.yml"), "utf8"));

module.exports = {
  // Show each image's file name when you hover over it. Handy while choosing pieces; set to false to hide.
  showFileNames: false,
  name: "Madder Craft",
  url: "https://maddercraft.com",
  // true lets AI companies train their models on the site's writing as well as cite it in answers.
  // false keeps the site in AI answers but out of training (see robots.txt, made by lib/seo.js).
  allowAITraining: true,
  // Where the songs and video live (the Cloudflare R2 bucket "maddercraft-media").
  // File paths in _data/music.js are added to the end of this.
  media: "https://media.maddercraft.com",
  // false: images are served from this site (Netlify). true: from the media bucket.
  // Before turning this on, run `npm run media:images` and upload the `images` folder it makes
  // (in maddercraft-media-upload) to the bucket. See scripts/export-images.js.
  imagesFromMedia: true,
  description: "Visual art, music, poetry and ritual.",
  year: new Date().getFullYear(),
  // The main menu and footer links live in _data/menu.yml, so they can be edited in /admin.
  nav: menu.nav,
  elsewhere: menu.elsewhere,
};
