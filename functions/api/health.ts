/**
 * Public liveness endpoint.
 * Deliberately reveals no binding names, secret readiness, database state,
 * storage configuration, service topology, or account metadata.
 */
export const onRequestGet: PagesFunction = async () => new Response(
  JSON.stringify({ status: 'ok' }),
  {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Referrer-Policy': 'no-referrer',
    },
  },
)
