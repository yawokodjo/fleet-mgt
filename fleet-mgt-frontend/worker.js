export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const target = `https://citgfleetmgt1-6293a6pz.b4a.run${url.pathname}${url.search}`;
      return fetch(target, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
        redirect: 'follow',
      });
    }

    return env.ASSETS.fetch(request);
  },
};
