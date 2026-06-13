<script setup lang="ts">
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
  <span
    class="status-badge"
    :class="[tone, compact && 'compact']"
    :aria-label="statusLabels[status]"
    :title="compact ? statusLabels[status] : undefined"
  >
    <span class="status-mark" aria-hidden="true" />
    <span class="status-text">{{ statusLabels[status] }}</span>
  </span>
</template>

<style scoped>
.status-badge {
  --status-border: color-mix(in srgb, var(--color-ink-500) 34%, transparent);
  --status-ink: var(--color-ink-600);
  --status-fill: var(--color-ink-500);
  --status-surface: color-mix(in srgb, var(--color-ink-500) 9%, transparent);
  align-items: center;
  background: var(--status-surface);
  border: 1px solid var(--status-border);
  border-radius: .25rem;
  color: var(--status-ink);
  display: inline-flex;
  font-size: .82rem;
  font-weight: 760;
  gap: .42rem;
  line-height: 1;
  min-height: 1.85rem;
  padding: .32rem .58rem .32rem .38rem;
  white-space: nowrap;
}

.status-badge.compact {
  background: transparent;
  border: 0;
  font-size: 0;
  gap: 0;
  height: 1.35rem;
  justify-content: center;
  min-height: 1.35rem;
  padding: 0;
  width: 1.35rem;
}

.status-badge.compact .status-text {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.status-mark {
  background: var(--status-fill);
  border: 1px solid var(--status-border);
  border-radius: .12rem;
  display: inline-block;
  flex: 0 0 auto;
  height: .92rem;
  overflow: hidden;
  position: relative;
  width: .92rem;
}

.status-mark::before,
.status-mark::after {
  content: "";
  position: absolute;
}

.status-mark::before {
  background: rgba(255, 255, 255, .4);
  border-radius: .08rem;
  inset: .25rem;
}

.status-mark::after {
  display: none;
}

.status-badge.compact .status-mark {
  height: .98rem;
  width: .98rem;
}

.covered {
  --status-border: color-mix(in srgb, var(--color-signal-green) 52%, transparent);
  --status-fill: var(--color-signal-green);
  --status-ink: color-mix(in srgb, var(--color-signal-green) 48%, var(--color-ink-950));
  --status-surface: color-mix(in srgb, var(--color-signal-green) 14%, transparent);
}

.covered .status-mark {
  background: var(--color-signal-green);
  border-color: color-mix(in srgb, var(--color-signal-green) 78%, var(--color-ink-950));
}

.partial {
  --status-border: color-mix(in srgb, var(--color-signal-amber) 54%, transparent);
  --status-fill: var(--color-signal-amber);
  --status-ink: color-mix(in srgb, var(--color-signal-amber) 46%, var(--color-ink-950));
  --status-surface: color-mix(in srgb, var(--color-signal-amber) 15%, transparent);
}

.partial .status-mark {
  background: var(--color-signal-amber);
  border-color: color-mix(in srgb, var(--color-signal-amber) 78%, var(--color-ink-950));
}

.partial .status-mark::before {
  border-radius: 999px 0 0 999px;
  right: 50%;
}

.partial .status-mark::after {
  background: rgba(255, 255, 255, .7);
  border-radius: 2px;
  bottom: .24rem;
  display: block;
  height: auto;
  left: 50%;
  opacity: 1;
  top: .24rem;
  transform: translateX(-50%);
  width: .08rem;
}

.missing {
  --status-border: color-mix(in srgb, var(--color-ink-500) 42%, transparent);
  --status-fill: transparent;
  --status-ink: var(--color-ink-600);
  --status-surface: color-mix(in srgb, var(--color-ink-500) 8%, transparent);
}

.missing .status-mark {
  background: transparent;
  border-color: var(--status-border);
}

.missing .status-mark::before {
  background: var(--status-ink);
  border-radius: 99px;
  height: .12rem;
  inset: 50% .3rem auto;
  transform: translateY(-50%);
}

.missing .status-mark::after {
  display: none;
}

:global(html.dark .status-badge.covered) {
  --status-border: color-mix(in srgb, var(--color-signal-green) 68%, var(--color-ink-950));
  --status-fill: color-mix(in srgb, var(--color-signal-green) 84%, var(--color-ink-50));
  --status-ink: color-mix(in srgb, var(--color-signal-green) 48%, var(--color-ink-950));
  --status-surface: color-mix(in srgb, var(--color-signal-green) 18%, var(--color-ink-50));
}

:global(html.dark .status-badge.covered) .status-mark {
  background: var(--status-fill);
  border-color: var(--color-signal-green);
}

:global(html.dark .status-badge.partial) {
  --status-border: color-mix(in srgb, var(--color-signal-amber) 70%, var(--color-ink-950));
  --status-fill: color-mix(in srgb, var(--color-signal-amber) 82%, var(--color-ink-50));
  --status-ink: color-mix(in srgb, var(--color-signal-amber) 50%, var(--color-ink-950));
  --status-surface: color-mix(in srgb, var(--color-signal-amber) 20%, var(--color-ink-50));
}

:global(html.dark .status-badge.partial) .status-mark {
  background: var(--status-fill);
  border-color: var(--color-signal-amber);
}

:global(html.dark .status-badge.missing) {
  --status-border: color-mix(in srgb, var(--color-ink-500) 52%, transparent);
  --status-fill: transparent;
  --status-ink: var(--color-ink-600);
  --status-surface: color-mix(in srgb, var(--color-ink-500) 14%, transparent);
}
</style>
