# DNS Cutover: www.awcompressor.com → GitHub Pages

Prepared 2026-11-12. The site stays hosted on GitHub Pages (repo `MaskedOcho/aw-compressor-website`, branch `master`, root folder).
ACTWD Web Services, which manages DNS at `ns1/ns2.v-web.com`, only needs to change the web records.

## Current DNS (checked 2026-11-12)

| Host | Type | Value | Action |
|---|---|---|---|
| `awcompressor.com` | A | 34.193.71.224 | **Replace** with GitHub IPs below |
| `www` | CNAME | awcompressor.com | **Replace** → `maskedocho.github.io` |
| `mail` | A | 34.193.71.224 | **Keep as-is** (email server) |
| `awcompressor.com` | MX | 10 mail.awcompressor.com | **Keep as-is** |
| `awcompressor.com` | TXT | `v=spf1 +a +mx -all` | **Keep as-is** (`+mx` still covers the mail server) |

> ⚠️ `mail.awcompressor.com` uses the same IP as the old website. It has to stay pointed at 34.193.71.224
> or domain email breaks. Only the apex A record and `www` change.

## New records

| Host | Type | Value |
|---|---|---|
| `awcompressor.com` (@) | A | 185.199.108.153 |
| `awcompressor.com` (@) | A | 185.199.109.153 |
| `awcompressor.com` (@) | A | 185.199.110.153 |
| `awcompressor.com` (@) | A | 185.199.111.153 |
| `awcompressor.com` (@) | AAAA *(optional)* | 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153 |
| `www` | CNAME | maskedocho.github.io |
| `_github-pages-challenge-MaskedOcho` | TXT | *(value from GitHub → Settings → Pages → Verified domains)* |

Lower TTLs to 300 s a day before the change so a rollback propagates quickly.

## Cutover steps

1. **Verify the domain** (prevents domain takeover): GitHub → profile Settings → Pages → *Add a domain* → `awcompressor.com`.
   Send the TXT value to ACTWD. Click *Verify* once it resolves.
2. **ACTWD updates the records** in the "New records" table above.
3. **Confirm** that DNS resolves:
   `nslookup www.awcompressor.com 8.8.8.8` should return `maskedocho.github.io`.
4. **Set the custom domain**: push the `CNAME` file (contains `www.awcompressor.com`), or set it under repo → Settings → Pages → Custom domain.
   *Don't do this earlier.* Once it's set, `maskedocho.github.io/aw-compressor-website/` redirects to the custom domain.
5. **Enforce HTTPS** in repo → Settings → Pages once the certificate is issued, which usually takes from 15 minutes to an hour.
6. **Search Console**: submit `https://www.awcompressor.com/sitemap.xml`.

## Rollback

Ask ACTWD to restore the apex A record to `34.193.71.224` and `www` CNAME to `awcompressor.com`.

## Prepped in the repo for the move

- `<link rel="canonical">` on every public page; `checkout.html` set to `noindex`.
- `sitemap.xml` and `robots.txt` for `https://www.awcompressor.com`.
- `404.html` catches old-site URLs and links to Home, Services, Shop and Contact.
- `.nojekyll` makes GitHub Pages serve the files as-is.

## Open items (not DNS-related)

- **Form email needs its Access Key.** The cart checkout, Home/Contact quote form and the four Services forms all email
  through Web3Forms. Get a free key at https://web3forms.com for the receiving inbox and paste it into `FORM_ACCESS_KEY`
  at the top of `assets/js/main.js`. Until then, forms tell customers to call. Job applications still don't send
  (resume uploads need a paid plan).
- **An old Google Maps API key (`AIzaSyCKWF…`) is still in the git history** (commit `476e823`) of this public repo.
  The site no longer uses it, but it should be deleted or restricted in Google Cloud Console.
