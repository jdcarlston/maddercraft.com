module.exports = { layout: "essay.njk", permalink: (data) => `/essays/${data.page.fileSlug.replace(/-2$/, "")}/` };
