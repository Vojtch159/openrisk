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
    <section class="border-b border-ink-200 bg-white">
      <div class="app-shell py-9">
        <div>
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-blue">Source directory</p>
          <h1 class="max-w-4xl text-3xl font-semibold text-ink-950 sm:text-5xl">Meet the risk intelligence sources.</h1>
          <p class="mt-4 max-w-3xl text-base leading-7 text-ink-600">Compare focus, methodology, independence, machine-readability, and protocol coverage across every provider in the registry.</p>
        </div>
      </div>
    </section>

    <main class="app-shell py-6">
      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_220px]">
        <label class="relative block">
          <Search class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" :size="18" />
          <span class="sr-only">Search sources</span>
          <input v-model="query" class="h-12 w-full rounded-md border border-ink-300 bg-white pl-10 pr-3 outline-none focus:border-signal-blue focus:ring-4 focus:ring-blue-100" placeholder="Search provider, focus, or methodology">
        </label>
        <label class="relative block">
          <SlidersHorizontal class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" :size="18" />
          <span class="sr-only">Filter source type</span>
          <select v-model="type" class="h-12 w-full appearance-none rounded-md border border-ink-300 bg-white pl-10 pr-3 text-sm font-semibold">
            <option value="all">All source types</option><option value="rating">Ratings</option><option value="dashboard">Dashboards</option><option value="monitoring">Monitoring</option><option value="research">Research</option>
          </select>
        </label>
        <label>
          <span class="sr-only">Filter machine-readability</span>
          <select v-model="readability" class="h-12 w-full rounded-md border border-ink-300 bg-white px-3 text-sm font-semibold">
            <option value="all">Any machine-readability</option><option value="yes">Machine-readable</option><option value="partial">Partially readable</option><option value="no">Manual only</option>
          </select>
        </label>
      </div>

      <div class="mb-3 mt-5 flex items-center justify-between gap-4">
        <p class="text-sm font-semibold text-ink-950">{{ filteredFeeds.length }} sources</p>
        <p class="text-xs text-ink-500">Coverage is descriptive, not a quality ranking.</p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <NuxtLink v-for="feed in filteredFeeds" :key="feed.id" :to="`/feeds/${feed.id}`" class="group flex min-h-60 flex-col rounded-lg border border-ink-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-ink-300 hover:shadow-md">
          <div class="flex items-start justify-between gap-4">
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-ink-950 text-white"><Database :size="18" /></div>
              <div><h2 class="font-semibold text-ink-950">{{ feed.name }}</h2><p class="mt-0.5 text-xs font-bold uppercase text-signal-blue">{{ feed.type }}</p></div>
            </div>
            <ArrowRight class="mt-2 text-ink-300 transition group-hover:translate-x-1 group-hover:text-signal-blue" :size="18" />
          </div>
          <p class="mt-4 text-sm leading-6 text-ink-600">{{ feed.focus }}</p>
          <div class="mt-auto grid grid-cols-3 gap-2 border-t border-ink-100 pt-4 text-center">
            <div><strong>{{ feed.covered }}</strong><span>Covered</span></div>
            <div><strong>{{ feed.partial }}</strong><span>Partial</span></div>
            <div><strong class="capitalize">{{ feed.machineReadable }}</strong><span>Readable</span></div>
          </div>
          <p v-if="feed.independence" class="mt-3 text-xs text-ink-500"><span class="font-semibold capitalize text-ink-700">{{ feed.independence.replaceAll('_', ' ') }}</span><span v-if="feed.independenceNote"> · {{ feed.independenceNote }}</span></p>
        </NuxtLink>
      </div>

      <div v-if="filteredFeeds.length === 0" class="mt-4 rounded-lg border border-dashed border-ink-300 bg-white px-4 py-12 text-center text-sm text-ink-600">No sources match those filters.</div>
    </main>
  </div>
</template>

<style scoped>
.group strong { color: var(--color-ink-950); display: block; font-size: .9rem; }
.group div span { color: var(--color-ink-500); display: block; font-size: .58rem; font-weight: 750; margin-top: .15rem; text-transform: uppercase; }
</style>
