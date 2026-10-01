# Thought Clouds

A small static website that stores your written-out thoughts as little white clouds
floating in a sky. Each cloud shows the **question** you posed; clicking it opens the
full **answer** in an expanded reading view.

No build step, no frameworks — just HTML, CSS, and one small JavaScript file. It runs
anywhere static files can be served, and it's designed to be hosted free on **GitHub Pages**.

## Files

| File          | What it does                                                        |
|---------------|--------------------------------------------------------------------|
| `index.html`  | Page structure (header, cloud field, reading overlay)              |
| `styles.css`  | The sky, the clouds, and the reader styling                       |
| `app.js`      | Renders clouds, search, and a tiny built-in Markdown renderer      |
| `thoughts.js` | **Your content** — the list of thoughts (edit this)               |
| `.nojekyll`   | Tells GitHub Pages to serve the files as-is                        |

## Adding a new thought

Open `thoughts.js` and add an object to the `window.THOUGHTS` array:

```js
{
  question: "Short question shown on the cloud",
  date: "2026-10-01",            // optional — used to sort newest-first
  tags: ["topic", "another"],    // optional
  answer: `Paste the full answer here.

It accepts **Markdown**: ## headings, **bold**, *italic*, lists with -,
tables with | pipes |, and [links](https://example.com).`
}
```

Separate entries with a comma. Because `answer` uses backtick (`` ` ``) template
strings, you can paste multi-line Claude answers straight in. The only character to
watch for inside an answer is a literal backtick — escape it as `` \` `` if one appears.

Save the file and reload the page — the new cloud appears automatically.

## Previewing locally

Just open `index.html` in a browser (double-click it). Everything works from the
file system; no server required.

## Publishing on GitHub Pages

1. Create a new repository on GitHub (e.g. `thought-clouds`).
2. Upload these files to the repo root (via the web UI's **Add file → Upload files**,
   or with git):
   ```
   git init
   git add .
   git commit -m "Initial thought clouds site"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set the branch to `main` and the folder to `/ (root)`, then **Save**.
6. Wait a minute, then visit `https://<you>.github.io/<repo>/`.

> Tip: to use a bare `https://<you>.github.io/` URL, name the repository
> `<you>.github.io` instead.
