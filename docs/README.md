# Documentation

Reference material for the Mosaic Byte site. The two HTML documents are meant to be opened in a
browser — they are interactive, and the diagrams do not survive as plain text.

> **These two `.html` files do not render on github.com.** GitHub serves a
> `.html` file from a repository as plain text, so clicking `architecture.html`
> or `glossary.html` here shows the source, not the page.
>
> To read them: clone or download the repository and open the file from disk —
> they are self-contained, so double-clicking works. They are deliberately **not**
> published with the website; see the access note at the bottom of this file.

## Start here

- **`architecture.html`** — how the site is built. All 26 stack layers: what each one does in this
  codebase, why it was chosen, what was rejected, and what the choice costs. Includes an
  interactive diagram of the pipeline from a source edit through the five build steps and the CI
  gate to the visitor's browser. Every rationale is traceable to a file, a commit or a
  measurement; where the repo records no reason, it says so rather than inventing one.
- **`glossary.html`** — every technical term the project uses, defined in plain English, with a
  note on how each one shows up here specifically. Searchable, filterable by category, and
  cross-linked. Read it alongside `architecture.html` rather than before it.

## Research and planning

- `improvement-roadmap.md` — the deep-research audit findings and the P0/P1/P2 backlog.
- `github-pages-research.md` — why the Pages mirror 404'd on every URL, and the router fix. Still
  the best explanation of how GitHub Pages resolves a request.
- `competitive-edge.md` — positioning research behind the site's copy.
- `project-audit.md` — an early structural overview. Superseded by `architecture.html`.

## Elsewhere in the repo

- `../README.md` — stack table, project layout, commands, testing, performance gates.
- `../CLAUDE.md` — the operating notes and the running change log, including the detail behind
  each decision recorded in `architecture.html`.
- `../DEPLOY.md` — custom domain and DNS setup.

## Why these are not on the website

They were briefly published at `www.mosaicbyte.design/docs/` and have been taken
down: a GitHub Pages site is public to anyone with the URL, and restricting who
can view one requires GitHub Enterprise Cloud, which this organisation does not
have. `noindex` keeps a page out of search results; it does not keep anyone out.

So these documents are read from the repository rather than from a URL.
