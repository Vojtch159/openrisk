type DefiLlamaProtocol = {
  name: string;
  chainTvls?: Record<string, { tvl?: Array<{ date: number; totalLiquidityUSD: number }> }>;
  tvl?: Array<{ date: number; totalLiquidityUSD: number }>;
};

type DefiLlamaVolume = {
  totalDataChart?: Array<[number, number]>;
  totalDataChartBreakdown?: Array<[number, Record<string, Record<string, number>>]>;
};

function latestTvl(protocol: DefiLlamaProtocol) {
  const series = protocol.chainTvls?.Ethereum?.tvl ?? protocol.tvl ?? [];
  const latest = series.at(-1);
  return latest
    ? {
        value: latest.totalLiquidityUSD,
        asOf: new Date(latest.date * 1000).toISOString(),
      }
    : undefined;
}

function latestVolume(volume: DefiLlamaVolume) {
  const latest = volume.totalDataChart?.at(-1);
  return latest
    ? {
        value: latest[1],
        asOf: new Date(latest[0] * 1000).toISOString(),
      }
    : undefined;
}

export default cachedEventHandler(
  async (event) => {
    const protocolId = getRouterParam(event, 'protocolId');
    if (!protocolId) {
      throw createError({ statusCode: 400, statusMessage: 'Protocol id is required' });
    }

    const dataset = await getOpenRiskDataset();
    const protocol = dataset.protocols.find((item) => item.id === protocolId);
    if (!protocol) {
      throw createError({ statusCode: 404, statusMessage: 'Protocol not found' });
    }

    const slug = protocol.defillama.protocolSlug;
    if (!slug) {
      return {
        protocolId,
        metric: protocol.defillama.metric,
        value: null,
        asOf: null,
        source: null,
      };
    }

    try {
      if (protocol.defillama.metric === 'volume') {
        const response = await $fetch<DefiLlamaVolume>(`https://api.llama.fi/summary/dexs/${slug}?excludeTotalDataChart=false&excludeTotalDataChartBreakdown=true`, {
          timeout: 4_000,
        });
        const metric = latestVolume(response);
        return {
          protocolId,
          metric: 'volume',
          value: metric?.value ?? null,
          asOf: metric?.asOf ?? null,
          source: protocol.links.defillama,
        };
      }

      const response = await $fetch<DefiLlamaProtocol>(`https://api.llama.fi/protocol/${slug}`, {
        timeout: 4_000,
      });
      const metric = latestTvl(response);
      return {
        protocolId,
        metric: 'tvl',
        value: metric?.value ?? null,
        asOf: metric?.asOf ?? null,
        source: protocol.links.defillama,
      };
    } catch (error) {
      return {
        protocolId,
        metric: protocol.defillama.metric,
        value: null,
        asOf: null,
        source: protocol.links.defillama,
        error: error instanceof Error ? error.message : 'Metric fetch failed',
      };
    }
  },
  {
    maxAge: 15 * 60,
    swr: true,
    getKey: (event) => `metrics:${getRouterParam(event, 'protocolId')}`,
  },
);
