export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Feed id is required' });
  }

  const feed = await getFeedDetail(id);
  if (!feed) {
    throw createError({ statusCode: 404, statusMessage: 'Feed not found' });
  }

  return feed;
});
