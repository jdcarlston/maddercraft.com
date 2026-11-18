module.exports = {
  // Show each image's file name when you hover over it. Handy while choosing pieces; set to false to hide.
  showFileNames: false,
  name: "Madder Craft",
  url: "https://maddercraft.com",
  // Where the songs and video live (the Cloudflare R2 bucket "maddercraft-media").
  // File paths in _data/music.js are added to the end of this.
  media: "https://media.maddercraft.com",
  // false: images are served from this site (Netlify). true: from the media bucket.
  // Before turning this on, run `npm run media:images` and upload the `images` folder it makes
  // (in maddercraft-media-upload) to the bucket. See scripts/export-images.js.
  imagesFromMedia: true,
  description: "Visual art, music, poetry and ritual.",
  year: new Date().getFullYear(),
  // The main menu. An item with `children` gets a sub-menu: it drops down on hover with a mouse,
  // and on phones the sub-items sit right after it in the menu.
  nav: [
    // Each item jumps to its section on the Ritual page (ritual.njk).
    { label: "Ritual", href: "/ritual/", children: [
      { label: "Ceremonies", href: "/ritual/#ceremonies" },
      { label: "Workshops & Labs", href: "/ritual/#workshops-labs" },
      { label: "Coaching", href: "/ritual/#coaching" },
      { label: "Practice Labs", href: "/ritual/#practice-labs" },
      { label: "NLP", href: "/ritual/#nlp" },
      { label: "Esoterica", href: "/ritual/#esoterica" },
      { label: "Events", href: "/ritual/#events" },
    ] },
    // Workshop lists every page in /projects, in their `order`. Add a project there and add it here too.
    { label: "Workshop", href: "/workshop/", children: [
      { label: "Windward Weave", href: "/workshop/windward-weave/" },
      { label: "Venus Hum", href: "/workshop/venus-hum/" },
      { label: "Pleromic Nursery", href: "/workshop/pleromic-nursery/" },
      { label: "The Whores Grimoire", href: "/workshop/whores-grimoire/" },
      { label: "Neuroattractive", href: "/workshop/neuroattractive/" },
    ] },
    { label: "Gallery", href: "/art/", children: [
      { label: "Creations", href: "/art/#creations" },
      { label: "Modeling", href: "/modeling/" },
    ] },
    // Each song links to its release on the Music page (the ids come from the release titles).
    { label: "Music", href: "/music/", children: [
      { label: "Ringsies", href: "/music/#ringsies" },
      { label: "Bone Mother", href: "/music/#bone-mother" },
      { label: "On Our Side", href: "/music/#on-our-side" },
      { label: "OHM (preview)", href: "/music/#pleromic-nursery" },
    ] },
    { label: "Writing", href: "/poetry/", children: [
      { label: "Poetry", href: "/poetry/" },
      { label: "Essays", href: "/essays/" },
    ] },
    { label: "About", href: "/bio/", children: [
      { label: "Bio", href: "/bio/" },
      { label: "Contact", href: "/contact/" },
      { label: "Red Thread Labs", href: "/red-thread-labs/" },
      { label: "Engineering Leadership", href: "/engineering/" },
    ] },
  ],
  elsewhere: [
    { label: "SoundCloud", href: "https://m.soundcloud.com/r0zm4ddr" },
    { label: "Red Thread Labs", href: "https://red-thread-labs.com" },
    { label: "JD Carlston", href: "https://jdcarlston.com" },
  ],
};
