<script setup lang="ts">
import { ArrowUpRight, Sparkles } from '@lucide/vue';
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
      <div class="ai-icon"><Sparkles :size="18" aria-hidden="true" /></div>
      <div>
        <div class="ai-label">AI preview <span>Pre-generated</span></div>
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
.ai-preview { background: linear-gradient(135deg,#f1f5f3 0%,#eef3f5 62%,#edf5f1 100%); border: 1px solid var(--color-ink-200); border-radius: .9rem; color: var(--color-ink-900); margin-top: 1rem; overflow: hidden; padding: 1.2rem; position: relative; }
.ai-preview::after { background: radial-gradient(circle,rgba(31,157,99,.11),transparent 68%); content: ''; height: 14rem; pointer-events: none; position: absolute; right: -5rem; top: -7rem; width: 14rem; }
.ai-preview-heading { align-items: center; display: flex; gap: .75rem; position: relative; z-index: 1; }
.ai-icon { align-items: center; background: #d8f9e6; border-radius: .55rem; color: #136340; display: flex; height: 2.25rem; justify-content: center; width: 2.25rem; }
.ai-label { color: var(--color-ink-500); font-size: .62rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.ai-label span { background: var(--color-ink-100); border-radius: 99px; color: var(--color-ink-600); letter-spacing: 0; margin-left: .35rem; padding: .2rem .4rem; text-transform: none; }
.ai-preview h2 { font-size: 1rem; margin: .15rem 0 0; }
.ai-lead { font-size: 1rem; font-weight: 600; line-height: 1.55; margin: 1rem 0; max-width: 58rem; position: relative; z-index: 1; }
.ai-findings { border-bottom: 1px solid var(--color-ink-200); border-top: 1px solid var(--color-ink-200); display: grid; gap: .9rem; padding: 1rem 0; position: relative; z-index: 1; }
.ai-findings span { color: #287951; display: block; font-size: .61rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.ai-findings p { color: var(--color-ink-600); font-size: .72rem; line-height: 1.55; margin: .3rem 0 0; }
.ai-preview-footer { align-items: start; display: flex; flex-wrap: wrap; gap: .75rem; justify-content: space-between; padding-top: .85rem; position: relative; z-index: 1; }
.ai-preview-footer > p { color: var(--color-ink-500); font-size: .64rem; line-height: 1.5; margin: 0; max-width: 38rem; }
.ai-sources { display: flex; flex-wrap: wrap; gap: .35rem; }
.ai-sources a { align-items: center; background: rgba(252,252,250,.7); border: 1px solid var(--color-ink-200); border-radius: 99px; color: var(--color-ink-700); display: inline-flex; font-size: .61rem; font-weight: 700; gap: .2rem; padding: .3rem .45rem; text-decoration: none; }
.ai-sources a:hover { background: var(--color-white); border-color: var(--color-ink-300); color: var(--color-ink-950); }
:global(html.dark .ai-preview) { background: linear-gradient(135deg,#202938 0%,#24334b 62%,#1f3b40 100%); border-color: #3a4a61; color: var(--color-on-dark); }
:global(html.dark .ai-preview::after) { background: radial-gradient(circle,rgba(74,222,128,.16),transparent 68%); }
:global(html.dark .ai-preview .ai-label) { color: #91a3bb; }
:global(html.dark .ai-preview .ai-label span) { background: rgba(255,255,255,.09); color: #c8d4e3; }
:global(html.dark .ai-preview .ai-findings) { border-color: rgba(255,255,255,.12); }
:global(html.dark .ai-preview .ai-findings span) { color: #8bd8ac; }
:global(html.dark .ai-preview .ai-findings p) { color: #c8d4e3; }
:global(html.dark .ai-preview .ai-preview-footer > p) { color: #91a3bb; }
:global(html.dark .ai-preview .ai-sources a) { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.12); color: #dbe7f5; }
:global(html.dark .ai-preview .ai-sources a:hover) { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.18); color: #f0f5fb; }
@media (min-width: 720px) { .ai-preview { padding: 1.35rem; } .ai-findings { grid-template-columns: repeat(3,minmax(0,1fr)); } }
</style>
