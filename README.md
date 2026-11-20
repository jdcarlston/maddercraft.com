# maddercraft.com

Eleventy site for Madder Craft: visual art, Rose Madder music, poetry, essays, and ritual.

## Run it
- `npm install` once, then `npm start` for a local preview at http://localhost:8080
- `npm run build` writes the finished site to `_site/`

## Where things live
- `_data/art.js`: the portfolio, in display order. Add a `title` and `medium` to a piece to caption it.
- `_data/music.js`: Rose Madder releases and performance photos.
- `poetry/*.md`: one file per poem (imported from Medium). Images are in `writing/images/`.
- `essays/*.md`: the essays.
- `index.njk`: the home page, including the Ritual & Ceremony text.
- `assets/site.css`: colors, fonts and layout. `assets/img/`: logo, borders, art.

Hosted on Netlify: build `npm run build`, publish `_site`.

## Site editor (/admin)

Every page's words, the lists (gallery, music, fashion photos, ritual events, contact form, menu),
and the poems, essays and Workshop projects can be edited in a browser with Sveltia CMS, the same
editor as red-thread-labs.com. What it can edit is set in `admin/config.yml`.

The words live in `_data/pages/<page>.yml` and the lists in `_data/*.yml`; the `.njk` files hold
the page designs and read from them.

- **On your Mac:** run `npm start`, open http://localhost:8080/admin/ in Chrome or Edge,
  choose **Work with Local Repository** and pick this folder. Saving writes the files here;
  commit and push as usual.
- **On the live site:** go to /admin/ and choose **Sign In Using Access Token** with a
  GitHub personal access token.
