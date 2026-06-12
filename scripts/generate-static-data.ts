import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import type {
  Audit,
  CoverageCell,
  Feed,
  GovernanceFact,
  Incident,
  MatrixRow,
  Protocol,
  ProtocolDetail,
  ProtocolMetric,
} from '../shared/openrisk';

const DATA_DIR = join(process.cwd(), 'data');
const OUTPUT_DIR = join(process.cwd(), 'public/data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'openrisk.json');

type DefiLlamaProtocol = {
  slug?: string;
  parentProtocolSlug?: string;
  chainTvls?: Record<string, number | undefined>;
};

type DefiLlamaDimension = {
  name?: string;
  displayName?: string;
  module?: string;
  slug?: string;
  total24h?: number;
  breakdown24h?: Record<string, Record<string, number> | undefined>;
};

type DefiLlamaDimensionsResponse = {
  protocols?: DefiLlamaDimension[];
};

type StaticData = {
  metrics?: Record<string, ProtocolMetric>;
};

async function readYamlDirectory<T>(directory: string): Promise<T[]> {
  const absolute = join(DATA_DIR, directory);
  const files = (await readdir(absolute)).filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));
  const results = await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(join(absolute, file), 'utf8');
      const document = parse(contents) as T | T[];
      return Array.isArray(document) ? document : [document];
    }),
  );
  return results.flat();
}

function buildMatrix(protocols: Protocol[], feeds: Feed[], curatedCoverage: CoverageCell[]): MatrixRow[] {
  const curatedByPair = new Map<string, CoverageCell>();
  for (const cell of curatedCoverage) {
    curatedByPair.set(`${cell.protocolId}:${cell.feedId}`, cell);
  }

  return protocols.map((protocol) => {
    const coverage: Record<string, CoverageCell> = {};
    let coverageCount = 0;
    let partialCount = 0;

    for (const feed of feeds) {
      const key = `${protocol.id}:${feed.id}`;
      const cell = curatedByPair.get(key) ?? {
        protocolId: protocol.id,
        feedId: feed.id,
        status: 'not_covered',
        summary: '',
        notes: 'No protocol-specific provider coverage found in the current curated registry.',
      };
      coverage[feed.id] = cell;
      if (cell.status === 'covered') coverageCount++;
      else if (cell.status === 'partial') partialCount++;
    }

    return { ...protocol, coverage, coverageCount, partialCount };
  });
}

function normalize(value?: string) {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
}

function ethereumTvlFor(items: DefiLlamaProtocol[], slug?: string) {
  const normalizedSlug = normalize(slug);
  const direct = items.find((item) => normalize(item.slug) === normalizedSlug)?.chainTvls?.Ethereum;
  if (typeof direct === 'number' && direct > 0) return direct;

  const children = items.filter((item) => normalize(item.parentProtocolSlug) === normalizedSlug);
  const childTotal = children.reduce((sum, item) => sum + (item.chainTvls?.Ethereum ?? 0), 0);
  return childTotal > 0 ? childTotal : null;
}

function ethereumVolumeFor(item?: DefiLlamaDimension) {
  const breakdown = item?.breakdown24h?.ethereum ?? item?.breakdown24h?.Ethereum;
  if (breakdown) {
    const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
    if (total > 0) return total;
  }
  return typeof item?.total24h === 'number' && item.total24h > 0 ? item.total24h : null;
}

async function readExistingMetrics() {
  try {
    const current = JSON.parse(await readFile(OUTPUT_FILE, 'utf8')) as StaticData;
    return current.metrics ?? {};
  } catch {
    return {};
  }
}

function unavailableMetric(protocol: Protocol, fallback: Record<string, ProtocolMetric>, reason: string): ProtocolMetric {
  return fallback[protocol.id] ?? {
    protocolId: protocol.id,
    metric: protocol.defillama.metric,
    value: null,
    asOf: null,
    source: protocol.links.defillama,
    unavailableReason: reason,
  };
}

async function fetchMetrics(protocols: Protocol[]) {
  const metrics: Record<string, ProtocolMetric> = {};
  const fallback = await readExistingMetrics();
  const capturedAt = new Date().toISOString();

  try {
    const [tvlResponse, volumeResponse] = await Promise.all([
      fetch('https://api.llama.fi/protocols', { signal: AbortSignal.timeout(8000) }),
      fetch(
        'https://api.llama.fi/overview/aggregators?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume',
        { signal: AbortSignal.timeout(8000) },
      ),
    ]);
    if (!tvlResponse.ok || !volumeResponse.ok) throw new Error('DefiLlama returned an unsuccessful response.');

    const tvlData = (await tvlResponse.json()) as DefiLlamaProtocol[];
    const volumeData = (await volumeResponse.json()) as DefiLlamaDimensionsResponse;

    for (const protocol of protocols) {
      const slug = protocol.defillama.protocolSlug ?? protocol.id;

      if (protocol.defillama.metric === 'tvl') {
        let value = ethereumTvlFor(tvlData, slug);
        let scopeNote: string | undefined;

        if (protocol.id === 'morpho-vaults' && value === null) {
          value = ethereumTvlFor(tvlData, 'morpho-blue');
          scopeNote = 'DefiLlama includes MetaMorpho vault capital in the Morpho protocol total.';
        }

        metrics[protocol.id] = value
          ? {
              protocolId: protocol.id,
              metric: 'tvl',
              value,
              asOf: capturedAt,
              source: protocol.links.defillama,
              ...(scopeNote ? { scopeNote } : {}),
            }
          : unavailableMetric(protocol, fallback, 'Ethereum-specific TVL was not returned by DefiLlama.');
        continue;
      }

      const candidates = [slug, protocol.id, protocol.name, protocol.family].map(normalize).filter(Boolean);
      const match = (volumeData.protocols ?? []).find((item) =>
        [item.module, item.name, item.displayName, item.slug]
          .map(normalize)
          .some((identifier) => candidates.includes(identifier)),
      );
      const value = ethereumVolumeFor(match);
      metrics[protocol.id] = value
        ? {
            protocolId: protocol.id,
            metric: 'volume',
            value,
            asOf: capturedAt,
            source: protocol.links.defillama,
          }
        : unavailableMetric(protocol, fallback, 'Ethereum 24h volume was not matched in DefiLlama data.');
    }
  } catch (error) {
    console.warn('Could not refresh metrics from DefiLlama:', (error as Error).message);
    for (const protocol of protocols) {
      metrics[protocol.id] = unavailableMetric(
        protocol,
        fallback,
        'Could not reach DefiLlama during the static build.',
      );
    }
  }

  return metrics;
}

async function main() {
  console.log('Loading canonical YAML data...');
  const [protocols, feeds, curatedCoverage, governance, audits, incidents] = await Promise.all([
    readYamlDirectory<Protocol>('protocols'),
    readYamlDirectory<Feed>('feeds'),
    readYamlDirectory<CoverageCell>('coverage'),
    readYamlDirectory<GovernanceFact>('governance'),
    readYamlDirectory<Audit>('audits'),
    readYamlDirectory<Incident>('incidents'),
  ]);

  console.log(`Loaded ${protocols.length} protocols and ${feeds.length} feeds.`);
  const matrixRows = buildMatrix(protocols, feeds, curatedCoverage);
  const metrics = await fetchMetrics(protocols);

  const protocolDetails: Record<string, ProtocolDetail> = {};
  for (const protocol of protocols) {
    const row = matrixRows.find((item) => item.id === protocol.id);
    protocolDetails[protocol.id] = {
      ...protocol,
      governance: governance.filter((fact) => fact.protocolId === protocol.id),
      coverage: row ? Object.values(row.coverage) : [],
      audits: audits.filter((audit) => audit.protocolId === protocol.id),
      incidents: incidents.filter((incident) => incident.protocolId === protocol.id),
    };
  }

  const feedDetails: Record<string, Feed & { coverage: CoverageCell[] }> = {};
  for (const feed of feeds) {
    feedDetails[feed.id] = {
      ...feed,
      coverage: matrixRows.map((row) => row.coverage[feed.id]).filter((cell): cell is CoverageCell => Boolean(cell)),
    };
  }

  const output = {
    generatedAt: new Date().toISOString(),
    protocols,
    feeds,
    matrix: { feeds, rows: matrixRows },
    metrics,
    protocolDetails,
    feedDetails,
    stats: {
      protocols: protocols.length,
      feeds: feeds.length,
      cells: protocols.length * feeds.length,
      covered: matrixRows.reduce((sum, row) => sum + row.coverageCount, 0),
      partial: matrixRows.reduce((sum, row) => sum + row.partialCount, 0),
      positiveCells: curatedCoverage.length,
      governanceFacts: governance.length,
      audits: audits.length,
      incidents: incidents.length,
    },
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Static snapshot written to ${OUTPUT_FILE}.`);
  console.log(
    `${output.stats.protocols} protocols, ${output.stats.feeds} feeds, ${output.stats.covered} covered, ${output.stats.partial} partial.`,
  );
}

main().catch((error) => {
  console.error('Static snapshot generation failed:', error);
  process.exit(1);
});
