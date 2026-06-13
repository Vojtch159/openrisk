<script setup lang="ts">
defineProps<{
  label: string;
  provenance: string;
  url?: string;
}>();
</script>

<template>
  <a
    v-if="url"
    :href="url"
    target="_blank"
    rel="noreferrer"
    class="inline-flex items-center rounded-sm border border-ink-200 bg-white px-2 py-1 font-mono text-xs font-semibold text-ink-600 hover:border-ink-300 hover:text-ink-900"
  >
    {{ label }} · {{ provenance.replaceAll('_', ' ') }}
  </a>
  <span v-else class="inline-flex items-center rounded-sm border border-ink-200 bg-white px-2 py-1 font-mono text-xs font-semibold text-ink-600">
    {{ label }} · {{ provenance.replaceAll('_', ' ') }}
  </span>
</template>
