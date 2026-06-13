import { readFile } from 'node:fs/promises';
import { getOpenRiskDataset } from '../server/utils/openrisk-data';

type Reference = {
  feeds: Array<{ id: string }>;
  coverage: Record<string, Record<string, { status: 'covered' | 'partial' | 'not-covered' }>>;
};

const input = process.argv[2];
if (!input) throw new Error('Provide the exported Neutral Risk reference JSON path');

const reference = JSON.parse(await readFile(input, 'utf8')) as Reference;
const dataset = await getOpenRiskDataset();
const crosswalk: Record<string, string[]> = {
  spark: [], aave: ['aave-v3', 'aave-v4'], morpho: ['morpho'], fluid: ['fluid'],
  gearbox: ['gearbox'], euler: ['euler'], compound: ['compound-v2', 'compound-v3'],
  liquity: ['liquity-v1', 'liquity-v2'], uniswap: ['uniswap-v3', 'uniswap-v4', 'uniswap-x'],
  curve: ['curve'], balancer: ['balancer-v2', 'balancer-v3'], 'cow-swap': ['cow-swap'],
  'one-inch': ['1inch'], 'zero-x-matcha': ['0x'], yearn: ['yearn'], mellow: ['mellow'],
  'morpho-vaults': ['morpho-vaults'], pendle: ['pendle'], lido: ['lido'], 'rocket-pool': ['rocket-pool'],
};

const differences: string[] = [];
for (const protocol of dataset.protocols) {
  if (crosswalk[protocol.id].length === 0) continue;

  for (const feed of reference.feeds) {
    const statuses = crosswalk[protocol.id].map((id) => reference.coverage[id][feed.id].status);
    const expected = statuses.every((status) => status === 'covered')
      ? 'covered'
      : statuses.every((status) => status === 'not-covered')
        ? 'not_covered'
        : 'partial';
    const actual = dataset.coverage.find((cell) => cell.protocolId === protocol.id && cell.feedId === feed.id)?.status;
    if (actual !== expected) differences.push(`${protocol.id}:${feed.id} expected ${expected}, found ${actual}`);
  }
}

if (differences.length > 0) throw new Error(`Neutral Risk parity failed:\n${differences.join('\n')}`);
console.log('Neutral Risk parity verified for external-reference cells; manual override protocols were skipped.');
