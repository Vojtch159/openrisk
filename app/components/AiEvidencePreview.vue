<script setup lang="ts">
import { ArrowUpRight, FileText } from '@lucide/vue';
import type { Feed, ProtocolDetail } from '#openrisk';

const props = defineProps<{
  protocol: ProtocolDetail;
  feeds: Feed[];
  totalSources?: number;
}>();

const feedById = computed(() => Object.fromEntries(
  props.feeds.map((feed) => [feed.id, feed]),
) as Record<string, Feed>);

const reporting = computed(() => props.protocol.coverage.filter((cell) => cell.status !== 'not_covered'));
const coveredCount = computed(() => reporting.value.filter((cell) => cell.status === 'covered').length);
const partialCount = computed(() => reporting.value.filter((cell) => cell.status === 'partial').length);
const verifiedCount = computed(() => reporting.value.filter((cell) => cell.providerTextVerified).length);

const methodologyTypes = computed(() => new Set(
  reporting.value.map((cell) => feedById.value[cell.feedId]?.type).filter(Boolean),
));

const leadingLens = computed(() => {
  const counts = new Map<string, number>();
  for (const cell of reporting.value) {
    const type = feedById.value[cell.feedId]?.type;
    if (type) counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
});

const sourceLinks = computed(() => reporting.value
  .filter((cell) => cell.source)
  .slice(0, 4));

const lensLabel = computed(() => {
  const lens = leadingLens.value?.[0];
  return lens ? `${lens.charAt(0).toUpperCase()}${lens.slice(1)}` : 'No';
});
</script>

<template>
  <section class="ai-preview" aria-labelledby="ai-preview-title">
    <div class="ai-preview-heading">
      <div class="ai-icon"><FileText :size="18" aria-hidden="true" /></div>
      <div>
        <div class="ai-label">Snapshot note <span>Static registry</span></div>
        <h2 id="ai-preview-title">Evidence at a glance</h2>
      </div>
    </div>

    <p class="ai-lead">
      {{ protocol.name }} has protocol-specific intelligence from {{ reporting.length }} of {{ totalSources ?? protocol.coverage.length }} tracked sources,
      including {{ coveredCount }} covered and {{ partialCount }} partial entries.
    </p>

    <div class="ai-findings">
      <div>
        <span>Coverage breadth</span>
        <p>{{ methodologyTypes.size }} methodology lenses are represented. {{ lensLabel }} sources contribute the largest share of indexed coverage.</p>
      </div>
      <div>
        <span>Control context</span>
        <p>{{ protocol.governance.length }} sourced governance facts are indexed alongside {{ protocol.incidents.length }} incident and {{ protocol.audits.length }} audit records.</p>
      </div>
      <div>
        <span>Evidence quality</span>
        <p>{{ verifiedCount }} reporting sources include verified provider-authored text. Open the evidence cards below for scope and provenance.</p>
      </div>
    </div>

    <div class="ai-preview-footer">
      <p>Generated only from this static registry snapshot. It is a navigation aid, not a risk verdict or recommendation.</p>
      <div class="ai-sources" aria-label="Preview source links">
        <a
          v-for="cell in sourceLinks"
          :key="cell.feedId"
          :href="cell.source?.url"
          target="_blank"
          rel="noreferrer"
        >
          {{ feedById[cell.feedId]?.shortName ?? feedById[cell.feedId]?.name ?? cell.feedId }}
          <ArrowUpRight :size="12" aria-hidden="true" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-preview { background: var(--color-white); border: 1px solid var(--color-ink-200); border-radius: .35rem; box-shadow: var(--shadow-line); color: var(--color-ink-900); margin-top: 1rem; overflow: hidden; padding: 1.2rem; position: relative; }
.ai-preview::before { background: var(--color-signal-blue); content: ''; inset: 0 auto 0 0; position: absolute; width: 3px; }
.ai-preview-heading { align-items: center; display: flex; gap: .75rem; position: relative; z-index: 1; }
.ai-icon { align-items: center; background: var(--accent-mark); border-radius: .25rem; color: var(--accent-mark-ink); display: flex; height: 2.25rem; justify-content: center; width: 2.25rem; }
.ai-label { color: var(--color-ink-500); font-family: var(--font-mono); font-size: .76rem; font-weight: 800; }
.ai-label span { background: var(--color-ink-100); border-radius: .2rem; color: var(--color-ink-600); margin-left: .35rem; padding: .2rem .4rem; }
.ai-preview h2 { font-size: 1rem; margin: .15rem 0 0; }
.ai-lead { font-size: 1rem; font-weight: 600; line-height: 1.55; margin: 1rem 0; max-width: 58rem; position: relative; z-index: 1; }
.ai-findings { border-bottom: 1px solid var(--color-ink-200); border-top: 1px solid var(--color-ink-200); display: grid; gap: .9rem; padding: 1rem 0; position: relative; z-index: 1; }
.ai-findings span { color: var(--color-signal-blue); display: block; font-family: var(--font-mono); font-size: .76rem; font-weight: 800; }
.ai-findings p { color: var(--color-ink-600); font-size: .84rem; line-height: 1.6; margin: .3rem 0 0; }
.ai-preview-footer { align-items: start; display: flex; flex-wrap: wrap; gap: .75rem; justify-content: space-between; padding-top: .85rem; position: relative; z-index: 1; }
.ai-preview-footer > p { color: var(--color-ink-500); font-size: .78rem; line-height: 1.55; margin: 0; max-width: 38rem; }
.ai-sources { display: flex; flex-wrap: wrap; gap: .35rem; }
.ai-sources a { align-items: center; background: color-mix(in srgb, var(--color-white) 72%, transparent); border: 1px solid var(--color-ink-200); border-radius: .2rem; color: var(--color-ink-700); display: inline-flex; font-family: var(--font-mono); font-size: .76rem; font-weight: 700; gap: .2rem; padding: .36rem .52rem; text-decoration: none; }
.ai-sources a:hover { background: var(--color-white); border-color: var(--color-ink-300); color: var(--color-ink-950); }
@media (min-width: 720px) { .ai-preview { padding: 1.35rem; } .ai-findings { grid-template-columns: repeat(3,minmax(0,1fr)); } }
</style>
