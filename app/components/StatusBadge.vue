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
  --status-border: rgba(105,115,131,.28);
  --status-glow: rgba(105,115,131,.22);
  --status-ink: #66717f;
  --status-fill: #8d98a6;
  --status-core: #8d98a6;
  --status-shadow: rgba(20,28,38,.08);
  --status-surface: rgba(105,115,131,.08);
  align-items: center;
  background: var(--status-surface);
  border: 1px solid var(--status-border);
  border-radius: 999px;
  box-shadow: 0 1px 2px rgba(20,28,38,.03);
  color: var(--status-ink);
  display: inline-flex;
  font-size: .72rem;
  font-weight: 760;
  gap: .42rem;
  line-height: 1;
  min-height: 1.65rem;
  padding: .26rem .5rem .26rem .32rem;
  transition: background .16s ease, border-color .16s ease, box-shadow .16s ease, transform .16s ease;
  white-space: nowrap;
}

.status-badge:hover {
  box-shadow: 0 5px 16px var(--status-shadow);
  transform: translateY(-1px);
}

.status-badge.compact {
  background: transparent;
  border: 0;
  box-shadow: none;
  font-size: 0;
  gap: 0;
  height: 1.35rem;
  justify-content: center;
  min-height: 1.35rem;
  padding: 0;
  width: 1.35rem;
}

.status-badge.compact:hover {
  background: transparent;
  box-shadow: none;
  transform: none;
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
  background: color-mix(in srgb, var(--status-fill) 18%, transparent);
  border: 1px solid var(--status-border);
  border-radius: 999px;
  box-shadow: 0 0 0 3px var(--status-surface);
  display: inline-block;
  flex: 0 0 auto;
  height: .92rem;
  overflow: hidden;
  position: relative;
  transition: box-shadow .16s ease, transform .16s ease;
  width: .92rem;
}

.status-mark::before,
.status-mark::after {
  content: "";
  position: absolute;
}

.status-mark::before {
  background: var(--status-core);
  border-radius: inherit;
  box-shadow: 0 0 .65rem var(--status-glow);
  inset: .25rem;
}

.status-mark::after {
  border: 1px solid var(--status-glow);
  border-radius: inherit;
  inset: -.22rem;
  opacity: 0;
  transform: scale(.72);
}

.status-badge.compact .status-mark {
  height: .98rem;
  width: .98rem;
}

.status-badge.compact:hover .status-mark {
  transform: scale(1.08);
}

.covered {
  --status-border: rgba(31,157,99,.34);
  --status-fill: #1b7f55;
  --status-core: #29d186;
  --status-glow: rgba(32,183,116,.32);
  --status-ink: #146444;
  --status-shadow: rgba(23,128,84,.14);
  --status-surface: rgba(27,127,85,.08);
}

.covered .status-mark {
  background: #1b7f55;
  border-color: #279f6b;
}

.status-badge.compact.covered .status-mark::after {
  animation: status-ring 2.6s cubic-bezier(.2,.7,.3,1) infinite;
}

.partial {
  --status-border: rgba(196,122,22,.36);
  --status-fill: #9a620f;
  --status-core: #e09a2b;
  --status-glow: rgba(196,122,22,.26);
  --status-ink: #7a4a08;
  --status-shadow: rgba(196,122,22,.14);
  --status-surface: rgba(196,122,22,.08);
}

.partial .status-mark {
  background: #9a620f;
  border-color: #bc7a1e;
}

.partial .status-mark::before {
  border-radius: 999px 0 0 999px;
  right: 50%;
}

.partial .status-mark::after {
  background: #f0bd62;
  border: 0;
  border-radius: 99px;
  bottom: .24rem;
  box-shadow: 0 0 .45rem var(--status-glow);
  height: auto;
  left: 50%;
  opacity: .72;
  top: .24rem;
  transform: translateX(-50%);
  width: .08rem;
}

.status-badge.compact.partial .status-mark::after {
  animation: status-scan 2.2s ease-in-out infinite;
}

.missing {
  --status-border: rgba(105,115,131,.34);
  --status-fill: #697383;
  --status-core: #697383;
  --status-glow: rgba(105,115,131,.16);
  --status-ink: #66717f;
  --status-shadow: rgba(20,28,38,.06);
  --status-surface: rgba(105,115,131,.06);
}

.missing .status-mark {
  background: transparent;
  border-color: var(--status-border);
}

.missing .status-mark::before {
  border-radius: 99px;
  height: .12rem;
  inset: 50% .3rem auto;
  transform: translateY(-50%);
}

.missing .status-mark::after {
  display: none;
}

:global(html.dark) .status-badge {
  box-shadow: 0 1px 2px rgba(0,0,0,.18);
}

:global(html.dark) .status-badge.compact {
  box-shadow: none;
}

:global(html.dark) .covered {
  --status-border: rgba(54,194,125,.36);
  --status-fill: #23875a;
  --status-core: #43df93;
  --status-glow: rgba(54,194,125,.34);
  --status-ink: #a4e6c1;
  --status-shadow: rgba(54,194,125,.12);
  --status-surface: rgba(54,194,125,.12);
}

:global(html.dark) .covered .status-mark {
  background: #23875a;
  border-color: #36c27d;
}

:global(html.dark) .partial {
  --status-border: rgba(227,155,40,.38);
  --status-fill: #a86a15;
  --status-core: #f0b24d;
  --status-glow: rgba(227,155,40,.32);
  --status-ink: #f3d08b;
  --status-shadow: rgba(227,155,40,.12);
  --status-surface: rgba(227,155,40,.12);
}

:global(html.dark) .partial .status-mark {
  background: #a86a15;
  border-color: #e39b28;
}

:global(html.dark) .missing {
  --status-border: rgba(121,134,150,.4);
  --status-fill: #798696;
  --status-core: #798696;
  --status-glow: rgba(121,134,150,.18);
  --status-ink: #aab4c2;
  --status-shadow: rgba(0,0,0,.18);
  --status-surface: rgba(121,134,150,.12);
}

@keyframes status-ring {
  0% {
    opacity: .5;
    transform: scale(.58);
  }
  72%,
  100% {
    opacity: 0;
    transform: scale(1.45);
  }
}

@keyframes status-scan {
  0%,
  100% {
    opacity: .34;
    transform: translateX(-.2rem);
  }
  50% {
    opacity: .82;
    transform: translateX(.2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-badge,
  .status-mark,
  .status-mark::after {
    animation: none !important;
    transition: none !important;
  }
}
</style>
