# Voddy Dev Course

Standalone course app for learning the VOD Review Discord bot and web app.

## Open Directly

Open `index.html` in this folder.

## Run Locally

Double-click or run:

```powershell
.\Start Course.ps1
```

Or use any installed Node.js:

```powershell
node server.mjs
```

Then open:

```text
http://127.0.0.1:4177/
```

The app stores lesson progress in browser localStorage.

## GitHub Pages

This course can be hosted as a static GitHub Pages site. Upload these files to a repository and enable Pages from the repository settings.

Progress uses browser localStorage, so it is saved per browser, device, and site URL. Local progress and GitHub Pages progress are separate. The course does not need a backend unless you want cloud-synced progress later.

After hosting, open Course Settings and set your local VOD Review Tool path. That path is stored only in your browser.

Suggested Pages settings:

- Source: Deploy from a branch
- Branch: main
- Folder: / root

Files needed online:

- index.html
- styles.css
- app.js
- course-data.js
- README.md
- .nojekyll

Local-only helper files:

- server.mjs
- Start Course.ps1
