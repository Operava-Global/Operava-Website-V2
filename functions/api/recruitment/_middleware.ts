/**
 * Recruitment AVA is retained in the repository but disabled in production
 * unless explicitly re-enabled by the site operator.
 * This gate covers all /api/recruitment/* Pages Functions.
 */
type Env = { RECRUITMENT_AVA_ENABLED?: string }

export const onRequest: PagesFunction<Env> = async (context) => {
  if (String(context.env.RECRUITMENT_AVA_ENABLED || '').trim().toLowerCase() !== 'true') {
    return new Response(
      JSON.stringify({ error: 'Recruitment AVA is unavailable. Use the regular Careers application form.' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    )
  }
  return context.next()
}
