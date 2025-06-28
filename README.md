# Site Blocker Chrome Extension

A Chrome extension that shows an overlay when visiting blocked websites. The extension runs completely locally and reads from a text file containing blocked domain names.

## Features

- ✅ Completely local - no external dependencies
- ✅ Reads blocked sites from `text/blocked-sites.txt`
- ✅ Beautiful overlay interface when blocked sites are visited
- ✅ Works with all websites
- ✅ Supports single-page applications (SPAs)

## Installation

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

2. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing this extension

3. **Verify Installation**
   - The extension should appear in your extensions list
   - You should see "Site Blocker Overlay" in the list

## Usage

### Adding/Removing Blocked Sites

1. Open `text/blocked-sites.txt`
2. Add or remove domain names (one per line)
3. Save the file
4. Reload the extension in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the "Site Blocker Overlay" extension

### Blocked Site Format

The `blocked-sites.txt` file should contain domain names, one per line:

```
example.com
blocked-site.org
another-site.net
```

### When a Site is Blocked

When you visit a blocked site, you'll see:
- A full-screen overlay
- The blocked URL displayed
- Options to go back or visit Google
- A message explaining the site is blocked

## File Structure

```
Chrome/
├── manifest.json              # Extension configuration
├── html/
│   └── overlay.html           # Overlay interface
├── scripts/
│   ├── content.js             # Content script (runs on web pages)
│   └── background.js          # Background service worker
├── text/
│   └── blocked-sites.txt      # List of blocked domains
└── README.md                  # This file
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension format)
- **Permissions**: `activeTab`, `storage`, `<all_urls>`
- **Content Script**: Runs on all pages to check for blocked sites
- **Overlay**: Full-screen iframe with modern UI design
- **Local Storage**: All blocked sites are stored locally in the text file

## Troubleshooting

### Extension Not Working
1. Check that the extension is enabled in `chrome://extensions/`
2. Verify `text/blocked-sites.txt` exists and contains valid domain names
3. Reload the extension after making changes to the blocked sites file

### Overlay Not Showing
1. Check the browser console for errors
2. Verify the domain is correctly listed in `blocked-sites.txt`
3. Make sure the domain format matches exactly (e.g., `example.com` not `www.example.com`)

### Permission Issues
- The extension needs access to all URLs to function properly
- This is normal and required for the blocking functionality

## Customization

You can customize the overlay by editing `html/overlay.html`:
- Change colors and styling in the `<style>` section
- Modify the message text
- Add additional buttons or functionality

## Security

- The extension runs completely locally
- No data is sent to external servers
- All blocked sites are stored in your local text file
- The extension only reads the blocked sites file and displays overlays 