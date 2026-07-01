# tibhar940.github.io

Minimal personal website for GitHub Pages with three entry points:

- `/work` - professional page (default)
- `/life` - personal page
- `/balance` - easter-egg page

Custom domain: [asamoilov.eu](https://asamoilov.eu)

## Project Structure

- `work`, `life`, `balance` - primary pages (extensionless URLs)
- `work.html`, `life.html`, `balance.html` - redirect stubs for old `.html` links
- `index.html` - redirects `/` to `/work`
- `CNAME` - custom domain for GitHub Pages
- `assets/css/main.css` - shared styles
- `assets/js/site.config.js` - editable site data and links
- `assets/js/main.js` - config injection logic

## Update Content

Edit page content directly in:

- `work`
- `life`
- `balance`

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

- `https://asamoilov.eu/` (redirects to `/work`)
- `https://asamoilov.eu/work`
- `https://asamoilov.eu/life`
- `https://asamoilov.eu/balance`
- `https://tibhar940.github.io/work` (also works)

## Custom Domain Setup

Hosting stays on GitHub Pages. To connect `asamoilov.eu`:

1. Push the `CNAME` file in this repo (already contains `asamoilov.eu`).
2. In the repo: **Settings → Pages → Custom domain** → enter `asamoilov.eu` → Save.
3. At your domain registrar, add four **A records** for the apex domain (`@`):

| Type | Name | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

4. Wait for DNS check to pass in GitHub Settings (can take up to 48 hours).
5. Enable **Enforce HTTPS** once the certificate is issued.

Remove any conflicting DNS records (old hosting, parking pages) before adding the A records.
