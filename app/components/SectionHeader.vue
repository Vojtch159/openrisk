<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="mb-5">
    <p v-if="eyebrow" class="page-eyebrow mb-2 font-mono font-bold text-signal-blue">{{ eyebrow }}</p>
    <h1 class="font-serif text-3xl font-medium leading-none tracking-[-0.035em] text-ink-950 sm:text-4xl">{{ title }}</h1>
    <p v-if="description" class="mt-2 max-w-3xl text-sm leading-6 text-ink-600">{{ description }}</p>
  </div>
</template>
