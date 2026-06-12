<script setup lang="ts">
const props = defineProps<{
  protocolId: string;
  metric: 'tvl' | 'volume';
  showFreshness?: boolean;
  showSource?: boolean;
}>();

const { formattedValue, isPending, asOfLabel, scopeNote } = useMetricCell(props.protocolId, props.metric);
</script>

<template>
  <div class="min-w-[92px]" :title="`${asOfLabel}${scopeNote ? ` · ${scopeNote}` : ''}`">
    <div class="text-sm font-semibold text-ink-900">
      <span v-if="isPending">Loading</span>
      <span v-else>{{ formattedValue }}</span>
    </div>
    <div class="text-xs uppercase text-ink-500">{{ metric === 'volume' ? '24h volume' : 'TVL' }}</div>
    <div v-if="showSource" class="mt-1 inline-flex rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink-500">DefiLlama</div>
    <div v-if="showFreshness" class="mt-1 text-[11px] normal-case text-ink-500">{{ asOfLabel }}</div>
    <div v-if="showFreshness && scopeNote" class="mt-1 max-w-64 text-[11px] leading-4 text-ink-500">{{ scopeNote }}</div>
  </div>
</template>
