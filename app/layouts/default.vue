<script setup lang="ts">
import { BookOpen, Database, GitPullRequestArrow, Moon, Search, Sun } from '@lucide/vue';
import { GITHUB_REPOSITORY_URL } from '~/utils/links';

const isDark = ref(false);

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('openrisk-theme', isDark.value ? 'dark' : 'light');
}

const { data } = useOpenRiskData();
const snapshotDate = computed(() => new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(data.value.generatedAt)));
</script>

<template>
  <div class="flex min-h-screen flex-col bg-ink-50/80 text-ink-900">
    <header class="sticky top-0 z-40 border-b border-ink-200/80 bg-white/90 backdrop-blur">
      <div class="app-shell flex items-center justify-between py-3">
        <NuxtLink to="/" class="wordmark" aria-label="OpenRisk home">
          <span class="wordmark-sigil">OR</span>
          <span>
            <span class="wordmark-name">OpenRisk</span>
            <span class="wordmark-subtitle">attributed DeFi evidence</span>
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <NuxtLink class="nav-link" to="/">
            <Search :size="16" aria-hidden="true" />
            Search
          </NuxtLink>
          <NuxtLink class="nav-link" to="/feeds">
            <Database :size="16" aria-hidden="true" />
            Sources
          </NuxtLink>
          <NuxtLink class="nav-link" to="/info">
            <BookOpen :size="16" aria-hidden="true" />
            About
          </NuxtLink>
          <NuxtLink class="nav-link" to="/contribute">
            <GitPullRequestArrow :size="16" aria-hidden="true" />
            Corrections
          </NuxtLink>
          <button type="button" class="theme-toggle" :aria-label="isDark ? 'Use light theme' : 'Use dark theme'" @click="toggleTheme">
            <Sun v-if="isDark" :size="17" aria-hidden="true" /><Moon v-else :size="17" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-ink-200/80 bg-white/80">
      <div class="app-shell grid gap-6 py-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <div class="text-sm font-semibold text-ink-950">OpenRisk</div>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-ink-600">
            Ethereum-mainnet risk intelligence, aggregated without a proprietary score.<br>Proposed long-term steward: PWN DAO Foundation.
          </p>
          <p class="mt-2 text-xs text-ink-500">Static data snapshot generated {{ snapshotDate }}.</p>
        </div>
        <nav class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-semibold text-ink-600" aria-label="Project links">
          <NuxtLink to="/info" class="hover:text-ink-950">About OpenRisk</NuxtLink>
          <NuxtLink to="/contribute" class="hover:text-ink-950">Corrections</NuxtLink>
          <a :href="GITHUB_REPOSITORY_URL" target="_blank" rel="noreferrer" class="hover:text-ink-950">GitHub repository</a>
          <a href="/data/openrisk.json" class="hover:text-ink-950">Data snapshot</a>
          <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noreferrer" class="hover:text-ink-950">AGPL-3.0</a>
        </nav>
      </div>
    </footer>

    <nav class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-ink-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden" aria-label="Mobile navigation">
      <NuxtLink class="mobile-nav-link" to="/">
        <Search :size="18" aria-hidden="true" />
        <span>Search</span>
      </NuxtLink>
      <NuxtLink class="mobile-nav-link" to="/feeds">
        <Database :size="18" aria-hidden="true" />
        <span>Sources</span>
      </NuxtLink>
      <NuxtLink class="mobile-nav-link" to="/info">
        <BookOpen :size="18" aria-hidden="true" />
        <span>About</span>
      </NuxtLink>
      <NuxtLink class="mobile-nav-link" to="/contribute">
        <GitPullRequestArrow :size="18" aria-hidden="true" />
        <span>Correct</span>
      </NuxtLink>
      <button type="button" class="mobile-nav-link" :aria-label="isDark ? 'Use light theme' : 'Use dark theme'" @click="toggleTheme">
        <Sun v-if="isDark" :size="18" aria-hidden="true" /><Moon v-else :size="18" aria-hidden="true" />
        <span>Theme</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.wordmark {
  align-items: center;
  color: inherit;
  display: inline-flex;
  gap: .7rem;
  text-decoration: none;
}

.wordmark-sigil {
  align-items: center;
  background:
    linear-gradient(90deg, transparent 47%, color-mix(in srgb, var(--accent-mark-ink) 42%, transparent) 47% 53%, transparent 53%),
    var(--accent-mark);
  border-radius: .3rem;
  color: var(--accent-mark-ink);
  display: inline-flex;
  font-family: var(--font-mono);
  font-size: .82rem;
  font-weight: 800;
  height: 2.1rem;
  justify-content: center;
  letter-spacing: -.02em;
  width: 2.1rem;
}

.wordmark-name,
.wordmark-subtitle {
  display: block;
  line-height: 1.05;
}

.wordmark-name {
  color: var(--color-ink-950);
  font-size: 1rem;
  font-weight: 760;
  letter-spacing: -.025em;
}

.wordmark-subtitle {
  color: var(--color-ink-500);
  font-family: var(--font-mono);
  font-size: .75rem;
  margin-top: .2rem;
}

.nav-link {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 5px;
  color: var(--color-ink-600);
  display: inline-flex;
  font-size: .9rem;
  font-weight: 600;
  gap: 7px;
  padding: 8px 10px;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: var(--color-white);
  border-color: var(--color-ink-200);
  color: var(--color-ink-950);
}

.theme-toggle { align-items: center; background: var(--color-white); border: 1px solid var(--color-ink-200); border-radius: 5px; color: var(--color-ink-700); display: inline-flex; height: 36px; justify-content: center; margin-left: .25rem; width: 36px; }
.theme-toggle:hover { background: var(--color-ink-100); color: var(--color-ink-950); }

.mobile-nav-link {
  align-items: center;
  border-radius: 5px;
  color: var(--color-ink-500);
  display: flex;
  flex-direction: column;
  font-size: .76rem;
  font-weight: 700;
  gap: 4px;
  justify-content: center;
  min-height: 48px;
}

.mobile-nav-link.router-link-active {
  background: var(--color-ink-100);
  color: var(--color-ink-950);
}

</style>
