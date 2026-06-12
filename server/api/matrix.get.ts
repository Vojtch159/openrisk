export default defineEventHandler(async () => {
  const dataset = await getOpenRiskDataset();
  return {
    protocols: dataset.protocols,
    feeds: dataset.feeds,
    rows: dataset.matrix,
  };
});
