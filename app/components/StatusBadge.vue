<script setup lang="ts">
import { Ban, CheckCircle2, CircleDashed } from '@lucide/vue';
import { statusLabels, type CoverageCell } from '#openrisk';

const props = defineProps<{
  status: CoverageCell['status'];
  compact?: boolean;
}>();

const tone = computed(() => {
  if (props.status === 'covered') return 'covered';
  if (props.status === 'partial') return 'partial';
  return 'missing';
});
</script>

<template>
  <span class="status-badge" :class="[tone, compact && 'compact']">
    <CheckCircle2 v-if="status === 'covered'" :size="compact ? 14 : 16" aria-hidden="true" />
    <CircleDashed v-else-if="status === 'partial'" :size="compact ? 14 : 16" aria-hidden="true" />
    <Ban v-else :size="compact ? 14 : 16" aria-hidden="true" />
    <span>{{ statusLabels[status] }}</span>
  </span>
</template>

<style scoped>
.status-badge {
  align-items: center;
  border: 1px solid;
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  gap: 6px;
  line-height: 1;
  padding: 6px 8px;
  white-space: nowrap;
}

.status-badge.compact {
  font-size: 0;
  padding: 5px;
}

.status-badge.compact span {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.covered {
  background: #e7f7ef;
  border-color: #9bd9b9;
  color: #136340;
}

.partial {
  background: #fff3dc;
  border-color: #e7bd79;
  color: #824f0e;
}

.missing {
  background: #f2f4f8;
  border-color: #d8dee7;
  color: #697383;
}
</style>
