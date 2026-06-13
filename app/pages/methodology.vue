<script setup lang="ts">
const { data, feeds } = useFeeds();

const machineReadableCount = computed(() =>
  feeds.value.filter((feed) => feed.machineReadable === 'yes').length
);

</script>

<template>
  <div class="methodology-page">
    <div class="app-shell py-8">
      <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-blue">Methodology</p>
      <h1 class="max-w-4xl text-3xl font-semibold tracking-normal text-ink-950 sm:text-5xl">
        How the registry is built
      </h1>
      <p class="mt-4 max-w-2xl text-base leading-7 text-ink-600">
        How protocols and feeds are chosen, how we stay neutral, and how every datum here carries a provenance tag.
      </p>

      <div class="mt-8 space-y-12 text-base leading-7 text-ink-600">
        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">The oracle-diversity principle</h2>
          <p>
            No single feed should be canonical for something as important as protocol risk.
            We treat risk feeds the way Ethereum treats price oracles: diversity is the point.
            We put what each one publishes side by side, attributed and verbatim, and let you weigh them.
            The aggregation is the value.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">What we do</h2>
          <ul class="space-y-2 ml-5 list-disc">
            <li>Show each feed's coverage status per protocol — covered, partial, or not yet covered.</li>
            <li>Show what each feed publishes, verbatim and attributed, with a link to source.</li>
            <li>Surface governance facts with a provenance tag on every datum.</li>
            <li>Sort and filter by neutral facts: TVL, category, feed-coverage count.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">What we do not do</h2>
          <ul class="space-y-2 ml-5 list-disc">
            <li>Produce a composite or proprietary risk score of our own.</li>
            <li>Combine feeds into a single derived signal.</li>
            <li>Adjudicate when feeds disagree — we show the disagreement.</li>
            <li>Rank protocols by any risk judgment.</li>
          </ul>
          <p class="mt-3">
            This constraint is binding and documented in the repository's project charter.
            Changing it requires written agreement from the Ethereum Foundation.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">How we select protocols</h2>
          <p>
            The registry covers the top 20 Ethereum DeFi protocols by TVL (or 24-hour volume where TVL does not
            apply for swap aggregators). The seed list comes from the Ethereum Foundation's RFP — we adopt it verbatim.
            We add no selection criterion of our own.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">How we select feeds</h2>
          <p>
            The registry includes 16 feeds chosen to maximize methodology diversity: formal rating desks,
            dashboards, security-monitoring tools, and research. We track whether each exposes machine-readable
            output ({{ machineReadableCount }} of 16 today): the basis for feed automation — automate where possible,
            curate by hand where not.
          </p>
          <p class="mt-3">
            Each feed's focus, type, independence, and coverage is documented throughout the protocol and feed profiles.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">By the numbers</h2>
          <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-lg border border-ink-200 bg-white p-3 text-center">
              <dt class="text-xs font-bold uppercase text-ink-500">Protocols</dt>
              <dd class="mt-1 text-2xl font-semibold text-ink-950">{{ data.stats.protocols }}</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-3 text-center">
              <dt class="text-xs font-bold uppercase text-ink-500">Feeds</dt>
              <dd class="mt-1 text-2xl font-semibold text-ink-950">{{ data.stats.feeds }}</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-3 text-center">
              <dt class="text-xs font-bold uppercase text-ink-500">Covered</dt>
              <dd class="mt-1 text-2xl font-semibold text-green-600">{{ data.stats.covered }}</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-3 text-center">
              <dt class="text-xs font-bold uppercase text-ink-500">Partial</dt>
              <dd class="mt-1 text-2xl font-semibold text-amber-600">{{ data.stats.partial }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">Data provenance tags</h2>
          <p class="mb-4">Every datum carries a provenance tag that tells you where it came from and how it was verified.</p>
          <dl class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-green-700">on-chain</dt>
              <dd class="mt-1 text-sm text-ink-700">Read directly from chain state or on-chain governance contracts.</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-blue-700">verified</dt>
              <dd class="mt-1 text-sm text-ink-700">Confirmed against a primary source (docs, audited address, governance record).</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-purple-700">governance forum</dt>
              <dd class="mt-1 text-sm text-ink-700">Sourced from a public governance forum or DAO discussion platform.</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-amber-700">provider page</dt>
              <dd class="mt-1 text-sm text-ink-700">Sourced from the provider's public documentation or website.</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">Corrections</h2>
          <p>
            Every datum is community-correctable. To fix a coverage status, a stale rating, or a governance detail,
            <NuxtLink to="/contribute" class="text-signal-blue hover:underline">open an issue or PR</NuxtLink>
            on GitHub citing the source. Corrections are triaged within 5 business days.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
