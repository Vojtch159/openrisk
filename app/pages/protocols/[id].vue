<script setup lang="ts">
import { ArrowLeft, ExternalLink, GitBranch, Quote, ShieldCheck, BarChart3, AlertTriangle, Building2 } from '@lucide/vue';
import { categoryLabels, type CoverageCell, type Feed } from '#openrisk';

const TABS = ['feeds', 'governance', 'incidents', 'audits'] as const;
type Tab = (typeof TABS)[number];

const route = useRoute();
const protocolId = computed(() => String(route.params.id));
const activeTab = ref<Tab>('feeds');
const coverageFilter = ref<'reporting' | 'all' | CoverageCell['status']>('reporting');
const selectedVersion = ref('all');

const { protocol, isLoading, feeds } = useProtocolDetail(protocolId);
const feedById = computed(() => Object.fromEntries(
  feeds.value.map((feed) => [feed.id, feed]),
) as Record<string, Feed>);

watch(protocolId, () => {
  selectedVersion.value = 'all';
});

function scopeSegment(cell: CoverageCell, version: string) {
  return cell.scope?.split(';').map((part) => part.trim()).find((part) => part.toLowerCase().includes(version.toLowerCase()));
}

function scopedStatus(segment?: string): CoverageCell['status'] | null {
  const value = segment?.toLowerCase();
  if (!value) return null;
  if (value.includes('not covered')) return 'not_covered';
  if (value.includes('partial')) return 'partial';
  if (value.includes('covered')) return 'covered';
  return null;
}

function scopedLabel(value: string | undefined, version: string) {
  if (!value) return undefined;
  return value.split('|').map((part) => part.trim()).find((part) => part.toLowerCase().includes(version.toLowerCase()));
}

const scopedCoverage = computed<CoverageCell[]>(() => {
  const coverage = protocol.value?.coverage ?? [];
  if (selectedVersion.value === 'all') return coverage;
  return coverage.flatMap((cell) => {
    const segment = scopeSegment(cell, selectedVersion.value);
    const status = scopedStatus(segment);
    if (!status) return [];
    const label = scopedLabel(cell.providerLabel, selectedVersion.value);
    const text = scopedLabel(cell.providerText, selectedVersion.value);
    return [{ ...cell, status, scope: segment, providerLabel: label, providerText: text }];
  });
});

const unscopedCount = computed(() => selectedVersion.value === 'all' ? 0 : feeds.value.length - scopedCoverage.value.length);
const counts = computed(() => {
  const coverage = scopedCoverage.value;
  return {
    covered: coverage.filter((cell) => cell.status === 'covered').length,
    partial: coverage.filter((cell) => cell.status === 'partial').length,
    missing: coverage.filter((cell) => cell.status === 'not_covered').length,
  };
});

const visibleCoverage = computed(() => {
  const coverage = [...scopedCoverage.value].sort((a, b) => {
    const order = { covered: 0, partial: 1, not_covered: 2 };
    return order[a.status] - order[b.status];
  });
  if (coverageFilter.value === 'all') return coverage;
  if (coverageFilter.value === 'reporting') return coverage.filter((cell) => cell.status !== 'not_covered');
  return coverage.filter((cell) => cell.status === coverageFilter.value);
});

const reportingCells = computed(() =>
  scopedCoverage.value.filter((cell) => cell.status !== 'not_covered'),
);

const feedsByType = computed(() => {
  const types: Record<string, { covered: number; partial: number; total: number }> = {};
  for (const cell of scopedCoverage.value) {
    const feed = feedById.value[cell.feedId];
    if (!feed) continue;
    const bucket = types[feed.type] ?? { covered: 0, partial: 0, total: 0 };
    bucket.total++;
    if (cell.status === 'covered') bucket.covered++;
    else if (cell.status === 'partial') bucket.partial++;
    types[feed.type] = bucket;
  }
  return types;
});

const typeLabels: Record<string, string> = {
  rating: 'Rating',
  dashboard: 'Dashboard',
  monitoring: 'Monitoring',
  research: 'Research',
};

const previewProtocol = computed(() => protocol.value ? { ...protocol.value, coverage: scopedCoverage.value } : null);

function machineReadabilityLabel(value?: string) {
  if (value === 'yes') return 'machine-readable';
  if (value === 'partial') return 'partially machine-readable';
  return 'manual only';
}
</script>

<template>
  <div class="protocol-page app-shell">
    <div v-if="isLoading" class="protocol-loading">Loading protocol evidence...</div>

    <div v-else-if="protocol">
      <NuxtLink to="/" class="back-link"><ArrowLeft :size="15" /> All protocols</NuxtLink>

      <header class="protocol-hero">
        <div class="protocol-title">
          <div class="protocol-kickers">
            <span>{{ categoryLabels[protocol.category] }}</span>
            <span v-if="protocol.family">{{ protocol.family }} family</span>
            <span>Ethereum mainnet</span>
          </div>
          <div class="protocol-heading">
            <img :src="`/icons/protocols/${protocol.id}.png`" :alt="`${protocol.name} logo`" width="72" height="72">
            <h1>{{ protocol.name }}</h1>
          </div>
          <p>{{ protocol.summary }}</p>
          <div v-if="protocol.versions.length > 1" class="version-row" aria-label="Protocol version scope">
            <button type="button" :class="{ active: selectedVersion === 'all' }" @click="selectedVersion = 'all'">All versions</button>
            <button v-for="version in protocol.versions" :key="version" type="button" :class="{ active: selectedVersion === version }" @click="selectedVersion = version">{{ version }}</button>
          </div>
          <div v-else class="protocol-kickers single-version"><span>{{ protocol.versions[0] }}</span></div>
          <p v-if="selectedVersion !== 'all'" class="version-note">Showing only evidence whose provider scope explicitly names {{ selectedVersion }}. {{ unscopedCount }} sources do not specify this version.</p>
        </div>

        <aside class="metric-panel">
          <span>Capital metric</span>
          <MetricCell :protocol-id="protocol.id" :metric="protocol.defillama.metric" show-freshness />
          <ProvenanceTag label="Capital metric" provenance="defillama" :url="protocol.links.defillama" />
        </aside>
      </header>

      <section class="coverage-strip" aria-label="Coverage summary">
        <div class="coverage-total">
          <strong>{{ counts.covered + counts.partial }}</strong>
          <span>of {{ selectedVersion === 'all' ? protocol.coverage.length : scopedCoverage.length }} scoped sources report</span>
        </div>
        <div class="coverage-meter" aria-hidden="true">
          <i class="covered" :style="{ width: `${counts.covered / Math.max(scopedCoverage.length,1) * 100}%` }" />
          <i class="partial" :style="{ width: `${counts.partial / Math.max(scopedCoverage.length,1) * 100}%` }" />
        </div>
        <dl>
          <div><dt>Covered</dt><dd>{{ counts.covered }}</dd></div>
          <div><dt>Partially covered</dt><dd>{{ counts.partial }}</dd></div>
          <div><dt>Missing</dt><dd>{{ counts.missing }}</dd></div>
        </dl>
        <CoverageHelp compact />
      </section>

      <AiEvidencePreview v-if="previewProtocol" :protocol="previewProtocol" :feeds="feeds" :total-sources="feeds.length" />

      <div class="protocol-layout">
        <main>
          <nav class="tab-bar" role="tablist" aria-label="Protocol detail sections">
            <button
              v-for="tab in TABS"
              :key="tab"
              role="tab"
              :aria-selected="activeTab === tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              <BarChart3 v-if="tab === 'feeds'" :size="15" />
              <Building2 v-else-if="tab === 'governance'" :size="15" />
              <AlertTriangle v-else-if="tab === 'incidents'" :size="15" />
              <ShieldCheck v-else :size="15" />
              <span>{{ tab === 'feeds' ? 'Feeds' : tab === 'governance' ? 'Governance' : tab === 'incidents' ? 'Incidents' : 'Audits' }}</span>
              <b v-if="tab === 'feeds'">{{ counts.covered + counts.partial }}</b>
              <b v-else-if="tab === 'governance'">{{ protocol.governance.length }}</b>
              <b v-else-if="tab === 'incidents'">{{ protocol.incidents.length }}</b>
              <b v-else>{{ protocol.audits.length }}</b>
            </button>
          </nav>

          <section v-if="activeTab === 'feeds'" class="tab-content">
            <div v-if="Object.keys(feedsByType).length > 0" class="feed-lens-summary">
              <p class="lens-intro">Seen through {{ Object.keys(feedsByType).length }} of 4 methodology lenses</p>
              <div class="lens-count-grid">
                <div v-for="(fbCounts, type) in feedsByType" :key="type" class="lens-count-item">
                  <span class="lens-label">{{ typeLabels[type] || type }}</span>
                  <span class="lens-counts">{{ fbCounts.covered }} covered · {{ fbCounts.partial }} partial</span>
                </div>
              </div>
              <p class="lens-disclaimer">Counts show which methodology types contribute scoped evidence. They are not strength or quality scores.</p>
            </div>

            <div v-if="reportingCells.length >= 2" class="disagreement-block">
              <h3>Oracle diversity made visible</h3>
              <p>
                The {{ counts.covered + counts.partial }} reporting feeds show different methodologies and assessments.
                Every provider-native position is shown side by side and is not reconciled into a single verdict.
              </p>
            </div>

            <div class="section-heading">
              <div>
                <span>Provider evidence</span>
                <h2>What each feed publishes</h2>
                <p>Methodology, {{ selectedVersion === 'all' ? 'version scope' : `${selectedVersion} scope` }}, provider-native ratings, and provenance — no synthesis.</p>
              </div>
              <div class="coverage-filters" aria-label="Filter feed cards">
                <button :class="coverageFilter === 'reporting' && 'active'" @click="coverageFilter = 'reporting'">Reporting</button>
                <button :class="coverageFilter === 'covered' && 'active'" @click="coverageFilter = 'covered'">Covered</button>
                <button :class="coverageFilter === 'partial' && 'active'" @click="coverageFilter = 'partial'">Partial</button>
                <button :class="coverageFilter === 'all' && 'active'" @click="coverageFilter = 'all'">All scoped</button>
              </div>
            </div>

            <div class="feed-card-grid">
              <article v-for="cell in visibleCoverage" :key="cell.feedId" class="feed-evidence-card" :class="cell.status">
                <header>
                  <div>
                    <NuxtLink :to="`/feeds/${cell.feedId}`">{{ feedById[cell.feedId]?.name ?? cell.feedId }}</NuxtLink>
                    <span>{{ feedById[cell.feedId]?.type }} · {{ machineReadabilityLabel(feedById[cell.feedId]?.machineReadable) }}</span>
                  </div>
                  <StatusBadge :status="cell.status" />
                </header>

                <p class="feed-methodology">{{ feedById[cell.feedId]?.methodology }}</p>

                <div v-if="cell.scope" class="scope-line"><GitBranch :size="14" />{{ cell.scope }}</div>

                <div v-if="cell.providerText && cell.referenceStatus === 'verified'" class="verbatim-block">
                  <span><Quote :size="13" /> Verbatim provider rating</span>
                  <blockquote>{{ cell.providerText }}</blockquote>
                </div>
                <div v-else-if="cell.providerLabel" class="reference-label">
                  <span>Reference label</span>
                  <strong>{{ cell.providerLabel }}</strong>
                  <small v-if="cell.referenceStatus !== 'verified'">Pending provider verification — not presented as provider-authored text.</small>
                </div>

                <p class="coverage-note">{{ cell.summary || cell.notes || 'No protocol-specific coverage is recorded.' }}</p>

                <footer>
                  <span :class="cell.referenceStatus === 'verified' ? 'verified-reference' : 'sample-reference'">
                    {{ cell.referenceStatus === 'verified' ? 'Verified' : 'Reference sample' }}
                  </span>
                  <ProvenanceTag
                    v-if="cell.source"
                    :label="cell.source.label"
                    :provenance="cell.source.provenance"
                    :url="cell.source.url"
                  />
                </footer>
              </article>
            </div>
          </section>

          <section v-if="activeTab === 'governance'" class="tab-content">
            <div v-if="protocol.governance.length > 0" class="governance-summary">
              <p class="gov-intro">Structural facts, distilled from sourced control records — neutral capabilities, not a risk score.</p>
            </div>
            <div class="governance-list">
              <article v-for="fact in protocol.governance" :key="fact.label">
                <span>{{ fact.label }}</span>
                <p>{{ fact.value }}</p>
                <ProvenanceTag :label="fact.source.label" :provenance="fact.source.provenance" :url="fact.source.url" />
              </article>
            </div>
          </section>

          <section v-if="activeTab === 'incidents'" class="tab-content">
            <div v-if="protocol.incidents.length > 0" class="incidents-intro">
              <p>Material risk events, presented verbatim from cited sources — not an OpenRisk assessment.</p>
            </div>
            <div class="incidents-grid">
              <a
                v-for="incident in protocol.incidents"
                :key="incident.title"
                :href="incident.sourceUrl"
                target="_blank"
                rel="noreferrer"
                class="incident-card"
              >
                <div class="incident-date">{{ incident.date }}</div>
                <div class="incident-body">
                  <strong>{{ incident.title }}</strong>
                  <p>{{ incident.summary }}</p>
                </div>
                <div class="incident-link">
                  <ProvenanceTag label="Incident report" provenance="linked_source" />
                  <ExternalLink :size="13" />
                </div>
              </a>
              <p v-if="protocol.incidents.length === 0" class="empty-tab">No incident records have been catalogued yet.</p>
            </div>
          </section>

          <section v-if="activeTab === 'audits'" class="tab-content">
            <div v-if="protocol.audits.length > 0" class="audits-intro">
              <p>Representative public audits, attributed and linked to source — not a completeness or safety guarantee.</p>
            </div>
            <div class="audits-grid">
              <a
                v-for="audit in protocol.audits"
                :key="`${audit.firm}-${audit.subject}`"
                :href="audit.sourceUrl"
                target="_blank"
                rel="noreferrer"
                class="audit-card"
              >
                <ShieldCheck :size="18" />
                <div class="audit-body">
                  <strong>{{ audit.subject }}</strong>
                  <small>{{ audit.firm }} · {{ audit.date }}</small>
                  <ProvenanceTag label="Audit record" provenance="linked_source" />
                </div>
                <ExternalLink :size="14" />
              </a>
              <p v-if="protocol.audits.length === 0" class="empty-tab">No audit records have been catalogued yet.</p>
            </div>
          </section>
        </main>

        <aside class="protocol-rail">
          <div>
            <span>Official links</span>
            <a :href="protocol.links.website" target="_blank" rel="noreferrer">Protocol site <ExternalLink :size="13" /></a>
            <a v-if="protocol.links.docs" :href="protocol.links.docs" target="_blank" rel="noreferrer">Documentation <ExternalLink :size="13" /></a>
            <a v-if="protocol.links.governance" :href="protocol.links.governance" target="_blank" rel="noreferrer">Governance <ExternalLink :size="13" /></a>
            <a :href="protocol.links.defillama" target="_blank" rel="noreferrer">DefiLlama <ExternalLink :size="13" /></a>
          </div>
        </aside>
      </div>
    </div>

    <div v-else class="rounded-lg border border-ink-200 bg-white p-8 text-center">
      <h1 class="text-xl font-semibold text-ink-950">Protocol not found</h1>
      <NuxtLink to="/" class="mt-3 inline-block text-sm font-semibold text-signal-blue">Return to protocols</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.protocol-page {
  --color-white: #fffdf8;
  --color-ink-950: #121a20;
  --color-ink-900: #1a2530;
  --color-ink-800: #283641;
  --color-ink-700: #3a4853;
  --color-ink-600: #52616c;
  --color-ink-500: #657480;
  --color-ink-300: #a8b3bc;
  --color-ink-200: #d2dbe0;
  --color-ink-100: #e9eff2;
  --color-ink-50: #f5f7f3;
  --color-signal-green: #0f7b56;
  --color-signal-amber: #956214;
  --color-signal-red: #a3453f;
  --color-signal-blue: #265f8f;
  --color-on-dark: #fff7ea;
  --detail-surface: #fffdf8;
  --detail-surface-subtle: #f4f7f7;
  --detail-surface-raised: #ffffff;
  --detail-surface-blue: #edf5fb;
  --detail-surface-amber: #fff5df;
  --detail-surface-green: #e9f7ef;
  --detail-border: #ccd8de;
  --detail-border-soft: #e4ebee;
  --detail-border-strong: #8fa1ad;
  --detail-shadow: 0 1px 0 rgba(18, 26, 32, .05);
  padding-block: 1.5rem 4rem;
}

:global(html.dark .protocol-page) {
  --color-white: #111b24;
  --color-ink-950: #f4efe6;
  --color-ink-900: #e6ded2;
  --color-ink-800: #d4cabd;
  --color-ink-700: #d0c6b7;
  --color-ink-600: #bab1a3;
  --color-ink-500: #a59d91;
  --color-ink-300: #566879;
  --color-ink-200: #35485a;
  --color-ink-100: #1a2a38;
  --color-ink-50: #081017;
  --color-signal-green: #4bd49a;
  --color-signal-amber: #f0b75a;
  --color-signal-red: #f08a82;
  --color-signal-blue: #8abfff;
  --color-on-dark: #081017;
  --detail-surface: #111b24;
  --detail-surface-subtle: #172532;
  --detail-surface-raised: #14212c;
  --detail-surface-blue: #102a3f;
  --detail-surface-amber: var(--color-ink-50);
  --detail-surface-green: #102b21;
  --detail-border: #35485a;
  --detail-border-soft: #263847;
  --detail-border-strong: #63788a;
  --detail-shadow: 0 1px 0 rgba(0, 0, 0, .36);
  background: #0b1118;
}
.protocol-loading { color: #697383; padding: 4rem 0; text-align: center; }
.back-link { align-items: center; color: #697383; display: inline-flex; font-size: .9rem; font-weight: 700; gap: .35rem; margin-bottom: 1.5rem; }
.back-link:hover { color: #1d6fd8; }

.protocol-hero { display: grid; gap: 1.5rem; }
.protocol-kickers { display: flex; flex-wrap: wrap; gap: .4rem; }
.protocol-kickers span { background: var(--color-white); border: 1px solid #d8dee7; border-radius: 99px; color: #4a5361; font-size: .78rem; font-weight: 750; padding: .4rem .62rem; }
.protocol-title h1 { color: #121418; font-size: clamp(2.7rem,8vw,5.5rem); font-weight: 650; letter-spacing: -.055em; line-height: .95; margin: 1rem 0 0; }
.protocol-title > p { color: #4a5361; font-size: 1.05rem; line-height: 1.7; margin: 1rem 0 0; max-width: 48rem; }
.version-row { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: 1rem; }
.version-row button { background: var(--color-white); border: 1px solid #d8dee7; border-radius: 99px; color: #4a5361; font-size: .78rem; font-weight: 750; padding: .46rem .72rem; }
.version-row button.active { background: #272c34; border-color: #272c34; color: var(--color-on-dark); }
.version-note { background: #edf1f6; border-radius: .5rem; color: #4a5361 !important; font-size: .84rem !important; line-height: 1.55 !important; margin-top: .7rem !important; max-width: 42rem; padding: .72rem .82rem; }

.metric-panel { align-self: end; background: #202937; border-radius: .9rem; color: var(--color-on-dark); display: grid; gap: .7rem; min-height: 10rem; padding: 1.2rem; }
.metric-panel > span { color: #aab2bf; font-size: .78rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.metric-panel :deep(.text-ink-900) { color: var(--color-on-dark); font-size: 1.45rem; }
.metric-panel :deep(.text-ink-500) { color: #aab2bf; }
.metric-panel :deep(a) { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.15); color: #b9d8ff; font-size: .78rem; margin-top: auto; width: fit-content; }

.coverage-strip { background: var(--color-white); border: 1px solid #d8dee7; border-radius: .9rem; display: grid; gap: 1rem; margin-top: 2rem; padding: 1rem; }
.coverage-total strong,.coverage-total span { display: block; }
.coverage-total strong { color: #121418; font-size: 2rem; line-height: 1; }
.coverage-total span { color: #697383; font-size: .82rem; font-weight: 700; margin-top: .3rem; }
.coverage-meter { background: #edf1f6; border-radius: 99px; display: flex; height: .55rem; overflow: hidden; }
.coverage-meter i.covered { background: #1f9d63; }
.coverage-meter i.partial { background: #d78a1e; }
.coverage-strip dl { display: grid; grid-template-columns: repeat(3,1fr); margin: 0; }
.coverage-strip dl div { border-left: 1px solid #edf1f6; display: grid; grid-template-rows: 2.25rem auto; padding: .35rem .7rem; }
.coverage-strip dt { align-self: start; color: #697383; font-size: .75rem; font-weight: 800; line-height: 1.35; text-transform: uppercase; }
.coverage-strip dd { align-self: start; color: #181c22; font-size: .95rem; font-weight: 750; line-height: 1; margin: 0; }

.protocol-layout { display: grid; gap: 1rem; margin-top: 1rem; }
.protocol-layout main { overflow: visible; min-width: 0; }

.tab-bar { background: var(--color-white); border: 1px solid #d8dee7; border-radius: .75rem .75rem 0 0; display: grid; gap: 0; grid-template-columns: repeat(2,minmax(0,1fr)); overflow: hidden; }
.tab-bar button { align-items: center; background: none; border: none; border-bottom: 3px solid transparent; color: #697383; display: flex; font-size: .9rem; font-weight: 700; gap: .4rem; justify-content: center; min-width: 0; padding: .75rem .45rem; transition: color .15s, border-color .15s; white-space: nowrap; }
.tab-bar button:hover { color: #303844; }
.tab-bar button.active { border-bottom-color: #1d6fd8; color: #121418; }
.tab-bar button b { background: #edf1f6; border-radius: 99px; color: #697383; font-size: .75rem; font-weight: 800; padding: .2rem .45rem; }
.tab-bar button.active b { background: #e0e9ff; color: #1d6fd8; }

.tab-content { background: var(--color-white); border: 1px solid #d8dee7; border-top: none; border-radius: 0 0 .75rem .75rem; padding: 1.5rem; }

.feed-lens-summary { margin-bottom: 1.5rem; }
.lens-intro { color: #697383; font-size: .9rem; margin: 0 0 .75rem; }
.lens-count-grid { display: grid; gap: .5rem; margin-bottom: .5rem; }
.lens-count-item { background: #f7f9fc; border: 1px solid #edf1f6; border-radius: .5rem; display: grid; gap: .2rem; padding: .65rem; }
.lens-label { color: #303844; font-size: .84rem; font-weight: 750; }
.lens-counts { color: #697383; font-size: .78rem; font-weight: 650; }
.lens-disclaimer { color: #8a94a3; font-size: .78rem; margin: .5rem 0 0; }

.disagreement-block { background: #faf7f0; border: 1px solid #f0e5c8; border-radius: .65rem; margin: 0 0 1.5rem; padding: 1rem; }
.disagreement-block h3 { color: #824f0e; font-size: .9rem; font-weight: 800; margin: 0 0 .4rem; }
.disagreement-block p { color: #6b4a12; font-size: .875rem; line-height: 1.55; margin: 0; }

.section-heading { align-items: end; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; margin-bottom: 1rem; }
.section-heading span { color: #1d6fd8; font-size: .78rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.section-heading h2 { color: #121418; font-size: 1.35rem; letter-spacing: -.025em; margin: .2rem 0 0; }
.section-heading p { color: #697383; font-size: .9rem; line-height: 1.55; margin: .35rem 0 0; max-width: 42rem; }

.coverage-filters { background: #f7f9fc; border: 1px solid #d8dee7; border-radius: .6rem; display: flex; padding: .2rem; }
.coverage-filters button { border-radius: .4rem; color: #697383; font-size: .82rem; font-weight: 750; padding: .5rem .68rem; background: none; border: none; cursor: pointer; }
.coverage-filters button.active { background: #272c34; color: var(--color-on-dark); }

.feed-card-grid { display: grid; gap: .8rem; }
.feed-evidence-card { background: #fafcfd; border: 1px solid #d8dee7; border-radius: .75rem; display: flex; flex-direction: column; min-width: 0; overflow: hidden; padding: 1rem; }
.feed-evidence-card.covered { border-left: 3px solid #1f9d63; }
.feed-evidence-card.partial { border-left: 3px solid #d78a1e; }
.feed-evidence-card.not_covered { opacity: .68; }
.feed-evidence-card header { align-items: start; display: flex; flex-wrap: wrap; gap: .8rem; justify-content: space-between; }
.feed-evidence-card header > div { flex: 1 1 9rem; min-width: 0; }
.feed-evidence-card header a { color: #181c22; font-size: 1rem; font-weight: 750; }
.feed-evidence-card header > div > span { color: #8a94a3; display: block; font-size: .75rem; font-weight: 700; margin-top: .18rem; text-transform: uppercase; }
.feed-evidence-card header :deep(.status-badge) { flex: 0 0 auto; max-width: 100%; }
.feed-methodology,.coverage-note { color: #4a5361; font-size: .88rem; line-height: 1.55; }
.feed-methodology { border-bottom: 1px solid #edf1f6; margin: .75rem 0 0; padding-bottom: .75rem; }
.coverage-note { margin: .75rem 0 0; }
.scope-line { align-items: start; background: #f7f9fc; border-radius: .45rem; color: #4a5361; display: flex; font-size: .8rem; gap: .4rem; line-height: 1.55; margin-top: .75rem; padding: .65rem; }
.scope-line svg { flex: 0 0 auto; margin-top: .1rem; }

.verbatim-block { background: #f1f6fd; border-left: 3px solid #1d6fd8; border-radius: .35rem; margin-top: .75rem; padding: .7rem; }
.verbatim-block > span,.reference-label > span { align-items: center; color: #697383; display: flex; font-size: .75rem; font-weight: 800; gap: .3rem; letter-spacing: .05em; text-transform: uppercase; }
.verbatim-block blockquote { color: #181c22; font-size: .94rem; font-weight: 700; line-height: 1.5; margin: .4rem 0 0; }
.reference-label { background: #faf7f0; border-radius: .4rem; margin-top: .75rem; padding: .7rem; }
.reference-label strong { color: #303844; display: block; font-size: .9rem; margin-top: .3rem; }
.reference-label small { color: #824f0e; display: block; font-size: .78rem; line-height: 1.5; margin-top: .35rem; }

.feed-evidence-card footer { align-items: center; display: flex; flex-wrap: wrap; gap: .4rem; margin-top: auto; padding-top: .9rem; }
.verified-reference,.sample-reference { border-radius: 99px; font-size: .75rem; font-weight: 750; padding: .38rem .56rem; }
.verified-reference { background: #e7f7ef; color: #136340; }
.sample-reference { background: #fff3dc; color: #824f0e; }

.governance-summary,.incidents-intro,.audits-intro { margin-bottom: 1rem; }
.governance-summary p,.incidents-intro p,.audits-intro p { color: #697383; font-size: .9rem; line-height: 1.55; margin: 0; }

.governance-list { background: var(--color-white); border: 1px solid #d8dee7; border-radius: .75rem; overflow: hidden; }
.governance-list article { border-bottom: 1px solid #edf1f6; display: grid; gap: .5rem; padding: 1rem; }
.governance-list article:last-child { border: 0; }
.governance-list article > span { color: #697383; font-size: .78rem; font-weight: 800; text-transform: uppercase; }
.governance-list p { color: #303844; font-size: .94rem; line-height: 1.6; margin: 0; }

.incidents-grid { display: grid; gap: .65rem; }
.incident-card { align-items: start; background: var(--color-white); border: 1px solid #d8dee7; border-left: 3px solid #c47a16; border-radius: .6rem; color: inherit; display: grid; gap: .75rem; grid-template-columns: 5rem minmax(0,1fr) auto; padding: .85rem; text-decoration: none; transition: border-color .15s; }
.incident-card:hover { border-color: #b0b8c5; }
.incident-date { color: #c47a16; font-size: .8rem; font-weight: 700; white-space: nowrap; }
.incident-body strong { color: #181c22; display: block; font-size: .94rem; margin-bottom: .2rem; }
.incident-body p { color: #697383; font-size: .84rem; line-height: 1.5; margin: 0; }
.incident-link { align-items: center; color: #8a94a3; display: flex; font-size: .78rem; font-weight: 700; gap: .3rem; }
.incident-link :deep(span),.audit-body :deep(span) { font-size: .75rem; padding: .3rem .46rem; }

.audits-grid { display: grid; gap: .6rem; }
.audit-card { align-items: start; background: var(--color-white); border: 1px solid #d8dee7; border-left: 3px solid #1f9d63; border-radius: .6rem; color: #1f9d63; display: grid; gap: .65rem; grid-template-columns: auto minmax(0,1fr) auto; padding: .8rem; text-decoration: none; transition: border-color .15s; }
.audit-card:hover { border-color: #b0b8c5; }
.audit-body strong { color: #181c22; display: block; font-size: .94rem; }
.audit-body small { color: #697383; display: block; font-size: .8rem; margin-top: .2rem; }

.empty-tab { color: #8a94a3; font-size: .94rem; padding: 1rem 0; text-align: center; }

.protocol-rail { display: none; align-self: start; position: sticky; top: 5.5rem; }
.protocol-rail > div { background: var(--color-white); border: 1px solid #d8dee7; border-radius: .75rem; display: grid; gap: .15rem; padding: .8rem; }
.protocol-rail span { color: #8a94a3; font-size: .75rem; font-weight: 800; letter-spacing: .06em; padding: .3rem .4rem; text-transform: uppercase; }
.protocol-rail a { align-items: center; border-radius: .4rem; color: #4a5361; display: flex; font-size: .84rem; font-weight: 700; gap: .4rem; justify-content: space-between; padding: .6rem .45rem; text-decoration: none; }
.protocol-rail a:hover,.protocol-rail a.active { background: #f7f9fc; color: #1d6fd8; }
.protocol-rail b { color: #8a94a3; font-size: .78rem; }

.protocol-title h1 {
  color: var(--color-ink-950);
  font-family: var(--font-serif);
  font-weight: 540;
  letter-spacing: -.045em;
}

.protocol-heading {
  align-items: end;
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.protocol-heading img {
  background: var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-radius: .35rem;
  box-shadow: var(--shadow-line);
  flex: 0 0 auto;
  height: clamp(3rem, 8vw, 4.5rem);
  object-fit: contain;
  padding: .45rem;
  width: clamp(3rem, 8vw, 4.5rem);
}

.protocol-heading h1 {
  margin-top: 0;
}

.protocol-kickers span,
.version-row button,
.version-note,
.metric-panel,
.coverage-strip,
.tab-bar,
.tab-content,
.lens-count-item,
.disagreement-block,
.coverage-filters,
.feed-evidence-card,
.scope-line,
.verbatim-block,
.reference-label,
.governance-list,
.incident-card,
.audit-card,
.protocol-rail nav,
.protocol-rail > div {
  border-radius: .35rem;
}

.protocol-kickers span,
.version-row button {
  font-family: var(--font-mono);
}

.metric-panel {
  background: var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-left: 3px solid var(--color-ink-950);
  color: var(--color-ink-950);
}

.metric-panel > span {
  color: var(--color-ink-500);
  font-family: var(--font-mono);
  letter-spacing: 0;
  text-transform: none;
}

.metric-panel :deep(.text-ink-900) {
  color: var(--color-ink-950);
  font-family: var(--font-mono);
}

.metric-panel :deep(.text-ink-500) {
  color: var(--color-ink-500);
}

.metric-panel :deep(a) {
  background: var(--color-ink-50);
  border-color: var(--color-ink-200);
  color: var(--color-ink-700);
}

.coverage-strip,
.tab-bar,
.tab-content,
.feed-evidence-card,
.governance-list,
.incident-card,
.audit-card,
.protocol-rail nav,
.protocol-rail > div {
  box-shadow: var(--shadow-line);
}

.coverage-meter {
  background:
    repeating-linear-gradient(90deg, rgba(24, 32, 42, .16) 0 1px, transparent 1px calc(20% - 1px)),
    var(--color-ink-100);
  border-radius: .15rem;
}

.tab-bar button,
.coverage-filters button,
.section-heading span,
.feed-evidence-card header > div > span,
.verbatim-block > span,
.reference-label > span,
.governance-list article > span,
.protocol-rail span {
  font-family: var(--font-mono);
  letter-spacing: 0;
  text-transform: none;
}

.tab-bar button.active {
  border-bottom-color: var(--color-ink-950);
}

.coverage-filters button.active {
  background: var(--color-ink-950);
}

.feed-evidence-card {
  background: var(--color-white);
}

.disagreement-block {
  background: color-mix(in srgb, var(--color-signal-amber) 12%, var(--color-white));
}

.protocol-title > p,
.feed-methodology,
.coverage-note,
.section-heading p,
.governance-summary p,
.incidents-intro p,
.audits-intro p,
.incident-body p,
.audit-body small {
  color: var(--color-ink-600);
}

.coverage-total strong,
.coverage-strip dd,
.section-heading h2,
.feed-evidence-card header a,
.verbatim-block blockquote,
.reference-label strong,
.governance-list p,
.incident-body strong,
.audit-body strong {
  color: var(--color-ink-950);
}

:global(html.dark .protocol-page) .protocol-heading img,
:global(html.dark .protocol-page) .protocol-kickers span,
:global(html.dark .protocol-page) .version-row button,
:global(html.dark .protocol-page) .metric-panel,
:global(html.dark .protocol-page) .coverage-strip,
:global(html.dark .protocol-page) .tab-bar,
:global(html.dark .protocol-page) .tab-content,
:global(html.dark .protocol-page) .feed-evidence-card,
:global(html.dark .protocol-page) .governance-list,
:global(html.dark .protocol-page) .governance-list article,
:global(html.dark .protocol-page) .incident-card,
:global(html.dark .protocol-page) .audit-card,
:global(html.dark .protocol-page) .protocol-rail nav,
:global(html.dark .protocol-page) .protocol-rail > div {
  background: var(--color-white);
  border-color: var(--color-ink-200);
}

:global(html.dark .protocol-page) .metric-panel {
  border-left-color: var(--color-ink-950);
}

:global(html.dark .protocol-page) .version-note,
:global(html.dark .protocol-page) .lens-count-item,
:global(html.dark .protocol-page) .coverage-filters,
:global(html.dark .protocol-page) .scope-line,
:global(html.dark .protocol-page) .reference-label,
:global(html.dark .protocol-page) .protocol-rail a:hover,
:global(html.dark .protocol-page) .protocol-rail a.active {
  background: var(--color-ink-100);
}

:global(html.dark .protocol-page) .verbatim-block {
  background: color-mix(in srgb, var(--color-signal-blue) 14%, var(--color-white));
}

:global(html.dark .protocol-page) .disagreement-block {
  background: var(--detail-surface-amber);
  border-color: var(--detail-border);
}

:global(html.dark .protocol-page) .coverage-meter {
  background:
    repeating-linear-gradient(90deg, rgba(242, 239, 230, .12) 0 1px, transparent 1px calc(20% - 1px)),
    var(--color-ink-100);
}

:global(html.dark .protocol-page) .tab-bar button b {
  background: var(--color-ink-100);
  color: var(--color-ink-500);
}

:global(html.dark .protocol-page) .tab-bar button.active b {
  background: color-mix(in srgb, var(--color-signal-blue) 20%, var(--color-ink-100));
  color: var(--color-signal-blue);
}

:global(html.dark .protocol-page) .verified-reference {
  background: color-mix(in srgb, var(--color-signal-green) 18%, var(--color-white));
  color: var(--color-signal-green);
}

:global(html.dark .protocol-page) .sample-reference {
  background: var(--detail-surface-amber);
  color: var(--color-signal-amber);
}

.back-link,
.protocol-title > p,
.coverage-total span,
.lens-intro,
.lens-counts,
.lens-disclaimer,
.feed-methodology,
.coverage-note,
.section-heading p,
.governance-summary p,
.incidents-intro p,
.audits-intro p,
.incident-body p,
.audit-body small,
.protocol-rail a,
.protocol-rail b {
  color: var(--color-ink-600);
}

.back-link:hover,
.protocol-rail a:hover,
.protocol-rail a.active,
.section-heading span,
.incident-link {
  color: var(--color-signal-blue);
}

.protocol-kickers span,
.version-row button,
.coverage-strip,
.tab-bar,
.tab-content,
.feed-evidence-card,
.governance-list,
.incident-card,
.audit-card,
.protocol-rail nav,
.protocol-rail > div {
  background: var(--detail-surface);
  border-color: var(--detail-border);
}

.protocol-heading img,
.metric-panel,
.lens-count-item,
.coverage-filters,
.scope-line,
.reference-label {
  background: var(--detail-surface-subtle);
  border-color: var(--detail-border);
}

.protocol-kickers span,
.version-row button {
  color: var(--color-ink-700);
}

.version-row button:hover,
.coverage-filters button:hover {
  border-color: var(--detail-border-strong);
  color: var(--color-ink-950);
}

.version-row button.active,
.coverage-filters button.active {
  background: var(--color-ink-950);
  border-color: var(--color-ink-950);
  color: var(--color-on-dark);
}

.version-note,
.lens-count-item,
.coverage-filters,
.scope-line,
.reference-label,
.protocol-rail a:hover,
.protocol-rail a.active {
  background: var(--detail-surface-subtle);
}

.coverage-strip,
.tab-bar,
.tab-content,
.feed-evidence-card,
.governance-list,
.incident-card,
.audit-card,
.protocol-rail nav,
.protocol-rail > div {
  box-shadow: var(--detail-shadow);
}

.coverage-meter {
  background:
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--color-ink-950) 15%, transparent) 0 1px, transparent 1px calc(20% - 1px)),
    var(--color-ink-100);
}

.coverage-meter i.covered {
  background: var(--color-signal-green);
}

.coverage-meter i.partial {
  background: var(--color-signal-amber);
}

.coverage-strip dl div,
.feed-methodology,
.governance-list article {
  border-color: var(--detail-border-soft);
}

.tab-bar button {
  color: var(--color-ink-600);
}

.tab-bar button:hover,
.tab-bar button.active {
  color: var(--color-ink-950);
}

.tab-bar button.active {
  border-bottom-color: var(--color-signal-blue);
}

.tab-bar button b {
  background: var(--color-ink-100);
  color: var(--color-ink-600);
}

.tab-bar button.active b {
  background: color-mix(in srgb, var(--color-signal-blue) 18%, var(--detail-surface));
  color: var(--color-signal-blue);
}

.feed-evidence-card {
  background: var(--detail-surface-raised);
}

.feed-evidence-card.covered {
  border-left-color: var(--color-signal-green);
}

.feed-evidence-card.partial {
  border-left-color: var(--color-signal-amber);
}

.feed-evidence-card.not_covered {
  opacity: .82;
}

.feed-evidence-card header > div > span,
.verbatim-block > span,
.reference-label > span,
.governance-list article > span,
.protocol-rail span {
  color: var(--color-ink-500);
}

.lens-label,
.reference-label strong,
.governance-list p,
.incident-body strong,
.audit-body strong,
.coverage-total strong,
.coverage-strip dd,
.section-heading h2,
.feed-evidence-card header a,
.verbatim-block blockquote {
  color: var(--color-ink-950);
}

.verbatim-block {
  background: var(--detail-surface-blue);
  border-left-color: var(--color-signal-blue);
}

.disagreement-block,
.reference-label {
  background: var(--detail-surface-amber);
  border-color: color-mix(in srgb, var(--color-signal-amber) 34%, var(--detail-border));
}

.disagreement-block h3,
.disagreement-block p,
.reference-label small,
.incident-date {
  color: var(--color-signal-amber);
}

.verified-reference {
  background: var(--detail-surface-green);
  color: var(--color-signal-green);
}

.sample-reference {
  background: var(--detail-surface-amber);
  color: var(--color-signal-amber);
}

.incident-card {
  border-left-color: var(--color-signal-amber);
}

.incident-card:hover,
.audit-card:hover {
  border-color: var(--detail-border-strong);
}

.audit-card {
  border-left-color: var(--color-signal-green);
  color: var(--color-signal-green);
}

@media (min-width: 640px) {
  .coverage-strip { align-items: center; grid-template-columns: 9rem minmax(10rem,1fr) 20rem auto; }
  .coverage-strip dl { grid-template-columns: repeat(3,1fr); }
  .lens-count-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .feed-card-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .governance-list article { grid-template-columns: 10rem minmax(0,1fr) auto; }
  .tab-bar { display: flex; }
  .tab-bar button { flex: 1 1 0; padding: .85rem 1.2rem; }
}
@media (min-width: 1024px) {
  .protocol-hero { grid-template-columns: minmax(0,1fr) 20rem; }
  .protocol-layout { grid-template-columns: minmax(0,1fr) 14rem; }
  .protocol-rail { display: block; }
  .feed-card-grid { grid-template-columns: repeat(3,minmax(0,1fr)); }
  .coverage-strip dl { grid-template-columns: repeat(3,1fr); }
}

@media (min-width: 1280px) {
  .feed-card-grid { grid-template-columns: repeat(4,minmax(0,1fr)); }
}
</style>
