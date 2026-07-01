# tibhar940.github.io

Minimal personal website for GitHub Pages with three entry points:

- `/work` - professional page (default)
- `/life` - personal page
- `/balance` - easter-egg page

## Project Structure

- `work/index.html`, `life/index.html`, `balance/index.html` - primary pages (clean URLs `/work`, `/life`, `/balance`)
- `work.html`, `life.html`, `balance.html` - redirect stubs for old `.html` links
- `index.html` - redirects `/` to `/work`
- `assets/css/main.css` - shared styles
- `assets/js/site.config.js` - editable site data and links
- `assets/js/main.js` - config injection logic

## Update Content

Edit page content directly in:

- `work/index.html`
- `life/index.html`
- `balance/index.html`

## Update CV Link (Google Drive)

1. Open `assets/js/site.config.js`.
2. Update `cvUrl` value:

```js
cvUrl: "https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing"
```

All CV buttons are updated automatically from this single field.

## GitHub Pages

Repository name should be `tibhar940.github.io`.
After pushing to `main`, GitHub Pages serves the site at:

- `https://tibhar940.github.io/` (redirects to `/work`)
- `https://tibhar940.github.io/work`
- `https://tibhar940.github.io/life`
- `https://tibhar940.github.io/balance`
