# SmartGate Entry - Presentation

This folder contains an HTML presentation that explains the app features and operation process.

## How to View

1. **Open in Browser**: Double-click `index.html` or open it in Chrome/Edge/Firefox
2. **Navigate**: Use ← → arrow keys or the on-screen ‹ › buttons to move between slides
3. **Print/Export**: Use Ctrl+P (Print) and save as PDF if needed

## Adding Screenshots

Each slide has a placeholder where you can add real screenshots of the app:

### Option 1: Replace placeholder text with image

1. Run the app (`npm run dev`)
2. Capture screenshots of each screen (e.g., Login, Security Dashboard, New Visitor, etc.)
3. Save screenshots in a `screenshots` folder inside `presentation/`
4. In `index.html`, replace the placeholder `<div>` with an image tag:

```html
<!-- Before -->
<div class="screenshot-placeholder">
    <span>📷 Add screenshot: Login page</span>
</div>

<!-- After -->
<div class="screenshot-placeholder">
    <img src="screenshots/login.png" alt="Login page">
</div>
```

### Option 2: Use browser DevTools to capture

1. Open app in Chrome
2. Press F12 → Cmd/Ctrl+Shift+P → type "Capture screenshot"
3. Save images to `presentation/screenshots/`

### Recommended Screenshots

| Slide | Suggested Screenshot |
|-------|----------------------|
| 1 | App home or logo |
| 2 | Role selector or login |
| 3 | Login page |
| 4 | Role selector (if different from 2) |
| 5 | Security dashboard home |
| 6 | New visitor form with photo capture button |
| 7 | Camera capture screen |
| 8 | Resident dashboard home |
| 9 | Pending approvals list |
| 10 | Invites / pre-approval form |
| 11 | Verify pass screen |
| 12 | Admin dashboard home |
| 13 | Superadmin dashboard |
| 14–15 | Flow diagram (optional) or related screen |
| 16 | Any feature screen |
| 17 | (Technical – no screenshot needed) |
| 18 | App in action |

## Folder Structure

```
presentation/
├── index.html       # Main presentation (open in browser)
├── README.md        # This file
└── screenshots/     # Add your screenshots here (optional)
```
