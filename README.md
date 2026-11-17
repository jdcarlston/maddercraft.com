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
