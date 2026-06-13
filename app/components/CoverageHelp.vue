<script setup lang="ts">
import { CircleHelp } from '@lucide/vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineProps<{ compact?: boolean; header?: boolean }>();

const details = ref<HTMLDetailsElement | null>(null);

function closeOnOutsidePointerDown(event: PointerEvent) {
  const element = details.value;
  if (!element?.open || !event.target) {
    return;
  }

  if (!element.contains(event.target as Node)) {
    element.open = false;
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', closeOnOutsidePointerDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutsidePointerDown);
});
</script>

<template>
  <details ref="details" class="coverage-help" :class="{ compact, header }">
    <summary><CircleHelp :size="15" aria-hidden="true" /> Coverage terms</summary>
    <div class="coverage-help-panel">
      <p><strong>Covered</strong><span>Protocol-specific intelligence is available for the relevant protocol or version.</span></p>
      <p><strong>Partially covered</strong><span>Only a version, market, vault, feature, or limited evidence set is covered.</span></p>
      <p><strong>Missing</strong><span>No protocol-specific provider entry has been found in this registry snapshot.</span></p>
    </div>
  </details>
</template>

<style scoped>
.coverage-help { position: relative; }
.coverage-help summary { align-items: center; color: var(--color-ink-600); cursor: pointer; display: inline-flex; font-size: .72rem; font-weight: 700; gap: .35rem; list-style: none; }
.coverage-help summary::-webkit-details-marker { display: none; }
.coverage-help summary:hover { color: var(--color-signal-blue); }
.coverage-help-panel { background: var(--color-white); border: 1px solid var(--color-ink-200); border-radius: .65rem; box-shadow: 0 14px 35px rgba(7,12,20,.16); display: grid; gap: .75rem; left: 0; margin-top: .5rem; padding: .85rem; position: absolute; top: 100%; width: min(22rem,calc(100vw - 2rem)); z-index: 30; }
.coverage-help-panel p { display: grid; gap: .15rem; margin: 0; }
.coverage-help-panel strong { color: var(--color-ink-950); font-size: .7rem; }
.coverage-help-panel span { color: var(--color-ink-600); font-size: .68rem; line-height: 1.45; }
.compact .coverage-help-panel { left: auto; right: 0; }
.header { display: inline-flex; vertical-align: middle; }
.header summary { border-radius: 999px; font-size: 0; gap: 0; justify-content: center; padding: .05rem; }
.header summary svg { color: var(--color-ink-500); height: .82rem; width: .82rem; }
.header summary:hover svg,
.header[open] summary svg { color: var(--color-signal-blue); }
.header .coverage-help-panel { left: 50%; text-transform: none; transform: translateX(-50%); }
</style>
