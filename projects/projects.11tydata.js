// Settings shared by every project page in this folder: the pieces listed in the Workshop.
// `order` sets their place in the Workshop list and `status` is the short note on each card.
// Each project is a markdown file: its text is the page, and `photos` in its header is the gallery.
// Photos live in /assets/img/projects/<file name of the project>/.
module.exports = {
  layout: "project.njk",
  tags: "projects",
  permalink: (data) => `/workshop/${data.page.fileSlug}/`,
};
