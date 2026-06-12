import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';
import {
  auditSchema,
  coverageCellSchema,
  type Audit,
  type CoverageCell,
  feedSchema,
  type Feed,
  governanceFactSchema,
  type GovernanceFact,
  incidentSchema,
  type Incident,
  type MatrixRow,
  type Protocol,
  type ProtocolDetail,
  protocolSchema,
} from '../../shared/openrisk';

type Dataset = {
  protocols: Protocol[];
  feeds: Feed[];
  coverage: CoverageCell[];
  governance: GovernanceFact[];
  audits: Audit[];
  incidents: Incident[];
  matrix: MatrixRow[];
};

let datasetCache: Dataset | undefined;

async function readYamlDirectory<T>(directory: string, schema: { parse: (value: unknown) => T }): Promise<T[]> {
  const absoluteDirectory = join(process.cwd(), directory);
  const files = (await readdir(absoluteDirectory)).filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));
  const parsed = await Promise.all(
    files.map(async (file) => {
      const contents = await readFile(join(absoluteDirectory, file), 'utf8');
      const document = parse(contents);
      const items = Array.isArray(document) ? document : [document];
      return items.map((item) => schema.parse(item));
    }),
  );

  return parsed.flat();
}

function assertUnique(items: { id: string }[], label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) {
      throw new Error(`Duplicate ${label} id: ${item.id}`);
    }
    seen.add(item.id);
  }
}

function buildCoverage(protocols: Protocol[], feeds: Feed[], curatedCoverage: CoverageCell[]) {
  const protocolIds = new Set(protocols.map((protocol) => protocol.id));
  const feedIds = new Set(feeds.map((feed) => feed.id));
  const curatedByPair = new Map<string, CoverageCell>();

  for (const cell of curatedCoverage) {
    if (!protocolIds.has(cell.protocolId)) {
      throw new Error(`Coverage references unknown protocol: ${cell.protocolId}`);
    }
    if (!feedIds.has(cell.feedId)) {
      throw new Error(`Coverage references unknown feed: ${cell.feedId}`);
    }

    const key = `${cell.protocolId}:${cell.feedId}`;
    if (curatedByPair.has(key)) {
      throw new Error(`Duplicate coverage cell: ${key}`);
    }
    curatedByPair.set(key, cell);
  }

  const complete: CoverageCell[] = [];
  for (const protocol of protocols) {
    for (const feed of feeds) {
      const key = `${protocol.id}:${feed.id}`;
      complete.push(
        curatedByPair.get(key) ?? {
          protocolId: protocol.id,
          feedId: feed.id,
          status: 'not_covered',
          summary: '',
          notes: 'No protocol-specific provider coverage found in the current curated registry.',
        },
      );
    }
  }

  return complete;
}

function buildMatrix(protocols: Protocol[], feeds: Feed[], coverage: CoverageCell[]): MatrixRow[] {
  return protocols.map((protocol) => {
    const cells = coverage.filter((cell) => cell.protocolId === protocol.id);
    const coverageRecord = Object.fromEntries(cells.map((cell) => [cell.feedId, cell]));
    return {
      ...protocol,
      coverage: coverageRecord,
      coverageCount: feeds.filter((feed) => coverageRecord[feed.id]?.status === 'covered').length,
      partialCount: feeds.filter((feed) => coverageRecord[feed.id]?.status === 'partial').length,
    };
  });
}

export async function getOpenRiskDataset(): Promise<Dataset> {
  if (datasetCache) {
    return datasetCache;
  }

  const [protocols, feeds, curatedCoverage, governance, audits, incidents] = await Promise.all([
    readYamlDirectory('data/protocols', protocolSchema),
    readYamlDirectory('data/feeds', feedSchema),
    readYamlDirectory('data/coverage', coverageCellSchema),
    readYamlDirectory('data/governance', governanceFactSchema),
    readYamlDirectory('data/audits', auditSchema),
    readYamlDirectory('data/incidents', incidentSchema),
  ]);

  assertUnique(protocols, 'protocol');
  assertUnique(feeds, 'feed');

  const coverage = buildCoverage(protocols, feeds, curatedCoverage);

  datasetCache = {
    protocols,
    feeds,
    coverage,
    governance,
    audits,
    incidents,
    matrix: buildMatrix(protocols, feeds, coverage),
  };

  return datasetCache;
}

export async function getProtocolDetail(id: string): Promise<ProtocolDetail | undefined> {
  const dataset = await getOpenRiskDataset();
  const protocol = dataset.protocols.find((item) => item.id === id);
  if (!protocol) {
    return undefined;
  }

  return {
    ...protocol,
    governance: dataset.governance.filter((item) => item.protocolId === id),
    coverage: dataset.coverage.filter((item) => item.protocolId === id),
    audits: dataset.audits.filter((item) => item.protocolId === id),
    incidents: dataset.incidents.filter((item) => item.protocolId === id),
  };
}

export async function getFeedDetail(id: string) {
  const dataset = await getOpenRiskDataset();
  const feed = dataset.feeds.find((item) => item.id === id);
  if (!feed) {
    return undefined;
  }

  return {
    ...feed,
    coverage: dataset.coverage.filter((item) => item.feedId === id),
  };
}
