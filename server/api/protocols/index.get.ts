export default defineEventHandler(async () => {
  const dataset = await getOpenRiskDataset();
  return dataset.protocols;
});
