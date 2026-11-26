# Danat Build advertiser banner upload (Cloudflare R2)

This Worker replaces Firebase Storage for advertiser banner images. Firebase Authentication remains the identity provider and Firestore continues to store campaign records.

## Cloudflare setup

1. In Cloudflare, open **R2 Object Storage** and create a bucket named `danat-build-direct-ad-banners`.
2. Open **Workers & Pages** and create a Worker by importing this GitHub repository.
3. Set the Worker project root/directory to `cloudflare/banner-upload-worker`.
4. Use the included `wrangler.toml`. The R2 binding must be named `BANNERS` and point to `danat-build-direct-ad-banners`.
5. Deploy the Worker. Enable its `workers.dev` subdomain if Cloudflare asks.
6. Copy the Worker base URL (for example, `https://danat-build-banner-upload.<your-account-subdomain>.workers.dev`).

The Worker does not need an R2 access key or Firebase service-account secret. R2 is accessed through the Worker binding. It validates Firebase ID-token signatures against Google's published Firebase signing certificates and accepts uploads only from the configured administrator UID.

## Connect the app

After deployment, set the exact Worker base URL in `src/config/bannerUpload.ts` as `BANNER_UPLOAD_API` (without a trailing slash). Commit that one-line configuration change and let the existing GitHub Pages website deployment finish. No APK build is needed.

## Upload behavior and security

- Only the Firebase admin UID configured in `wrangler.toml` may upload.
- Uploads are limited to JPG, PNG and WebP, maximum 5 MB.
- Images are stored under unique, non-overwritable R2 object keys.
- Banner reads are served by the Worker; no public R2 bucket or public R2 API token is required.
- The upload endpoint accepts a Firebase ID token in the Authorization header. No secret is embedded in the mobile/web app.
- Firebase Spark remains unchanged. R2 has its own Cloudflare usage limits and pricing; check the Cloudflare dashboard for current allowance and billing.

## Endpoints

- `POST /api/banner-upload` — authenticated multipart upload, field name `file`.
- `GET /banners/<object-key>` — public read endpoint used by campaign image URLs.
