import { getOpenRiskDataset } from '../server/utils/openrisk-data';

const dataset = await getOpenRiskDataset();

const expectedCells = dataset.protocols.length * dataset.feeds.length;
if (dataset.coverage.length !== expectedCells) {
  throw new Error(`Expected ${expectedCells} matrix cells, found ${dataset.coverage.length}`);
}

for (const protocol of dataset.protocols) {
  const facts = dataset.governance.filter((item) => item.protocolId === protocol.id);
  if (facts.length === 0) {
    throw new Error(`Missing governance fact for ${protocol.id}`);
  }
}

for (const row of dataset.matrix) {
  for (const feed of dataset.feeds) {
    if (!row.coverage[feed.id]) {
      throw new Error(`Missing matrix cell for ${row.id}:${feed.id}`);
    }
  }
}

const positiveCoverage = dataset.coverage.filter((cell) => cell.status !== 'not_covered');
const coveredProtocols = new Set(positiveCoverage.map((cell) => cell.protocolId));
const contributingFeeds = new Set(positiveCoverage.map((cell) => cell.feedId));

if (dataset.feeds.length < 16) {
  throw new Error(`Expected at least 16 feeds, found ${dataset.feeds.length}`);
}
if (positiveCoverage.length !== 136) {
  throw new Error(`Expected exactly 136 sourced positive coverage cells, found ${positiveCoverage.length}`);
}
if (positiveCoverage.filter((cell) => cell.status === 'covered').length !== 62) {
  throw new Error('Expected exactly 62 covered cells from the Neutral Risk reference');
}
if (positiveCoverage.filter((cell) => cell.status === 'partial').length !== 74) {
  throw new Error('Expected exactly 74 partial cells from the Neutral Risk reference');
}
if (coveredProtocols.size !== 20) {
  throw new Error(`Expected positive coverage for all 20 protocols, found ${coveredProtocols.size}`);
}
if (contributingFeeds.size !== 16) {
  throw new Error(`Expected positive coverage from all 16 feeds, found ${contributingFeeds.size}`);
}

console.log(
  `Validated ${dataset.protocols.length} protocols, ${dataset.feeds.length} feeds, ${dataset.coverage.length} coverage cells (${positiveCoverage.length} sourced positive cells across ${coveredProtocols.size} protocols and ${contributingFeeds.size} feeds).`,
);
