import { importX509, jwtVerify } from 'jose';

interface Env {
  BANNERS: R2Bucket;
  FIREBASE_PROJECT_ID: string;
  ADMIN_UID: string;
}

type FirebaseCerts = Record<string, string>;
let cachedCerts: FirebaseCerts | null = null;
let certsExpireAt = 0;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function firebaseCerts(): Promise<FirebaseCerts> {
  if (cachedCerts && Date.now() < certsExpireAt) return cachedCerts;
  const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!response.ok) throw new Error('Could not retrieve Firebase signing certificates.');
  const certs = await response.json() as FirebaseCerts;
  const cacheControl = response.headers.get('Cache-Control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\\d+)/i)?.[1] || 3600);
  cachedCerts = certs;
  certsExpireAt = Date.now() + Math.max(60, maxAge) * 1000;
  return certs;
}

async function verifyAdmin(request: Request, env: Env): Promise<boolean> {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return false;
  try {
    const [encodedHeader] = token.split('.');
    if (!encodedHeader) return false;
    const header = JSON.parse(atob(encodedHeader.replace(/-/g, '+').replace(/_/g, '/'))) as { kid?: string; alg?: string };
    if (header.alg !== 'RS256' || !header.kid) return false;
    const cert = (await firebaseCerts())[header.kid];
    if (!cert) return false;
    const publicKey = await importX509(cert, 'RS256');
    const verified = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
      audience: env.FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      clockTolerance: 5,
    });
    return verified.payload.sub === env.ADMIN_UID && verified.payload.user_id === env.ADMIN_UID;
  } catch {
    return false;
  }
}

function extensionFor(type: string): string | null {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/banner-upload') {
      if (!(await verifyAdmin(request, env))) return json({ error: 'Not authorized to upload banners.' }, 403);
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        return json({ error: 'The upload form could not be read.' }, 400);
      }
      const file = form.get('file');
      if (!(file instanceof File)) return json({ error: 'Choose an image file to upload.' }, 400);
      if (file.size < 1 || file.size > MAX_FILE_BYTES) return json({ error: 'The image must be smaller than 5 MB.' }, 413);
      const extension = extensionFor(file.type);
      if (!extension) return json({ error: 'Only JPG, PNG and WebP images are accepted.' }, 415);

      const objectKey = `direct-ad-banners/${crypto.randomUUID()}.${extension}`;
      await env.BANNERS.put(objectKey, file.stream(), {
        httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
      });
      return json({ imageUrl: `${url.origin}/banners/${objectKey}` }, 201);
    }

    if (request.method === 'GET' && url.pathname.startsWith('/banners/')) {
      const objectKey = decodeURIComponent(url.pathname.slice('/banners/'.length));
      if (!/^direct-ad-banners\/[a-f0-9-]+\.(jpg|png|webp)$/.test(objectKey)) {
        return new Response('Not found', { status: 404, headers: corsHeaders });
      }
      const object = await env.BANNERS.get(objectKey);
      if (!object) return new Response('Not found', { status: 404, headers: corsHeaders });
      return new Response(object.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
          'Cache-Control': object.httpMetadata?.cacheControl || 'public, max-age=31536000, immutable',
          ETag: object.httpEtag,
        },
      });
    }
    return json({ error: 'Not found.' }, 404);
  },
};
