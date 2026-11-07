# Ivory wedding invitation

Static React replica of https://ivoryweddinginvitation.vercel.app/.

## Run

npm install
npm run dev

## Build

npm run build
npm run preview

Deploy the contents of `dist/` to any static host. No server, API, or database is required.

## Customize

Edit `public/config.json` (or `dist/config.json` after building). It controls all invitation wording, names, dates, venues, calendar labels, countdown labels, theme colors, image/video/audio paths, and audio volume and looping. `wedding.iso` includes the event timezone for an accurate countdown worldwide; keep it consistent with the calendar date fields. Set `reception` to null to hide the secondary calendar marker. Add or remove entries in `events` as needed.

Replace files in `public/assets/` or update their paths in config. Media paths are relative so deployment in a subdirectory works. The original opening video's lettering is baked into the video/poster: replace those media files when changing that artwork. Google Fonts requires internet access; serif/cursive fallbacks are provided.

Directions use `directionsUrl`, with a Google Maps address search fallback. Replace the sample venue addresses before sharing. Audio begins on a user click due to browser autoplay policies; the floating music button toggles sound. Scratch with a pointer or focus the card and press Enter/Space to reveal it.

Reference assets and original styles/interactions were retrieved from the supplied site. Confirm permission to reuse its media before public distribution.

## Slideshow

The invitation displays one panel at a time without page scrolling. `slideshow.intervalMs` controls automatic advancement (default 8000 ms), and `slideshow.loop` controls whether the last panel returns to the first. Previous, Next, Pause/Play, and arrow keys provide manual control. Manual navigation resets the timer. Automatic advancement pauses while the browser tab is hidden or the scratch card is being scratched. All navigation labels are in the same config file.
