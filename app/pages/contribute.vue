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
          <button type="submit" class="copy-template-button"><Copy :size="16" aria-hidden="true" />{{ copied ? 'Copied to clipboard' : 'Copy issue template' }}</button>
          <a :href="GITHUB_ISSUES_URL" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 rounded-md border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-900"><GitFork :size="16" /> Open GitHub issue <ExternalLink :size="13" /></a>
          <a :href="GITHUB_REPOSITORY_URL" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 px-2 py-2.5 text-sm font-semibold text-signal-blue">View repository <ExternalLink :size="13" /></a>
        </div>
        <p class="text-xs text-ink-500" aria-live="polite">
          {{ copied ? 'The source-backed correction template is ready to paste into the public repository.' : 'Nothing is submitted from this static prototype.' }}
        </p>
      </form>

      <aside class="validation-panel">
        <GitPullRequestArrow :size="22" aria-hidden="true" />
        <h2 class="mt-4 text-lg font-semibold">Validation rules</h2>
        <ul class="mt-4 space-y-3 text-sm leading-6">
          <li>Covered and partial cells require a dated source.</li>
          <li>Provider-authored text must remain clearly attributed and unedited.</li>
          <li>New protocols must include Ethereum scope and DefiLlama mapping.</li>
          <li>Composite scores, normalized grades, and OpenRisk rankings are rejected by CI.</li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.copy-template-button {
  align-items: center;
  background: var(--accent-mark);
  border: 1px solid var(--emphasis-border);
  border-radius: .375rem;
  color: var(--accent-mark-ink);
  display: inline-flex;
  font-size: .875rem;
  font-weight: 650;
  gap: .5rem;
  padding: .625rem 1rem;
}

.copy-template-button:hover {
  background: color-mix(in srgb, var(--accent-mark) 78%, var(--color-white));
  border-color: var(--rule-strong);
}

.validation-panel {
  background: var(--surface-emphasis);
  border: 1px solid var(--emphasis-border);
  border-radius: .5rem;
  box-shadow: var(--shadow-line);
  color: var(--emphasis-ink);
  padding: 1.25rem;
}

.validation-panel > svg {
  color: var(--accent-mark-ink);
}

.validation-panel ul {
  color: var(--emphasis-muted);
}
</style>
