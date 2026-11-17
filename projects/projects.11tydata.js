// Settings shared by every project page in this folder (Windward Weave, and later others).
// Each project is a markdown file: its text is the page, and `photos` in its header is the gallery.
// Photos live in /assets/img/projects/<file name of the project>/.
module.exports = {
  layout: "project.njk",
  tags: "projects",
  permalink: (data) => `/art/${data.page.fileSlug}/`,
};
