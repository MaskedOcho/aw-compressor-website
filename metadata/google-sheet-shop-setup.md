# Shop Catalog: Google Sheet Setup

The Shop page can pull its product list live from a Google Sheet instead
of the products built into `shop.html`. Add a row, it shows up on the
site. Delete a row (or mark it inactive), it disappears. No code changes,
no developer needed for routine add/remove work.

Until this is configured, the page just shows the products already on it
today — nothing changes on the live site until you turn this on.

## 1. Create the sheet

Create a new Google Sheet and set up these column headers in row 1
(exact spelling matters, capitalization doesn't):

| Category | Product Name | Part Number | Badge | Image URL | Icon | Active |
|---|---|---|---|---|---|---|

- **Category** *(required)* — groups products into filter tabs on the Shop page (e.g. "Compressors", "Parts & Airends"). Type any category name — a new one automatically gets its own filter tab, no setup needed.
- **Product Name** *(required)* — the product title shown on the card and used in the cart/quote request.
- **Part Number** — shown on the card as "Part #: ___". Leave blank to hide that line.
- **Badge** — small tag on the photo corner, e.g. "New", "Used", "Refurb". Leave blank for no badge.
- **Image URL** — a direct link to a product photo. Leave blank and the product shows a generic icon instead (see Icon column).
- **Icon** — an emoji shown when there's no Image URL (or as the cart's mini-thumbnail). Defaults to ⚙️ if left blank.
- **Active** — type "No" to temporarily hide a product without deleting the row. Leave blank (or "Yes") to show it.

A starter file with all 16 current products already filled in is at
`metadata/shop-catalog-starter.csv` in this project — open it and
import it into a new Google Sheet (File → Import → Upload) so you're not
starting from a blank sheet.

### Getting an Image URL
The simplest option: upload the photo to Google Drive, right-click → Share
→ "Anyone with the link" → Viewer, then use this URL format:
`https://drive.google.com/uc?export=view&id=YOUR_FILE_ID`
(the file ID is the long string in the share link). Any other publicly
reachable image URL works too.

## 2. Publish the sheet to the web

In the Sheet: **File → Share → Publish to web**.
- Under "Link", choose the specific sheet/tab your product table is on.
- Change the format dropdown from "Web page" to **Comma-separated values (.csv)**.
- Click **Publish**, confirm, and copy the URL it gives you.

## 3. Add the URL to the site

Open `assets/js/shop-config.js` and paste the published URL in:

```js
window.SHOP_SHEET_CONFIG = {
  csvUrl: 'PASTE_THE_PUBLISHED_CSV_URL_HERE'
};
```

Save, commit, and push. The Shop page will start pulling products from
the sheet within a few minutes (Google's publish cache updates
periodically, not instantly).

## Undoing this

Two ways, depending on how far you want to roll back:

- **Turn it off instantly, keep the feature installed:** clear the
  `csvUrl` value in `assets/js/shop-config.js` back to `''` and push.
  The Shop page immediately goes back to showing the products built into
  `shop.html`, exactly like before this was ever added.
- **Remove the feature entirely:** this was built on the
  `feature/shop-sheet-catalog` branch and hasn't touched `master`. If you
  don't want it at all, just don't merge the branch — nothing about the
  live site changes. If it's already been merged and you want it fully
  gone, `git revert` the merge commit.

## A note on editing delay

Google's published-sheet cache can take a few minutes to reflect an edit
— it's not instant like editing a normal database. Fine for a parts
catalog that isn't changing minute-to-minute, but worth knowing if a
product doesn't appear right away after saving.
