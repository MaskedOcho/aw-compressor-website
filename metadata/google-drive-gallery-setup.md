# Google Drive Gallery Setup

The Gallery page (`gallery.html`) is wired up to pull photos live from two
Google Drive folders — one for Piping Installs, one for Compressor Installs.
Drop a photo in the right folder and it shows up on the site automatically,
no code changes needed. Until this is configured, the page just shows the
existing placeholder photos.

I can't create the Drive folders or API key myself — that requires your
Google account. Here's what to do, about 10 minutes:

## 1. Create two Drive folders

In Google Drive, create:
- `A&W Gallery — Piping Installs`
- `A&W Gallery — Compressor Installs`

(Any names are fine — only the folder ID matters, not the name.)

## 2. Share each folder publicly (view-only)

For **each** folder: right-click → **Share** → under "General access" change
"Restricted" to **"Anyone with the link"**, and make sure the role is
**Viewer**. This only lets people view photos you've put in the folder —
they still can't edit or delete anything.

## 3. Get each folder's ID

Open the folder in Drive. The URL looks like:

```
https://drive.google.com/drive/folders/1AbCDeFGhijKLmnoPQRstuVWxyz
```

The part after `/folders/` is the folder ID — copy it for both folders.

## 4. Create a Drive API key

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create (or pick) a project.
2. **APIs & Services → Library** → search "Google Drive API" → **Enable**.
3. **APIs & Services → Credentials** → **Create Credentials → API key**.
4. Click the new key to restrict it (important — do this, since the key will be visible in the site's source):
   - **Application restrictions**: HTTP referrers → add your site's domain (e.g. `awcompressorservices.com/*`, plus `localhost/*` if you test locally).
   - **API restrictions**: Restrict key → select only **Google Drive API**.

## 5. Fill in the config

Open `assets/js/gallery-config.js` and fill in the three blank values:

```js
window.GALLERY_DRIVE_CONFIG = {
  apiKey: 'YOUR_API_KEY_HERE',
  folders: {
    piping: 'PIPING_FOLDER_ID_HERE',
    compressor: 'COMPRESSOR_FOLDER_ID_HERE'
  }
};
```

Save, commit, and push. The Gallery page will start showing whatever photos
are in those two folders instead of the placeholders.

## Notes

- Photo titles on the site come from the Drive file names — rename files in
  Drive (e.g. "Maynardville Plant Room Piping.jpg") for clean captions.
- Only image files are pulled in; other file types in the folder are ignored.
- If you want more categories later (e.g. "Auto Shop Installs"), add a
  third folder + entry in `gallery-config.js`, a matching filter chip in
  `gallery.html`, and a category label in `assets/js/gallery-drive.js` —
  ask me and I'll wire it up.
- If the API key or folder IDs are ever wrong/revoked, the page just falls
  back to the placeholder photos rather than breaking.
