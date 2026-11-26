# Danat Build banner upload service

## Install location

Copy **upload.php** through FTP into the already-tested public folder:

`/home/danatapp/web/danatstore.com/public_html/pub/danat-build-banners/upload.php`

The public endpoint will be:

`https://danatstore.com/danat-build-banners/upload.php`

Do not put FTP credentials in this file, the app, or GitHub. This endpoint has no FTP login and no private API key.

## What it checks

- Firebase ID token signature against Google's published Firebase signing certificates.
- Firebase project audience and issuer: `danat-build`.
- Exact authorized administrator UID: `psu8GgwqNUSKHSQER9wkcEKbbz22`.
- JPG, PNG, or WebP image content (not just the filename).
- Maximum upload size of 5 MB.
- Generates a random filename and never overwrites an existing image.

The certificate cache is stored in the server's system temporary directory. The endpoint needs outbound HTTPS access to Google's public certificate endpoint and PHP extensions `openssl` and `fileinfo`.

## Before testing

1. Upload only `upload.php` into the tested `danat-build-banners` folder.
2. Do not upload any FTP credentials or configuration secrets.
3. The folder must be writable by the website's PHP process. If it is not, the endpoint returns a clear error; do not change permissions broadly or modify Magento.
4. Test from the Danat Build admin screen after the app-side update is deployed.

The upload service only stores image files in this folder. It does not change Magento files, settings, DNS, or Firebase billing.
