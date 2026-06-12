import type { ProtocolMetric } from '../../../shared/openrisk';

type DefiLlamaProtocolSummary = {
  slug?: string;
  name?: string;
  tvl?: number;
  chainTvls?: Record<string, number>;
  parentProtocolSlug?: string;
};

type DefiLlamaVolumeOverview = {
  protocols?: Array<{
    name?: string;
    displayName?: string;
    module?: string;
    total24h?: number;
  }>;
};

function normalize(value: string | undefined) {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
}

export default cachedEventHandler(
  async () => {
    const dataset = await getOpenRiskDataset();
    let protocolSummaries: DefiLlamaProtocolSummary[] = [];
    let volumeOverview: DefiLlamaVolumeOverview = {};
    let tvlError: string | undefined;
    let volumeError: string | undefined;

    try {
      protocolSummaries = await $fetch<DefiLlamaProtocolSummary[]>('https://api.llama.fi/protocols', {
        timeout: 4_000,
      });
    } catch (error) {
      tvlError = error instanceof Error ? error.message : 'DefiLlama TVL request failed';
    }

    try {
      volumeOverview = await $fetch<DefiLlamaVolumeOverview>(
        'https://api.llama.fi/overview/dexs/Ethereum?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume',
        { timeout: 4_000 },
      );
    } catch (error) {
      volumeError = error instanceof Error ? error.message : 'DefiLlama volume request failed';
    }

    const metrics: Record<string, ProtocolMetric> = {};

    for (const protocol of dataset.protocols) {
      const slug = protocol.defillama.protocolSlug ?? protocol.id;

      if (protocol.defillama.metric === 'tvl') {
        const match = protocolSummaries.find((item) => normalize(item.slug) === normalize(slug));
        let ethereumTvl = match?.chainTvls?.Ethereum;

        if (typeof ethereumTvl !== 'number' && protocolSummaries.length > 0) {
          const children = protocolSummaries.filter(
            (item) => normalize(item.parentProtocolSlug) === normalize(slug),
          );
          if (children.length > 0) {
            ethereumTvl = children.reduce((sum, child) => sum + (child.chainTvls?.Ethereum ?? 0), 0);
          }
        }

        metrics[protocol.id] = {
          protocolId: protocol.id,
          metric: 'tvl',
          value: typeof ethereumTvl === 'number' && ethereumTvl > 0 ? ethereumTvl : null,
          asOf: typeof ethereumTvl === 'number' && ethereumTvl > 0 ? new Date().toISOString() : null,
          source: protocol.links.defillama,
          ...(typeof ethereumTvl !== 'number' || ethereumTvl <= 0
            ? { unavailableReason: tvlError ?? 'Ethereum-specific TVL was not returned by DefiLlama.' }
            : {}),
        };
        continue;
      }

      const candidates = [slug, protocol.id, protocol.name, protocol.family].map(normalize).filter(Boolean);
      const match = volumeOverview.protocols?.find((item) => {
        const identifiers = [item.module, item.name, item.displayName].map(normalize);
        return identifiers.some((identifier) => candidates.includes(identifier));
      });
      metrics[protocol.id] = {
        protocolId: protocol.id,
        metric: 'volume',
        value: typeof match?.total24h === 'number' ? match.total24h : null,
        asOf: typeof match?.total24h === 'number' ? new Date().toISOString() : null,
        source: protocol.links.defillama,
        ...(typeof match?.total24h !== 'number'
          ? { unavailableReason: volumeError ?? 'Ethereum 24h volume was not matched in the DefiLlama response.' }
          : {}),
      };
    }

    return metrics;
  },
  {
    maxAge: 15 * 60,
    swr: true,
    getKey: () => 'metrics:all',
  },
);
