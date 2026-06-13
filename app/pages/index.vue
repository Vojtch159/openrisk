<script setup lang="ts">
import { ChevronDown, ChevronRight, ExternalLink, RotateCcw, Search, SlidersHorizontal } from '@lucide/vue';
import { categoryLabels, type CoverageCell, type MatrixRow } from '#openrisk';

type SortKey = 'metric' | 'name' | 'coverage';

const query = ref('');
const category = ref('all');
const minimumCoverage = ref('all');
const sortKey = ref<SortKey>('metric');
const sortDirection = ref<'asc' | 'desc'>('desc');
const expanded = ref(new Set<string>());
const tableScroll = ref<HTMLElement | null>(null);
const isDraggingTable = ref(false);

let dragStartX = 0;
let dragStartScrollLeft = 0;
let didDragTable = false;
let dragEndX = 0;
let dragEndY = 0;

const { data, rows, feeds } = useMatrix();
const categories = computed(() => Array.from(new Set(rows.value.map((row) => row.category))));
const metricFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  maximumFractionDigits: 2,
  notation: 'compact',
  style: 'currency',
});
const metricDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

const filteredRows = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return rows.value.filter((row) => {
    const textMatch = !needle || [row.name, row.family, row.summary, row.notes, row.category, ...row.versions].filter(Boolean).join(' ').toLowerCase().includes(needle);
    const categoryMatch = category.value === 'all' || row.category === category.value;
    const coverageMatch = minimumCoverage.value === 'all'
      || (minimumCoverage.value === 'covered' && row.coverageCount > 0)
      || (minimumCoverage.value === 'partial' && row.coverageCount + row.partialCount > 0);
    return textMatch && categoryMatch && coverageMatch;
  });
});

const sortedRows = computed(() => [...filteredRows.value].sort((a, b) => {
  let result = 0;
  if (sortKey.value === 'name') result = a.name.localeCompare(b.name);
  if (sortKey.value === 'coverage') result = (a.coverageCount + a.partialCount) - (b.coverageCount + b.partialCount);
  if (sortKey.value === 'metric') {
    const aIsTvl = a.defillama.metric === 'tvl';
    const bIsTvl = b.defillama.metric === 'tvl';
    if (aIsTvl !== bIsTvl) return aIsTvl ? -1 : 1;
    result = (data.value.metrics[a.id]?.value ?? -1) - (data.value.metrics[b.id]?.value ?? -1);
  }
  return sortDirection.value === 'asc' ? result : -result;
}));

function setSort(key: SortKey) {
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
  else {
    sortKey.value = key;
    sortDirection.value = key === 'name' ? 'asc' : 'desc';
  }
}

function toggleExpanded(id: string) {
  const next = new Set(expanded.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expanded.value = next;
}

function resetFilters() {
  query.value = '';
  category.value = 'all';
  minimumCoverage.value = 'all';
}

function missingCount(row: MatrixRow) {
  return feeds.value.length - row.coverageCount - row.partialCount;
}

function metricLabel(row: MatrixRow) {
  return row.defillama.metric === 'volume' ? '24h volume' : 'TVL';
}

function formatMetricValue(row: MatrixRow) {
  const value = data.value.metrics[row.id]?.value;
  if (typeof value !== 'number' || value <= 0) return 'Unavailable';
  return metricFormatter.format(value);
}

function metricTitle(row: MatrixRow) {
  const metric = data.value.metrics[row.id];
  const updated = metric?.asOf ? `Updated ${metricDateFormatter.format(new Date(metric.asOf))}` : 'Update date unavailable';
  return `${metricLabel(row)} · DefiLlama · ${updated}${metric?.scopeNote ? ` · ${metric.scopeNote}` : ''}`;
}

function coveragePercent(count: number) {
  return `${(count / Math.max(feeds.value.length, 1)) * 100}%`;
}

function coverageTitle(row: MatrixRow) {
  return `${row.coverageCount} covered, ${row.partialCount} partial, ${missingCount(row)} missing of ${feeds.value.length} feeds`;
}

function versionCoverageTitle(row: MatrixRow, version: string) {
  const counts = versionCounts(row, version);
  return `${counts.covered} covered, ${counts.partial} partial, ${counts.missing} missing, ${counts.unspecified} not version-scoped of ${feeds.value.length} feeds`;
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function compactCoverageLabel(value?: string) {
  if (!value) return '';

  const labels = value
    .split('|')
    .map((part) => part.replace(/^[^:]+:\s*/, '').trim())
    .map((label) => {
      const stage = label.match(/\bStage\s+\d+\b/i)?.[0];
      if (stage) return toTitleCase(stage);

      const percentage = label.match(/\b\d{1,3}%\b/)?.[0];
      if (percentage) return percentage;

      const tier = label.match(/\b(?:Prime|Core|Bronze|Silver|Wood)\b(?:\s+tier)?/iu)?.[0];
      if (tier) return toTitleCase(tier);

      const descriptiveRating = label.match(/\b(?:Excellent|Good|Average|Not Assessed)(?:[–-]Excellent)?\b/iu)?.[0];
      if (descriptiveRating) return toTitleCase(descriptiveRating);

      const letterRating = label.match(/\b[A-D][+-]?(?:\s+to\s+[A-D][+-]?)?\b/iu)?.[0];
      if (letterRating) return letterRating.replace(/\s+to\s+/iu, '-');

      const score = label.match(/\b\d(?:\.\d+)?(?:[–-]\d(?:\.\d+)?)?\s*\/\s*10\b/u)?.[0];
      return score?.replace(/\s+/g, '') ?? '';
    })
    .filter(Boolean);

  return Array.from(new Set(labels)).join(' / ');
}

function conciseLabel(cell?: CoverageCell) {
  if (!cell) return '';
  const label = cell.providerTextVerified ? cell.providerText : cell.providerLabel;
  return compactCoverageLabel(label);
}

function scopeSegment(cell: CoverageCell | undefined, version: string) {
  if (!cell?.scope) return undefined;
  const normalized = version.toLowerCase();
  return cell.scope.split(';').map((part) => part.trim()).find((part) => part.toLowerCase().includes(normalized));
}

function versionStatus(cell: CoverageCell | undefined, version: string): CoverageCell['status'] | 'unspecified' {
  const segment = scopeSegment(cell, version)?.toLowerCase();
  if (!segment) return 'unspecified';
  if (segment.includes('not covered')) return 'not_covered';
  if (segment.includes('partial')) return 'partial';
  if (segment.includes('covered')) return 'covered';
  return 'unspecified';
}

function versionStatusForBadge(cell: CoverageCell | undefined, version: string): CoverageCell['status'] {
  const status = versionStatus(cell, version);
  return status === 'unspecified' ? 'not_covered' : status;
}

function versionLabel(cell: CoverageCell | undefined, version: string) {
  const source = cell?.providerTextVerified ? cell.providerText : cell?.providerLabel;
  if (!source) return '';
  const segment = source.split('|').map((part) => part.trim()).find((part) => part.toLowerCase().includes(version.toLowerCase()));
  return compactCoverageLabel(segment);
}

function versionCounts(row: MatrixRow, version: string) {
  const statuses = feeds.value.map((feed) => versionStatus(row.coverage[feed.id], version));
  return {
    covered: statuses.filter((status) => status === 'covered').length,
    partial: statuses.filter((status) => status === 'partial').length,
    missing: statuses.filter((status) => status === 'not_covered').length,
    unspecified: statuses.filter((status) => status === 'unspecified').length,
  };
}

function openRow(event: MouseEvent | KeyboardEvent, id: string) {
  if (event.target instanceof Element && event.target.closest('a,button,details,summary')) return;
  return navigateTo(`/protocols/${id}`);
}

function startTableDrag(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !tableScroll.value) return;
  if (event.target instanceof Element && event.target.closest('a,button,input,select,textarea,details,summary')) return;
  dragStartX = event.clientX;
  dragStartScrollLeft = tableScroll.value.scrollLeft;
  didDragTable = false;
  isDraggingTable.value = true;
}

function moveTableDrag(event: PointerEvent) {
  if (!isDraggingTable.value || !tableScroll.value) return;
  const distance = event.clientX - dragStartX;
  if (Math.abs(distance) > 4 && !didDragTable) {
    didDragTable = true;
    tableScroll.value.setPointerCapture(event.pointerId);
  }
  tableScroll.value.scrollLeft = dragStartScrollLeft - distance;
  if (didDragTable) event.preventDefault();
}

function endTableDrag(event: PointerEvent) {
  if (!isDraggingTable.value || !tableScroll.value) return;
  isDraggingTable.value = false;
  dragEndX = event.clientX;
  dragEndY = event.clientY;
  if (tableScroll.value.hasPointerCapture(event.pointerId)) tableScroll.value.releasePointerCapture(event.pointerId);
  window.setTimeout(() => { didDragTable = false; }, 250);
}

function suppressClickAfterDrag(event: MouseEvent) {
  if (!didDragTable) return;
  if (Math.abs(event.clientX - dragEndX) > 3 || Math.abs(event.clientY - dragEndY) > 3) {
    didDragTable = false;
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  didDragTable = false;
}
</script>

<template>
  <div>
    <section class="border-b border-ink-200 bg-white">
      <div class="app-shell grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-blue">Protocol registry</p>
          <h1 class="max-w-4xl text-3xl font-semibold text-ink-950 sm:text-5xl">Compare protocol evidence across every
            source.</h1>
          <p class="mt-4 max-w-3xl text-base leading-7 text-ink-600">Provider-native ratings, version scope, and
            coverage states stay attributed and side by side, without an aggregate verdict.</p>
        </div>
        <dl class="registry-stats">
          <div>
            <dt>Protocols</dt>
            <dd>{{ rows.length }}</dd>
          </div>
          <div>
            <dt>Sources</dt>
            <dd>{{ feeds.length }}</dd>
          </div>
          <div>
            <dt>Sourced entries</dt>
            <dd>{{ data.stats.positiveCells }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <main class="app-shell py-6">
      <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px] mb-6">
        <label class="relative block">
          <Search class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" :size="18" /><span
            class="sr-only">Search protocols</span><input v-model="query"
            class="h-12 w-full rounded-md border border-ink-300 bg-white pl-10 pr-3 outline-none focus:border-signal-blue"
            placeholder="Search protocol, category, or version">
        </label>
        <label class="relative block">
          <SlidersHorizontal class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
            :size="18" /><span class="sr-only">Filter category</span><select v-model="category"
            class="h-12 w-full appearance-none rounded-md border border-ink-300 bg-white pl-10 pr-3 text-sm font-semibold">
            <option value="all">All categories</option>
            <option v-for="item in categories" :key="item" :value="item">{{ categoryLabels[item] }}</option>
          </select>
        </label>
        <label><span class="sr-only">Filter coverage</span><select v-model="minimumCoverage"
            class="h-12 w-full rounded-md border border-ink-300 bg-white px-3 text-sm font-semibold">
            <option value="all">Any coverage status</option>
            <option value="covered">Has covered source</option>
            <option value="partial">Covered or partial</option>
          </select></label>
      </div>

      <div v-if="sortedRows.length === 0" class="empty-state">
        <Search :size="22" /><strong>No protocols match these filters.</strong><button type="button"
          @click="resetFilters">
          <RotateCcw :size="14" /> Reset filters
        </button>
      </div>

      <div v-if="sortedRows.length > 0" class="mobile-registry md:hidden">
        <article v-for="row in sortedRows" :key="row.id" class="protocol-card">
          <NuxtLink :to="`/protocols/${row.id}`" class="card-heading"><img :src="`/icons/protocols/${row.id}.png`"
              :alt="row.name" width="38" height="38">
            <div>
              <h2>{{ row.name }}</h2><span>{{ categoryLabels[row.category] }}</span>
            </div>
            <MetricCell :protocol-id="row.id" :metric="row.defillama.metric" show-source />
          </NuxtLink>
          <p>{{ row.summary }}</p>
          <div class="coverage-counts"><span><b>{{ row.coverageCount }}</b> covered</span><span><b>{{ row.partialCount
          }}</b> partial</span><span><b>{{ missingCount(row) }}</b> missing</span></div>
          <button v-if="row.versions.length > 1" type="button" class="version-toggle"
            :aria-expanded="expanded.has(row.id)" @click="toggleExpanded(row.id)">
            <ChevronDown v-if="expanded.has(row.id)" :size="15" />
            <ChevronRight v-else :size="15" /> {{ row.versions.length }} protocol versions
          </button>
          <div v-if="expanded.has(row.id)" class="mobile-versions">
            <div v-for="version in row.versions" :key="version"><strong>{{ version }}</strong><span>{{
              versionCounts(row, version).covered }} covered · {{ versionCounts(row, version).partial }} partial · {{
                  versionCounts(row, version).unspecified }} scope unspecified</span></div>
          </div>
          <details class="provider-evidence">
            <summary>View all {{ feeds.length }} provider cells</summary>
            <div class="provider-grid">
              <NuxtLink v-for="feed in feeds" :key="feed.id" :to="`/protocols/${row.id}`"><span>{{ feed.shortName ??
                feed.name }}</span>
                <StatusBadge :status="row.coverage[feed.id]?.status ?? 'not_covered'" compact /><strong
                  v-if="conciseLabel(row.coverage[feed.id])">{{ conciseLabel(row.coverage[feed.id]) }}</strong>
              </NuxtLink>
            </div>
          </details>
        </article>
      </div>

      <div v-if="sortedRows.length > 0" ref="tableScroll" class="evidence-table-wrap hidden md:block"
        :class="{ dragging: isDraggingTable }" data-testid="evidence-table-scroll" @pointerdown="startTableDrag"
        @pointermove="moveTableDrag" @pointerup="endTableDrag" @pointercancel="endTableDrag"
        @click.capture="suppressClickAfterDrag" @dragstart.prevent>
        <table class="evidence-table">
          <thead>
            <tr>
              <th class="sticky-protocol"><button type="button" @click="setSort('name')">Protocol <span>{{ sortKey ===
                'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}</span></button></th>
              <th><button type="button" @click="setSort('metric')">TVL / volume <span>{{ sortKey === 'metric' ?
                (sortDirection === 'asc' ? '↑' : '↓') : '' }}</span></button></th>
              <th class="coverage-head">
                <div><button type="button" @click="setSort('coverage')">Coverage <span>{{ sortKey === 'coverage' ?
                  (sortDirection === 'asc' ? '↑' : '↓') : '' }}</span></button>
                  <CoverageHelp header />
                </div>
              </th>
              <th v-for="feed in feeds" :key="feed.id" class="provider-head">
                <NuxtLink :to="`/feeds/${feed.id}`">{{ feed.name }}</NuxtLink><span>{{ feed.type
                }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in sortedRows" :key="row.id">
              <tr class="protocol-row" tabindex="0" :aria-label="`Open ${row.name} protocol profile`"
                @click="openRow($event, row.id)" @keydown.enter="openRow($event, row.id)">
                <td class="sticky-protocol">
                  <div class="protocol-cell"><button v-if="row.versions.length > 1" type="button" class="version-expand"
                      :aria-label="`${expanded.has(row.id) ? 'Collapse' : 'Expand'} ${row.name} versions`"
                      :aria-expanded="expanded.has(row.id)"
                      :title="`${expanded.has(row.id) ? 'Collapse' : 'Show'} ${row.name} versions`" @pointerdown.stop
                      @click.stop="toggleExpanded(row.id)">
                      <ChevronDown v-if="expanded.has(row.id)" :size="17" />
                      <ChevronRight v-else :size="17" />
                    </button><span v-else class="indent" /><img :src="`/icons/protocols/${row.id}.png`" :alt="row.name"
                      width="30" height="30">
                    <div>
                      <NuxtLink :to="`/protocols/${row.id}`">{{ row.name }}</NuxtLink><small>{{
                        categoryLabels[row.category] }}<template v-if="row.versions.length > 1"> · {{
                          row.versions.length }} versions</template></small>
                    </div>
                  </div>
                </td>
                <td class="metric-cell"><a class="metric-chip" :href="row.links.defillama" target="_blank"
                    rel="noreferrer" :title="metricTitle(row)"
                    :aria-label="`${row.name} ${metricLabel(row)} on DefiLlama`"><strong>{{
                      formatMetricValue(row) }}</strong><span>{{ metricLabel(row) }}</span>
                    <ExternalLink :size="12" aria-hidden="true" />
                  </a></td>
                <td>
                  <div class="coverage-meter-cell" :title="coverageTitle(row)">
                    <div class="coverage-rail" aria-hidden="true"><i class="covered"
                        :style="{ width: coveragePercent(row.coverageCount) }" /><i class="partial"
                        :style="{ width: coveragePercent(row.partialCount) }" /><i class="missing"
                        :style="{ width: coveragePercent(missingCount(row)) }" /></div>
                    <div class="coverage-tally" :aria-label="coverageTitle(row)"><span><b>{{ row.coverageCount }}</b>
                        covered</span><span><b>{{ row.partialCount }}</b> partial</span><span><b>{{ missingCount(row)
                        }}</b>
                        missing</span></div>
                  </div>
                </td>
                <td v-for="feed in feeds" :key="feed.id" class="provider-cell">
                  <div class="provider-cell-inner">
                    <StatusBadge :status="row.coverage[feed.id]?.status ?? 'not_covered'" compact /><strong
                      v-if="conciseLabel(row.coverage[feed.id])" :title="conciseLabel(row.coverage[feed.id])">{{
                        conciseLabel(row.coverage[feed.id]) }}</strong>
                  </div>
                </td>
              </tr>
              <tr v-for="version in (expanded.has(row.id) ? row.versions : [])" :key="`${row.id}-${version}`"
                class="version-row">
                <td class="sticky-protocol">
                  <div class="version-name"><span />
                    <div><strong>{{ version }}</strong><small>Explicitly version-scoped evidence only</small></div>
                  </div>
                </td>
                <td><span class="not-applicable">Uses parent metric</span></td>
                <td>
                  <div class="coverage-meter-cell version-meter" :title="versionCoverageTitle(row, version)">
                    <div class="coverage-rail" aria-hidden="true"><i class="covered"
                        :style="{ width: coveragePercent(versionCounts(row, version).covered) }" /><i class="partial"
                        :style="{ width: coveragePercent(versionCounts(row, version).partial) }" /><i class="missing"
                        :style="{ width: coveragePercent(versionCounts(row, version).missing) }" /><i class="unspecified"
                        :style="{ width: coveragePercent(versionCounts(row, version).unspecified) }" /></div>
                    <div class="coverage-tally" :aria-label="versionCoverageTitle(row, version)"><span><b>{{
                      versionCounts(row, version).covered }}</b> covered</span><span><b>{{
                        versionCounts(row, version).partial }}</b> partial</span><span><b>{{
                          versionCounts(row, version).missing }}</b> missing</span><span><b>{{
                            versionCounts(row, version).unspecified }}</b> not scoped</span></div>
                  </div>
                </td>
                <td v-for="feed in feeds" :key="feed.id" class="provider-cell version">
                  <div class="provider-cell-inner"><template
                      v-if="versionStatus(row.coverage[feed.id], version) !== 'unspecified'">
                      <StatusBadge :status="versionStatusForBadge(row.coverage[feed.id], version)" compact /><strong
                        v-if="versionLabel(row.coverage[feed.id], version)">{{
                          versionLabel(row.coverage[feed.id], version) }}</strong>
                    </template><span v-else class="not-scoped">Not scoped</span></div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.registry-stats {
  background: var(--color-ink-50);
  border: 1px solid var(--color-ink-200);
  border-radius: .7rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  padding: 1rem;
}

.registry-stats div {
  border-left: 1px solid var(--color-ink-200);
  padding-left: .75rem;
}

.registry-stats div:first-child {
  border: 0;
  padding-left: 0;
}

.registry-stats dt {
  color: var(--color-ink-500);
  font-size: .58rem;
  font-weight: 800;
  line-height: 1.1;
  min-height: 1.3rem;
  text-transform: uppercase;
}

.registry-stats dd {
  color: var(--color-ink-950);
  font-size: 1.35rem;
  font-weight: 750;
  margin: .08rem 0 0;
}

.empty-state {
  background: var(--color-white);
  border: 1px dashed var(--color-ink-300);
  border-radius: .7rem;
  display: grid;
  gap: .5rem;
  justify-items: center;
  padding: 3rem;
  text-align: center;
}

.empty-state button {
  align-items: center;
  color: var(--color-signal-blue);
  display: flex;
  font-size: .75rem;
  font-weight: 700;
  gap: .3rem;
}

.mobile-registry {
  display: grid;
  gap: .75rem;
}

.protocol-card {
  background: var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-radius: .7rem;
  padding: 1rem;
}

.card-heading {
  align-items: center;
  color: inherit;
  display: grid;
  gap: .7rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.card-heading img {
  background: white;
  border: 1px solid var(--color-ink-100);
  border-radius: .5rem;
  object-fit: contain;
}

.card-heading h2 {
  color: var(--color-ink-950);
  font-size: 1rem;
  margin: 0;
}

.card-heading span {
  color: var(--color-ink-500);
  font-size: .62rem;
  font-weight: 700;
  text-transform: uppercase;
}

.protocol-card>p {
  color: var(--color-ink-600);
  font-size: .78rem;
  line-height: 1.55;
}

.coverage-counts {
  border-top: 1px solid var(--color-ink-100);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding-top: .75rem;
}

.coverage-counts span {
  color: var(--color-ink-500);
  font-size: .65rem;
}

.coverage-counts b {
  color: var(--color-ink-950);
}

.version-toggle,
.provider-evidence summary {
  align-items: center;
  color: var(--color-signal-blue);
  display: flex;
  font-size: .7rem;
  font-weight: 750;
  gap: .3rem;
  margin-top: .8rem;
}

.mobile-versions {
  background: var(--color-ink-50);
  border-radius: .5rem;
  display: grid;
  gap: .5rem;
  margin-top: .5rem;
  padding: .7rem;
}

.mobile-versions strong,
.mobile-versions span {
  display: block;
}

.mobile-versions strong {
  color: var(--color-ink-950);
  font-size: .72rem;
}

.mobile-versions span {
  color: var(--color-ink-500);
  font-size: .62rem;
  margin-top: .15rem;
}

.provider-grid {
  display: grid;
  gap: .4rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: .65rem;
}

.provider-grid a {
  background: var(--color-ink-50);
  border: 1px solid var(--color-ink-100);
  border-radius: .45rem;
  display: grid;
  gap: .35rem;
  min-width: 0;
  padding: .55rem;
}

.provider-grid a>span {
  color: var(--color-ink-700);
  font-size: .63rem;
  font-weight: 750;
}

.provider-grid strong {
  color: var(--color-ink-950);
  font-size: .65rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.evidence-table-wrap {
  border: 1px solid var(--color-ink-200);
  border-radius: .7rem;
  cursor: grab;
  max-width: 100%;
  overflow: auto;
}

.evidence-table-wrap.dragging {
  cursor: grabbing;
  scroll-behavior: auto;
  user-select: none;
}

.evidence-table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: auto;
  width: max-content;
}

.evidence-table th,
.evidence-table td {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-ink-100);
  border-right: 1px solid var(--color-ink-100);
  padding: .65rem;
  text-align: left;
  vertical-align: top;
}

.evidence-table thead th {
  background: var(--color-ink-50);
  color: var(--color-ink-500);
  font-size: .62rem;
  font-weight: 800;
  position: sticky;
  text-transform: uppercase;
  top: 0;
  z-index: 5;
}

.evidence-table thead button {
  font-weight: inherit;
  text-transform: inherit;
}

.sticky-protocol {
  left: 0;
  min-width: 260px;
  position: sticky !important;
  z-index: 4;
}

.evidence-table thead .sticky-protocol {
  z-index: 8;
}

.provider-head {
  min-width: 5.25rem;
  text-align: center !important;
}

.provider-head a {
  color: var(--color-ink-900);
  display: block;
  font-size: .7rem;
  line-height: 1.12;
  margin-inline: auto;
  text-align: center;
  text-transform: none;
  white-space: normal;
}

.provider-head span {
  display: block;
  font-size: .55rem;
  margin: .16rem auto 0;
  max-width: 3rem;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.protocol-row {
  cursor: pointer;
}

.protocol-row:hover td {
  background: var(--color-ink-50);
}

.protocol-cell {
  align-items: center;
  display: grid;
  gap: .45rem;
  grid-template-columns: 1.75rem 30px minmax(0, 1fr);
}

.version-expand {
  align-items: center;
  align-self: center;
  background: var(--color-ink-100);
  border: 1px solid transparent;
  border-radius: .4rem;
  color: var(--color-ink-600);
  cursor: pointer;
  display: inline-flex;
  height: 1.75rem;
  justify-content: center;
  padding: 0;
  transition: background .15s, border-color .15s, color .15s;
  width: 1.75rem;
}

.version-expand:hover {
  background: var(--color-white);
  border-color: var(--color-ink-300);
  color: var(--color-signal-blue);
}

.version-expand[aria-expanded="true"] {
  background: var(--color-ink-200);
  color: var(--color-signal-blue);
}

.protocol-cell .indent {
  width: 1.75rem;
}

.protocol-cell img {
  background: white;
  border: 1px solid var(--color-ink-100);
  border-radius: .4rem;
  object-fit: contain;
}

.protocol-cell a {
  color: var(--color-ink-950);
  font-size: .78rem;
  font-weight: 750;
}

.protocol-cell small,
.version-name small {
  color: var(--color-ink-500);
  display: block;
  font-size: .58rem;
  margin-top: .15rem;
}

.coverage-summary {
  display: grid;
  gap: .15rem;
  min-width: 105px;
}

.coverage-summary span {
  color: var(--color-ink-500);
  font-size: .62rem;
}

.coverage-summary b {
  color: var(--color-ink-900);
}

.coverage-summary small {
  color: var(--color-ink-500);
  font-size: .55rem;
  margin-top: .2rem;
}

.provider-cell strong {
  color: var(--color-ink-900);
  display: -webkit-box;
  font-size: .62rem;
  line-height: 1.35;
  margin-top: .35rem;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.version-row td {
  background: var(--color-ink-50);
}

.version-name {
  align-items: start;
  display: grid;
  gap: .6rem;
  grid-template-columns: 2.4rem minmax(0, 1fr);
}

.version-name>span {
  border-bottom: 1px solid var(--color-ink-300);
  border-left: 1px solid var(--color-ink-300);
  height: .7rem;
  margin-left: 1rem;
}

.version-name strong {
  color: var(--color-ink-900);
  font-size: .7rem;
}

.not-scoped,
.not-applicable {
  color: var(--color-ink-500);
  font-size: .58rem;
  font-style: italic;
}

.evidence-table-wrap {
  contain: layout paint inline-size;
  isolation: isolate;
  min-width: 0;
  width: 100%;
}

.evidence-table th,
.evidence-table td {
  padding: .48rem .55rem;
  vertical-align: middle;
}

.coverage-head>div {
  align-items: center;
  display: inline-flex;
  gap: .3rem;
  min-width: 170px;
}

.metric-cell {
  min-width: 118px;
}

.metric-chip {
  align-items: baseline;
  background: linear-gradient(90deg, var(--color-ink-50), var(--color-white));
  border: 1px solid var(--color-ink-200);
  border-left: 3px solid var(--color-signal-blue);
  border-radius: .5rem;
  display: inline-flex;
  gap: .38rem;
  min-width: 7rem;
  padding: .36rem .5rem;
  text-decoration: none;
  white-space: nowrap;
}

.metric-chip:hover {
  border-color: var(--color-ink-300);
  box-shadow: inset 0 -1px 0 var(--color-signal-blue);
}

.metric-chip strong {
  color: var(--color-ink-950);
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: -.01em;
}

.metric-chip span {
  color: var(--color-ink-500);
  font-size: .55rem;
  font-weight: 850;
  text-transform: uppercase;
}

.metric-chip svg {
  color: var(--color-ink-500);
  flex: 0 0 auto;
  transform: translateY(.08rem);
}

.metric-chip:hover svg {
  color: var(--color-signal-blue);
}

.coverage-meter-cell {
  display: grid;
  gap: .32rem;
  min-width: 170px;
}

.coverage-rail {
  background: var(--color-ink-100);
  border: 1px solid var(--color-ink-200);
  border-radius: 99px;
  display: flex;
  height: .42rem;
  overflow: hidden;
}

.coverage-rail i {
  min-width: 0;
}

.coverage-rail .covered {
  background: var(--color-signal-green);
}

.coverage-rail .partial {
  background: var(--color-signal-amber);
}

.coverage-rail .missing {
  background: var(--color-ink-300);
}

.coverage-rail .unspecified {
  background: var(--color-ink-100);
}

.coverage-tally {
  align-items: center;
  color: var(--color-ink-500);
  display: flex;
  flex-wrap: nowrap;
  font-size: .58rem;
  gap: .42rem;
  line-height: 1;
  white-space: nowrap;
}

.coverage-tally b {
  color: var(--color-ink-950);
  font-size: .68rem;
  font-weight: 850;
}

.version-meter {
  min-width: 215px;
}

.provider-cell {
  max-width: 3.75rem;
  min-width: 3.75rem;
  padding-inline: .24rem !important;
  text-align: center;
  width: 3.75rem;
}

.provider-cell-inner {
  display: grid;
  justify-items: center;
  margin-inline: auto;
  min-width: 0;
  width: 100%;
}

.provider-cell :deep(.status-badge) {
  margin-inline: auto;
}

.provider-cell strong {
  display: block;
  font-size: .6rem;
  line-height: 1.1;
  margin-top: .24rem;
  max-width: 3.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  -webkit-box-orient: initial;
  -webkit-line-clamp: unset;
}

@media (min-width:768px) {
  .mobile-registry {
    display: none;
  }
}
</style>
