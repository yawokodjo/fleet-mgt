export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const target = `https://fleet-api-production-4d99.up.railway.app${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('Host', 'fleet-api-production-4d99.up.railway.app');

  try {
    return await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      redirect: 'follow',
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Backend indisponible' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
