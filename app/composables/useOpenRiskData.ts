import staticData from '../../public/data/openrisk.json';
import type {
  CoverageCell,
  Feed,
  MatrixRow,
  Protocol,
  ProtocolDetail,
  ProtocolMetric,
} from '#openrisk';

interface OpenRiskData {
  generatedAt: string;
  protocols: Protocol[];
  feeds: Feed[];
  matrix: { feeds: Feed[]; rows: MatrixRow[] };
  metrics: Record<string, ProtocolMetric>;
  protocolDetails: Record<string, ProtocolDetail>;
  feedDetails: Record<string, Feed & { coverage: CoverageCell[] }>;
  stats: {
    protocols: number;
    feeds: number;
    cells: number;
    covered: number;
    partial: number;
    positiveCells: number;
    governanceFacts: number;
    audits: number;
    incidents: number;
  };
}

const data = shallowRef(staticData as unknown as OpenRiskData);
const isLoading = computed(() => false);
const error = shallowRef<Error | null>(null);

export function useOpenRiskData() {
  return {
    data: readonly(data) as Readonly<Ref<OpenRiskData>>,
    isLoading: readonly(isLoading),
    error: readonly(error),
  };
}

export function useMatrix() {
  const source = useOpenRiskData();
  const feeds = computed(() => source.data.value?.matrix.feeds ?? []);
  const rows = computed(() => source.data.value?.matrix.rows ?? []);
  return { ...source, feeds, rows };
}

export function useProtocols() {
  const source = useOpenRiskData();
  const protocols = computed(() => source.data.value?.protocols ?? []);
  return { ...source, protocols };
}

export function useFeeds() {
  const source = useOpenRiskData();
  const feeds = computed(() => source.data.value?.feeds ?? []);
  return { ...source, feeds };
}

export function useProtocol(id: Ref<string> | ComputedRef<string>) {
  const source = useOpenRiskData();
  const protocol = computed(() => source.data.value?.protocolDetails[unref(id)] ?? null);
  return { ...source, protocol };
}

export function useFeed(id: Ref<string> | ComputedRef<string>) {
  const source = useOpenRiskData();
  const feed = computed(() => source.data.value?.feedDetails[unref(id)] ?? null);
  return { ...source, feed };
}

export function useMetrics() {
  const source = useOpenRiskData();
  const metrics = computed(() => source.data.value?.metrics ?? {});
  return { ...source, metrics };
}

export function useMetricCell(protocolId: string, metric: 'tvl' | 'volume') {
  const { metrics, isLoading } = useMetrics();
  const metricRecord = computed(() => metrics.value[protocolId]);

  const formattedValue = computed(() => {
    const value = metricRecord.value?.value;
    if (typeof value !== 'number' || value <= 0) return 'Unavailable';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
      style: 'currency',
      currency: 'USD',
    }).format(value);
  });

  const asOfLabel = computed(() => {
    if (!metricRecord.value?.asOf) return 'Update date unavailable';
    return `Updated ${new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(metricRecord.value.asOf))}`;
  });

  return {
    formattedValue,
    isPending: isLoading,
    metric,
    asOfLabel,
    scopeNote: computed(() => metricRecord.value?.scopeNote),
  };
}

export function useProtocolDetail(id: Ref<string> | ComputedRef<string>) {
  const source = useOpenRiskData();
  const protocol = computed(() => source.data.value?.protocolDetails[unref(id)] ?? null);
  const feeds = computed(() => source.data.value?.feeds ?? []);
  return { ...source, protocol, feeds };
}

export function useFeedDetail(id: Ref<string> | ComputedRef<string>) {
  const source = useOpenRiskData();
  const feed = computed(() => source.data.value?.feedDetails[unref(id)] ?? null);
  const protocols = computed(() => source.data.value?.protocols ?? []);
  return { ...source, feed, protocols };
}
