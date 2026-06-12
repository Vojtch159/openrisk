export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Protocol id is required' });
  }

  const protocol = await getProtocolDetail(id);
  if (!protocol) {
    throw createError({ statusCode: 404, statusMessage: 'Protocol not found' });
  }

  return protocol;
});
