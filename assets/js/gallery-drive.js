// A&W Compressor & Mechanical Services — Gallery, live-loaded from Google Drive
//
// If assets/js/gallery-config.js has an API key and both folder IDs filled
// in, this replaces the static placeholder photos in the Gallery grid with
// whatever images currently sit in each Drive folder. Add a photo to the
// "Piping Installs" or "Compressor Installs" folder and it shows up on the
// site — no code changes needed.
//
// If the config isn't filled in yet, or the Drive API call fails for any
// reason, this quietly leaves the existing placeholder cards in place.

(function () {
  const CATEGORY_LABELS = { piping: 'Piping Install', compressor: 'Compressor Install' };

  document.addEventListener('DOMContentLoaded', () => {
    const cfg = window.GALLERY_DRIVE_CONFIG;
    const grid = document.querySelector('#galleryGrid');
    if (!grid || !cfg) return;

    const configured = cfg.apiKey && cfg.folders && cfg.folders.piping && cfg.folders.compressor;
    if (!configured) return;

    Promise.all([
      fetchFolderImages(cfg.folders.piping, cfg.apiKey),
      fetchFolderImages(cfg.folders.compressor, cfg.apiKey)
    ])
      .then(([piping, compressor]) => {
        if (!piping.length && !compressor.length) return; // empty folders — keep placeholders

        const cards = piping.map(f => cardHtml(f, 'piping'))
          .concat(compressor.map(f => cardHtml(f, 'compressor')))
          .join('');
        grid.innerHTML = cards;
      })
      .catch((err) => {
        console.error('Gallery: could not load photos from Google Drive, showing placeholders instead.', err);
      });
  });

  function fetchFolderImages(folderId, apiKey) {
    const q = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}` +
      `&fields=${encodeURIComponent('files(id,name)')}&pageSize=100&orderBy=createdTime desc`;

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Drive API error (${res.status}) for folder ${folderId}`);
        return res.json();
      })
      .then((data) => data.files || []);
  }

  function cardHtml(file, category) {
    const label = CATEGORY_LABELS[category] || 'Project';
    const title = escapeHtml(file.name.replace(/\.[a-z0-9]+$/i, ''));
    const src = `https://drive.google.com/thumbnail?id=${file.id}&sz=w800`;
    return `<div class="gallery-card" data-category="${category}">
      <div class="gallery-card-media"><img src="${src}" alt="${label} — ${title}" loading="lazy"></div>
      <div class="gallery-card-body"><span class="product-cat">${label}</span><h3>${title}</h3></div>
    </div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
