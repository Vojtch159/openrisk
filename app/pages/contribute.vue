<script setup lang="ts">
import { Copy, ExternalLink, GitFork, GitPullRequestArrow } from '@lucide/vue';
import { GITHUB_ISSUES_URL, GITHUB_REPOSITORY_URL } from '~/utils/links';

const protocol = ref('');
const feed = ref('');
const source = ref('');
const correction = ref('');
const copied = ref(false);

const template = computed(() => `### Correction target
- Protocol: ${protocol.value || '[protocol id or name]'}
- Feed: ${feed.value || '[feed id or name]'}

### Source
${source.value || '[provider URL, governance URL, or onchain reference]'}

### Requested change
${correction.value || '[describe the coverage status, curator note, provider-authored text, or provenance field to change]'}

### OpenRisk constraints
- Do not add an OpenRisk score.
- Preserve provider wording where a provider rating is involved.
- Include a dated source for covered or partial cells.
`);

async function copyTemplate() {
  await navigator.clipboard.writeText(template.value);
  copied.value = true;
  window.setTimeout(() => {
    copied.value = false;
  }, 2500);
}
</script>

<template>
  <div class="app-shell py-8">
    <SectionHeader
      eyebrow="Corrections"
      title="Make the registry better without changing the model."
      description="Use this form to prepare a GitHub issue or pull request. Corrections must preserve neutral aggregation and include a source."
    />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <form class="space-y-4 rounded-lg border border-ink-200 bg-white p-5 shadow-sm" @submit.prevent="copyTemplate">
        <label class="block">
          <span class="text-sm font-semibold text-ink-800">Protocol</span>
          <input v-model="protocol" class="mt-1 h-11 w-full rounded-md border border-ink-300 px-3 outline-none focus:border-signal-blue focus:ring-4 focus:ring-blue-100" placeholder="aave">
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-ink-800">Feed</span>
          <input v-model="feed" class="mt-1 h-11 w-full rounded-md border border-ink-300 px-3 outline-none focus:border-signal-blue focus:ring-4 focus:ring-blue-100" placeholder="blockanalitica">
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-ink-800">Source URL</span>
          <input v-model="source" type="url" class="mt-1 h-11 w-full rounded-md border border-ink-300 px-3 outline-none focus:border-signal-blue focus:ring-4 focus:ring-blue-100" placeholder="https://...">
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-ink-800">Requested change</span>
          <textarea v-model="correction" class="mt-1 min-h-36 w-full rounded-md border border-ink-300 p-3 outline-none focus:border-signal-blue focus:ring-4 focus:ring-blue-100" placeholder="Describe the exact status, curator note, provider-authored text, or provenance update." />
        </label>
        <div class="flex flex-wrap gap-2">
          <button type="submit" class="inline-flex items-center gap-2 rounded-md bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"><Copy :size="16" aria-hidden="true" />{{ copied ? 'Copied to clipboard' : 'Copy issue template' }}</button>
          <a :href="GITHUB_ISSUES_URL" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 rounded-md border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900"><GitFork :size="16" /> Open GitHub issue <ExternalLink :size="13" /></a>
          <a :href="GITHUB_REPOSITORY_URL" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 px-2 py-2.5 text-sm font-semibold text-signal-blue">View repository <ExternalLink :size="13" /></a>
        </div>
        <p class="text-xs text-ink-500" aria-live="polite">
          {{ copied ? 'The source-backed correction template is ready to paste into the public repository.' : 'Nothing is submitted from this static prototype.' }}
        </p>
      </form>

      <aside class="rounded-lg border border-ink-200 bg-ink-950 p-5 text-white shadow-sm">
        <GitPullRequestArrow :size="22" aria-hidden="true" />
        <h2 class="mt-4 text-lg font-semibold">Validation rules</h2>
        <ul class="mt-4 space-y-3 text-sm leading-6 text-ink-200">
          <li>Covered and partial cells require a dated source.</li>
          <li>Provider-authored text must remain clearly attributed and unedited.</li>
          <li>New protocols must include Ethereum scope and DefiLlama mapping.</li>
          <li>Composite scores, normalized grades, and OpenRisk rankings are rejected by CI.</li>
        </ul>
      </aside>
    </div>
  </div>
</template>
