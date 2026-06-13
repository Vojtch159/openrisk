<script setup lang="ts">
import { ExternalLink } from '@lucide/vue';
import type { Protocol } from '#openrisk';

const route = useRoute();
const feedId = computed(() => String(route.params.id));

const { feed, isLoading, protocols } = useFeedDetail(feedId);
const protocolById = computed(() => Object.fromEntries(
  protocols.value.map((protocol) => [protocol.id, protocol]),
) as Record<string, Protocol>);
const reporting = computed(() => feed.value?.coverage.filter((cell) => cell.status !== 'not_covered') ?? []);
</script>

<template>
  <div class="app-shell py-8">
    <div v-if="isLoading" class="text-sm text-ink-600">Loading feed...</div>

    <div v-else-if="feed" class="space-y-6">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SectionHeader :eyebrow="feed.type" :title="feed.name" :description="feed.focus" />
        <div class="rounded-lg border border-ink-200 bg-white p-5 shadow-sm">
          <div class="grid grid-cols-2 gap-3">
            <div><div class="text-xs font-bold uppercase text-ink-500">Reporting</div><div class="mt-1 text-2xl font-semibold text-ink-950">{{ reporting.length }}/20</div></div>
            <div><div class="text-xs font-bold uppercase text-ink-500">Machine-readable</div><div class="mt-1 text-sm font-semibold text-ink-950">{{ feed.machineReadable }}</div></div>
          </div>
          <div v-if="feed.independence" class="mt-4 rounded border border-ink-200 bg-ink-50 px-3 py-2 text-sm text-ink-700">
            <strong class="capitalize">{{ feed.independence.replaceAll('_', ' ') }}</strong>
            <p v-if="feed.independenceNote" class="mt-1 text-xs leading-5 text-ink-600">{{ feed.independenceNote }}</p>
          </div>
          <a :href="feed.links.homepage" target="_blank" rel="noreferrer" class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-signal-blue">
            Provider site
            <ExternalLink :size="15" aria-hidden="true" />
          </a>
        </div>
      </div>

      <section class="rounded-lg border border-ink-200 bg-white shadow-sm">
        <div class="border-b border-ink-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-ink-950">Provider methodology</h2>
        </div>
        <p class="p-5 text-sm leading-6 text-ink-700">{{ feed.methodology }}</p>
      </section>

      <section class="rounded-lg border border-ink-200 bg-white shadow-sm">
        <div class="border-b border-ink-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-ink-950">Protocol coverage</h2>
        </div>
        <div class="divide-y divide-ink-100">
          <article
            v-for="cell in feed.coverage"
            :key="cell.protocolId"
            class="grid gap-3 p-5 hover:bg-ink-50 sm:grid-cols-[200px_150px_minmax(0,1fr)_auto]"
          >
            <NuxtLink :to="`/protocols/${cell.protocolId}`" class="font-semibold text-ink-950 hover:text-signal-blue">{{ protocolById[cell.protocolId]?.name ?? cell.protocolId }}</NuxtLink>
            <StatusBadge :status="cell.status" />
            <span class="text-sm leading-6 text-ink-700">
              {{ cell.scope || cell.summary || cell.notes || 'No protocol-specific coverage found.' }}
              <strong v-if="cell.providerText" class="mt-1 block text-ink-950">{{ cell.providerText }}</strong>
            </span>
            <ProvenanceTag v-if="cell.source" :label="cell.source.label" :provenance="cell.source.provenance" :url="cell.source.url" />
            <span v-else class="text-xs text-ink-500">No source entry</span>
          </article>
        </div>
      </section>
    </div>

    <div v-else class="rounded-lg border border-ink-200 bg-white p-8 text-center">
      <h1 class="text-xl font-semibold text-ink-950">Feed not found</h1>
      <NuxtLink to="/" class="mt-3 inline-block text-sm font-semibold text-signal-blue">Return to protocols</NuxtLink>
    </div>
  </div>
</template>
