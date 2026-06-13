import { readFile, writeFile } from 'node:fs/promises';
import { stringify } from 'yaml';

type ReferenceCell = {
  status: 'covered' | 'partial' | 'not-covered';
  rating?: string;
  note?: string;
  url?: string;
  provenance: 'verified' | 'sample';
};

type ReferenceDataset = {
  protocols: Array<{ id: string; name: string }>;
  feeds: Array<{ id: string; name: string }>;
  coverage: Record<string, Record<string, ReferenceCell>>;
};

const input = process.argv[2];
if (!input) {
  throw new Error('Usage: node --import tsx scripts/import-neutral-risk-reference.ts <competitor.json>');
}

const reference = JSON.parse(await readFile(input, 'utf8')) as ReferenceDataset;
const referenceFeed = Object.fromEntries(reference.feeds.map((feed) => [feed.id, feed]));
const referenceProtocol = Object.fromEntries(reference.protocols.map((protocol) => [protocol.id, protocol]));

const protocolCrosswalk: Record<string, string[]> = {
  spark: [],
  aave: ['aave-v3', 'aave-v4'],
  morpho: ['morpho'],
  fluid: ['fluid'],
  gearbox: ['gearbox'],
  euler: ['euler'],
  compound: ['compound-v2', 'compound-v3'],
  liquity: ['liquity-v1', 'liquity-v2'],
  uniswap: ['uniswap-v3', 'uniswap-v4', 'uniswap-x'],
  curve: ['curve'],
  balancer: ['balancer-v2', 'balancer-v3'],
  'cow-swap': ['cow-swap'],
  'one-inch': ['1inch'],
  'zero-x-matcha': ['0x'],
  yearn: ['yearn'],
  mellow: ['mellow'],
  'morpho-vaults': ['morpho-vaults'],
  pendle: ['pendle'],
  lido: ['lido'],
  'rocket-pool': ['rocket-pool'],
};

const referenceUrl = 'https://github.com/rails-finance/neutral-risk/blob/56bd9c47d90dc09935ac4fb96c4f7677bba180ad/lib/data/coverage.ts';
const capturedAt = '2026-06-11T14:00:00.000Z';
const cells = [];
const sparkNotes = 'Version-scoped Spark coverage; parent Spark is partial because not every listed version has this feed.';

for (const [protocolId, referenceIds] of Object.entries(protocolCrosswalk)) {
  for (const feed of reference.feeds) {
    const versions = referenceIds.map((id) => ({ id, cell: reference.coverage[id][feed.id] }));
    const positive = versions.filter(({ cell }) => cell.status !== 'not-covered');
    if (positive.length === 0) continue;

    const status = positive.length === versions.length && positive.every(({ cell }) => cell.status === 'covered')
      ? 'covered'
      : 'partial';
    const scope = versions
      .map(({ id, cell }) => `${referenceProtocol[id].name}: ${cell.status.replace('-', ' ')}`)
      .join('; ');
    const notes = positive
      .map(({ id, cell }) => `${referenceProtocol[id].name}: ${cell.note ?? referenceFeed[feed.id].name + ' coverage'}`)
      .join(' ');
    const verifiedRatings = positive.filter(({ cell }) => cell.rating && cell.provenance === 'verified');
    const ratings = positive.filter(({ cell }) => cell.rating);
    const source = positive.find(({ cell }) => cell.url)?.cell.url ?? referenceUrl;

    cells.push({
      protocolId,
      feedId: feed.id,
      status,
      summary: notes,
      ...(ratings.length > 0
        ? { providerLabel: ratings.map(({ id, cell }) => `${referenceProtocol[id].name}: ${cell.rating}`).join(' | ') }
        : { providerLabel: status === 'covered' ? 'Protocol-specific coverage' : 'Version-limited coverage' }),
      ...(verifiedRatings.length > 0
        ? {
            providerText: verifiedRatings.map(({ id, cell }) => `${referenceProtocol[id].name}: ${cell.rating}`).join(' | '),
            providerTextVerified: true,
          }
        : {}),
      scope,
      referenceStatus: positive.every(({ cell }) => cell.provenance === 'verified') ? 'verified' : 'reference_sample',
      referenceUrl,
      source: {
        label: `${feed.name} source`,
        url: source,
        provenance: 'provider_page',
        capturedAt,
      },
      notes: 'Coverage status synchronized from the Neutral Risk reference; provider-authored text is included only where that reference marks the rating verified.',
    });
  }
}

cells.push(
  {
    protocolId: 'spark',
    feedId: 'defiscan',
    status: 'partial',
    summary: 'SparkLend: DeFiScan centralization review for Spark governance and upgrade controls; sUSDS has no provider-specific feed in this snapshot.',
    providerLabel: 'SparkLend: Stage 0',
    scope: 'SparkLend: covered; sUSDS: not covered',
    referenceStatus: 'reference_sample',
    referenceUrl,
    source: {
      label: 'DeFiScan source',
      url: 'https://www.defiscan.info/protocols/spark/ethereum',
      provenance: 'provider_page',
      capturedAt,
    },
    notes: sparkNotes,
  },
  {
    protocolId: 'spark',
    feedId: 'blockanalitica',
    status: 'partial',
    summary: 'SparkLend: On-chain risk dashboard for SparkLend markets including rates, liquidations, and collateral exposure; sUSDS has no provider-specific feed in this snapshot.',
    providerLabel: 'SparkLend: Live dashboard',
    scope: 'SparkLend: covered; sUSDS: not covered',
    referenceStatus: 'reference_sample',
    referenceUrl,
    source: {
      label: 'BlockAnalitica source',
      url: 'https://blockanalitica.com/',
      provenance: 'provider_page',
      capturedAt,
    },
    notes: sparkNotes,
  },
  {
    protocolId: 'spark',
    feedId: 'credora',
    status: 'partial',
    summary: 'sUSDS: Per-vault credit rating coverage for Spark Savings Vaults; SparkLend has no provider-specific feed in this snapshot.',
    providerLabel: 'sUSDS: A- to B+',
    scope: 'SparkLend: not covered; sUSDS: covered',
    referenceStatus: 'reference_sample',
    referenceUrl,
    source: {
      label: 'Credora source',
      url: 'https://www.credora.network/',
      provenance: 'provider_page',
      capturedAt,
    },
    notes: sparkNotes,
  },
  {
    protocolId: 'spark',
    feedId: 'philidor',
    status: 'partial',
    summary: 'sUSDS: Deterministic vault scoring for Spark savings vault exposure; SparkLend has no provider-specific feed in this snapshot.',
    providerLabel: 'sUSDS: Prime (8.38 / 10)',
    scope: 'SparkLend: not covered; sUSDS: covered',
    referenceStatus: 'reference_sample',
    referenceUrl,
    source: {
      label: 'Philidor Analytics source',
      url: 'https://analytics.philidor.io/',
      provenance: 'provider_page',
      capturedAt,
    },
    notes: sparkNotes,
  },
  {
    protocolId: 'spark',
    feedId: 'defisaver',
    status: 'partial',
    summary: 'SparkLend: Position-management tooling with loan-health, safety-ratio tracking, and liquidation protection; sUSDS has no provider-specific feed in this snapshot.',
    providerLabel: 'SparkLend: Position tooling',
    scope: 'SparkLend: covered; sUSDS: not covered',
    referenceStatus: 'reference_sample',
    referenceUrl,
    source: {
      label: 'DeFi Saver source',
      url: 'https://defisaver.com/',
      provenance: 'provider_page',
      capturedAt,
    },
    notes: sparkNotes,
  },
);

await writeFile('data/coverage/seed.yaml', stringify(cells, { lineWidth: 0 }), 'utf8');
console.log(`Imported ${cells.length} positive reference cells.`);
