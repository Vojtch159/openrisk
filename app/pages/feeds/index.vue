<script setup lang="ts">
import { ArrowRight, Database, Search, SlidersHorizontal } from '@lucide/vue';

const query = ref('');
const type = ref('all');
const readability = ref('all');
const { data, feeds } = useFeeds();

const directory = computed(() => feeds.value.map((feed) => {
  const coverage = data.value.feedDetails[feed.id]?.coverage ?? [];
  return {
    ...feed,
    covered: coverage.filter((cell) => cell.status === 'covered').length,
    partial: coverage.filter((cell) => cell.status === 'partial').length,
  };
}));

const filteredFeeds = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return directory.value.filter((feed) => {
    const matchesText = !needle || [feed.name, feed.focus, feed.methodology, feed.type]
      .join(' ')
      .toLowerCase()
      .includes(needle);
    const matchesType = type.value === 'all' || feed.type === type.value;
    const matchesReadability = readability.value === 'all' || feed.machineReadable === readability.value;
    return matchesText && matchesType && matchesReadability;
  });
});

</script>

<template>
  <div>
    <section class="source-hero">
      <div class="app-shell py-9">
        <div>
          <p class="page-eyebrow source-eyebrow">Source directory</p>
          <h1 class="page-title source-title">Read the sources before the summary.</h1>
          <p class="source-lede">Compare focus, methodology, independence, machine-readability, and protocol coverage across every provider in the registry.</p>
        </div>
      </div>
    </section>

    <main class="app-shell py-6">
      <div class="source-controls grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_220px]">
        <label class="relative block">
          <Search class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" :size="18" />
          <span class="sr-only">Search sources</span>
          <input v-model="query" class="h-12 w-full border border-ink-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-signal-blue" placeholder="Search provider, focus, or methodology">
        </label>
        <label class="relative block">
          <SlidersHorizontal class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" :size="18" />
          <span class="sr-only">Filter source type</span>
          <select v-model="type" class="h-12 w-full appearance-none border border-ink-300 bg-white pl-10 pr-3 text-sm font-semibold">
            <option value="all">All source types</option><option value="rating">Ratings</option><option value="dashboard">Dashboards</option><option value="monitoring">Monitoring</option><option value="research">Research</option>
          </select>
        </label>
        <label>
          <span class="sr-only">Filter machine-readability</span>
          <select v-model="readability" class="h-12 w-full border border-ink-300 bg-white px-3 text-sm font-semibold">
            <option value="all">Any machine-readability</option><option value="yes">Machine-readable</option><option value="partial">Partially readable</option><option value="no">Manual only</option>
          </select>
        </label>
      </div>

      <div class="mb-3 mt-5 flex items-center justify-between gap-4">
        <p class="text-sm font-semibold text-ink-950">{{ filteredFeeds.length }} sources</p>
        <p class="text-xs text-ink-500">Coverage is descriptive, not a quality ranking.</p>
      </div>

      <div class="source-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <NuxtLink v-for="feed in filteredFeeds" :key="feed.id" :to="`/feeds/${feed.id}`" class="source-card">
          <div class="source-card-header flex items-start justify-between gap-4">
            <div class="flex min-w-0 items-center gap-3">
              <div class="source-card-mark"><Database :size="17" /></div>
              <div><h2>{{ feed.name }}</h2><p>{{ feed.type }}</p></div>
            </div>
            <ArrowRight class="source-arrow" :size="18" />
          </div>
          <p class="source-card-focus text-sm leading-6 text-ink-600">{{ feed.focus }}</p>
          <div class="source-card-metrics grid grid-cols-3 gap-2 border-t border-ink-100 pt-4 text-center">
            <div><strong>{{ feed.covered }}</strong><span>Covered</span></div>
            <div><strong>{{ feed.partial }}</strong><span>Partial</span></div>
            <div><strong class="capitalize">{{ feed.machineReadable }}</strong><span>Readable</span></div>
          </div>
          <p v-if="feed.independence" class="source-card-independence text-xs text-ink-500"><span class="font-semibold capitalize text-ink-700">{{ feed.independence.replaceAll('_', ' ') }}</span><span v-if="feed.independenceNote"> · {{ feed.independenceNote }}</span></p>
        </NuxtLink>
      </div>

      <div v-if="filteredFeeds.length === 0" class="mt-4 rounded-sm border border-dashed border-ink-300 bg-white px-4 py-12 text-center text-sm text-ink-600">No sources match those filters.</div>
    </main>
  </div>
</template>

<style scoped>
.source-hero {
  background: color-mix(in srgb, var(--color-white) 86%, transparent);
  border-bottom: 1px solid var(--color-ink-200);
}

.source-eyebrow {
  color: var(--color-signal-blue);
  font-family: var(--font-mono);
  font-weight: 700;
  margin: 0 0 .85rem;
}

.source-title {
  text-wrap: balance;
}

.source-lede {
  color: var(--color-ink-600);
  line-height: 1.75;
  margin: 1rem 0 0;
  max-width: 46rem;
}

.source-controls input,
.source-controls select {
  border-radius: .3rem;
  color: var(--color-ink-900);
}

.source-card {
  background: var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-radius: .35rem;
  box-shadow: var(--shadow-line);
  color: inherit;
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid;
  padding: 1rem;
  row-gap: 0;
  text-decoration: none;
  transition: border-color .15s ease, background .15s ease;
}

.source-card:hover {
  background: color-mix(in srgb, var(--color-white) 86%, var(--color-ink-50));
  border-color: var(--rule-strong);
}

.source-card h2 {
  color: var(--color-ink-950);
  font-size: .98rem;
  font-weight: 740;
  letter-spacing: -.01em;
  margin: 0;
}

.source-card h2 + p {
  color: var(--color-signal-blue);
  font-family: var(--font-mono);
  font-size: .76rem;
  font-weight: 700;
  margin-top: .2rem;
}

.source-card-mark {
  align-items: center;
  background: var(--accent-mark);
  border-radius: .25rem;
  color: var(--accent-mark-ink);
  display: flex;
  flex: 0 0 auto;
  height: 2.35rem;
  justify-content: center;
  width: 2.35rem;
}

.source-card-focus {
  margin: 1rem 0 0;
}

.source-card-metrics {
  align-self: start;
}

.source-card-independence {
  margin: .75rem 0 0;
}

.source-arrow {
  color: var(--color-ink-300);
  margin-top: .55rem;
  transition: transform .15s ease, color .15s ease;
}

.source-card:hover .source-arrow {
  color: var(--color-signal-blue);
  transform: translateX(.18rem);
}

.source-card strong {
  color: var(--color-ink-950);
  display: block;
  font-family: var(--font-mono);
  font-size: .86rem;
}

.source-card div span {
  color: var(--color-ink-500);
  display: block;
  font-family: var(--font-mono);
  font-size: .75rem;
  font-weight: 700;
  margin-top: .15rem;
}
</style>
