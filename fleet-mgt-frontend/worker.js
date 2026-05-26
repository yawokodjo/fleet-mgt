export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const target = `https://citgfleetmgt1-6293a6pz.b4a.run${url.pathname}${url.search}`;

      const headers = new Headers(request.headers);
      headers.set('Host', 'citgfleetmgt1-6293a6pz.b4a.run');

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

    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url)));
    }
    return response;
  },
};
