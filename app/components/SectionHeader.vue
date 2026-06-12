<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="mb-5">
    <p v-if="eyebrow" class="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-signal-blue">{{ eyebrow }}</p>
    <h1 class="text-2xl font-semibold tracking-normal text-ink-950 sm:text-3xl">{{ title }}</h1>
    <p v-if="description" class="mt-2 max-w-3xl text-sm leading-6 text-ink-600">{{ description }}</p>
  </div>
</template>
