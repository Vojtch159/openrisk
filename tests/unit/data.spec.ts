import { describe, expect, it } from 'vitest';
import { getOpenRiskDataset } from '../../server/utils/openrisk-data';
import snapshot from '../../public/data/openrisk.json';

describe('OpenRisk data registry', () => {
  it('contains the 20 seed protocols and complete feed matrix', async () => {
    const dataset = await getOpenRiskDataset();

    expect(dataset.protocols).toHaveLength(20);
    expect(dataset.feeds.length).toBeGreaterThanOrEqual(16);
    expect(dataset.coverage).toHaveLength(dataset.protocols.length * dataset.feeds.length);
  });

  it('requires governance data for every seed protocol', async () => {
    const dataset = await getOpenRiskDataset();

    for (const protocol of dataset.protocols) {
      expect(dataset.governance.some((fact) => fact.protocolId === protocol.id)).toBe(true);
    }
  });

  it('does not synthesize hidden matrix scores', async () => {
    const dataset = await getOpenRiskDataset();

    for (const row of dataset.matrix) {
      expect(Object.keys(row)).not.toContain('score');
      expect(Object.keys(row)).not.toContain('rank');
    }
  });

  it('maintains sourced positive coverage across the registry', async () => {
    const dataset = await getOpenRiskDataset();
    const positiveCoverage = dataset.coverage.filter((cell) => cell.status !== 'not_covered');

    expect(positiveCoverage).toHaveLength(132);
    expect(positiveCoverage.filter((cell) => cell.status === 'covered')).toHaveLength(54);
    expect(positiveCoverage.filter((cell) => cell.status === 'partial')).toHaveLength(78);
    expect(new Set(positiveCoverage.map((cell) => cell.protocolId)).size).toBe(20);
    expect(new Set(positiveCoverage.map((cell) => cell.feedId)).size).toBe(16);

    for (const cell of positiveCoverage) {
      expect(cell.source).toBeDefined();
      expect(cell.summary.trim()).not.toBe('');
    }
  });

  it('preserves provider text only for reference-verified findings', async () => {
    const dataset = await getOpenRiskDataset();

    for (const cell of dataset.coverage.filter((item) => item.providerText)) {
      expect(cell.providerTextVerified).toBe(true);
      expect(cell.referenceUrl).toMatch(/rails-finance\/neutral-risk/);
    }
  });

  it('ships a complete dated capital-metric snapshot', () => {
    expect(Object.keys(snapshot.metrics)).toHaveLength(20);
    expect(snapshot.generatedAt).toMatch(/^2026-/);

    for (const metric of Object.values(snapshot.metrics)) {
      expect(metric.value).toBeTypeOf('number');
      expect(metric.value).toBeGreaterThan(0);
      expect(metric.asOf).toBeTruthy();
    }
  });

  it('materializes all 20 protocol states on every feed detail page', () => {
    for (const feed of Object.values(snapshot.feedDetails)) {
      expect(feed.coverage).toHaveLength(20);
    }
  });

  it('shows Spark provider feeds only when scoped to a listed version', () => {
    const spark = snapshot.matrix.rows.find((row) => row.id === 'spark');
    const sparkCells = Object.values(snapshot.protocolDetails.spark.coverage);

    expect(spark?.coverageCount).toBe(0);
    expect(spark?.partialCount).toBe(5);
    expect(sparkCells.filter((cell) => cell.status === 'partial')).toHaveLength(5);

    for (const cell of sparkCells.filter((item) => item.status === 'partial')) {
      expect(cell.scope).toMatch(/SparkLend|sUSDS/);
      expect(cell.scope).not.toBe('Spark: covered');
    }
  });
});
