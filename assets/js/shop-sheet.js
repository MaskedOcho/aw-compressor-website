// A&W Compressor & Mechanical Services — Shop catalog, live-loaded from a
// published Google Sheet.
//
// If assets/js/shop-config.js has a csvUrl filled in, this replaces the
// built-in product cards and filter chips on the Shop page with whatever
// rows currently exist in that sheet. Add a row, it shows up on the site.
// Delete a row (or set its "Active" column to "no"), it disappears.
//
// If the config isn't filled in, the sheet is unreachable, or a row is
// missing a Category or Product Name, this quietly leaves the existing
// built-in products in place — nothing on the page breaks.

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const cfg = window.SHOP_SHEET_CONFIG;
    const grid = document.querySelector('#shopGrid');
    const filters = document.querySelector('#shopFilters');
    if (!grid || !filters || !cfg || !cfg.csvUrl) return;

    fetch(cfg.csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Sheet fetch failed (' + res.status + ')');
        return res.text();
      })
      .then((csvText) => {
        const rows = parseCsv(csvText);
        if (rows.length < 2) return; // header only, or empty — keep built-in products

        const header = rows[0].map((h) => h.trim().toLowerCase());
        const iCategory = header.indexOf('category');
        const iName = header.indexOf('product name');
        const iPart = header.indexOf('part number');
        const iBadge = header.indexOf('badge');
        const iImage = header.indexOf('image url');
        const iIcon = header.indexOf('icon');
        const iActive = header.indexOf('active');

        if (iCategory === -1 || iName === -1) return; // required columns missing

        const usedIds = {};
        const seenCategories = {};
        const categories = [];
        const cardsHtml = [];

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row.length) continue;

          const category = (row[iCategory] || '').trim();
          const name = (row[iName] || '').trim();
          if (!category || !name) continue;

          const activeCell = iActive === -1 ? '' : (row[iActive] || '').trim();
          if (/^(no|n|false|0)$/i.test(activeCell)) continue;

          const part = iPart === -1 ? '' : (row[iPart] || '').trim();
          const badge = iBadge === -1 ? '' : (row[iBadge] || '').trim();
          const image = iImage === -1 ? '' : (row[iImage] || '').trim();
          const icon = (iIcon === -1 ? '' : (row[iIcon] || '').trim()) || '⚙️';

          const catSlug = slugify(category);
          if (!seenCategories[catSlug]) {
            seenCategories[catSlug] = true;
            categories.push({ slug: catSlug, label: category });
          }

          let id = catSlug + '-' + slugify(name);
          let suffix = 2;
          while (usedIds[id]) {
            id = catSlug + '-' + slugify(name) + '-' + suffix++;
          }
          usedIds[id] = true;

          cardsHtml.push(cardHtml({ catSlug: catSlug, category: category, name: name, part: part, badge: badge, image: image, icon: icon, id: id }));
        }

        if (!cardsHtml.length) return; // nothing usable — keep built-in products

        renderFilters(filters, categories);
        grid.innerHTML = cardsHtml.join('');
      })
      .catch((err) => {
        console.error('Shop: could not load products from the Google Sheet, showing built-in products instead.', err);
      });
  });

  function renderFilters(container, categories) {
    const chips = ['<button class="filter-chip active" data-filter="all">All Products</button>'].concat(
      categories.map((c) => '<button class="filter-chip" data-filter="' + c.slug + '">' + escapeHtml(c.label) + '</button>')
    );
    container.innerHTML = chips.join('');

    // Delegated listener on the container itself, so it keeps working no
    // matter how many times the chips inside get replaced.
    if (!container.dataset.bound) {
      container.dataset.bound = 'true';
      container.addEventListener('click', (e) => {
        const chip = e.target.closest('.filter-chip');
        if (!chip) return;
        container.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.dataset.filter;
        document.querySelectorAll('.product-card').forEach((card) => {
          card.style.display = cat === 'all' || card.dataset.category === cat ? '' : 'none';
        });
      });
    }
  }

  function cardHtml(p) {
    const media = p.image
      ? '<img src="' + escapeAttr(p.image) + '" alt="' + escapeAttr(p.name) + '">'
      : '<span style="font-size:2.6rem;">' + escapeHtml(p.icon) + '</span>';
    const badgeHtml = p.badge ? '<span class="product-badge">' + escapeHtml(p.badge) + '</span>' : '';
    const partHtml = p.part ? '<p class="product-part">Part #: ' + escapeHtml(p.part) + '</p>' : '';

    return (
      '<div class="product-card" data-category="' + p.catSlug + '">' +
      '<div class="product-media">' + badgeHtml + media + '</div>' +
      '<div class="product-body">' +
      '<span class="product-cat">' + escapeHtml(p.category) + '</span>' +
      '<h3>' + escapeHtml(p.name) + '</h3>' +
      partHtml +
      '<button class="btn btn-navy btn-sm btn-block" data-add-to-cart data-id="' + escapeAttr(p.id) + '" data-name="' + escapeAttr(p.name) + '" data-price="0" data-icon="' + escapeAttr(p.icon) + '">Get A Quote</button>' +
      '</div></div>'
    );
  }

  function slugify(str) {
    return (
      str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'item'
    );
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  // Minimal CSV parser: handles quoted fields with embedded commas,
  // escaped quotes (""), and newlines — enough for a Google Sheets export.
  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += c;
      }
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
  }
})();
