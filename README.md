# tibhar940.github.io

Minimal personal website for GitHub Pages with three entry points:

- `/life` - personal page
- `/work` - professional page
- `/balance` - easter-egg page

## Project Structure

- `life.html`, `work.html`, `balance.html` - primary pages
- `life`, `work`, `balance` - extensionless URL redirect helpers
- `assets/css/main.css` - shared styles
- `assets/js/site.config.js` - editable site data and links
- `assets/js/main.js` - config injection logic

## Update Content

Edit page content directly in:

- `life.html`
- `work.html`
- `balance.html`

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

- `https://tibhar940.github.io/life`
- `https://tibhar940.github.io/work`
- `https://tibhar940.github.io/balance`
