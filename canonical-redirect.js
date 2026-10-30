// The GitHub Pages copy is kept as an entry point; the public CV lives on punchenko.de.
if (location.hostname === 'jenyaukraine.github.io' && location.pathname.startsWith('/my-cv/')) {
  const path = location.pathname.slice('/my-cv'.length);
  location.replace(`https://punchenko.de${path}${location.search}${location.hash}`);
}
