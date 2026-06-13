<script setup lang="ts">
import { Building2, ExternalLink, Shield } from '@lucide/vue';
</script>

<template>
  <div class="about-page">
    <div class="app-shell py-8">
      <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-blue">About OpenRisk</p>
      <h1 class="max-w-4xl text-3xl font-semibold tracking-normal text-ink-950 sm:text-5xl">
        A neutral DeFi risk intelligence aggregator
      </h1>

      <div class="mt-8 space-y-8 text-base leading-7 text-ink-600">
        <section id="project-charter">
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">What OpenRisk is</h2>
          <p>
            OpenRisk aggregates what 16 independent risk feeds say about the top 20 Ethereum DeFi protocols —
            side by side, verbatim, with no composite scoring. It is a public good: open source, community-correctable,
            and deliberately neutral.
          </p>
          <p class="mt-3">
            DeFi risk intelligence is fragmented. Before deploying capital, users must navigate dozens of dashboards,
            rating services, and data providers. The information exists — but there is no neutral layer that puts it all
            in one place. OpenRisk is that layer.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">The oracle-diversity principle</h2>
          <p>
            No single feed should be canonical for something as important as protocol risk. We treat risk feeds the way
            Ethereum treats price oracles: diversity is the point. We put what each one publishes side by side,
            attributed and verbatim, and let users weigh them. The aggregation is the value.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">What we do not do</h2>
          <ul class="space-y-2">
            <li class="flex items-start gap-2">
              <Shield class="mt-0.5 flex-shrink-0 text-ink-400" :size="18" />
              <span>Produce a composite or proprietary risk score of our own.</span>
            </li>
            <li class="flex items-start gap-2">
              <Shield class="mt-0.5 flex-shrink-0 text-ink-400" :size="18" />
              <span>Combine feeds into a single derived signal.</span>
            </li>
            <li class="flex items-start gap-2">
              <Shield class="mt-0.5 flex-shrink-0 text-ink-400" :size="18" />
              <span>Adjudicate when feeds disagree — we show the disagreement.</span>
            </li>
            <li class="flex items-start gap-2">
              <Shield class="mt-0.5 flex-shrink-0 text-ink-400" :size="18" />
              <span>Rank protocols by any risk judgment.</span>
            </li>
          </ul>
          <p class="mt-3">
            This constraint is binding and documented in <code class="rounded bg-ink-100 px-1.5 py-0.5 text-sm text-ink-800">PROJECT_CHARTER.md</code>.
            Any future scoring proposal requires written agreement from the Ethereum Foundation.
          </p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">Data provenance</h2>
          <p>
            Every datum in OpenRisk carries a provenance tag that tells you where it came from and how it was verified:
          </p>
          <dl class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-ink-500">on-chain</dt>
              <dd class="mt-1 text-sm text-ink-700">Read directly from chain state or on-chain governance contracts.</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-ink-500">verified</dt>
              <dd class="mt-1 text-sm text-ink-700">Confirmed against a primary source (docs, audited address, governance record).</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-ink-500">governance forum</dt>
              <dd class="mt-1 text-sm text-ink-700">Sourced from a public governance forum or DAO discussion platform.</dd>
            </div>
            <div class="rounded-lg border border-ink-200 bg-white p-4">
              <dt class="text-xs font-bold uppercase text-ink-500">provider page</dt>
              <dd class="mt-1 text-sm text-ink-700">Sourced from the provider's public documentation or website.</dd>
            </div>
          </dl>
        </section>

        <section id="stewardship">
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">Stewardship</h2>
          <div class="rounded-lg border border-ink-200 bg-white p-5">
            <div class="flex items-center gap-3">
              <Building2 :size="20" class="text-signal-blue" />
              <div>
                <strong class="text-ink-950">PWN DAO Foundation</strong>
                <p class="text-sm text-ink-500">Proposed long-term steward</p>
              </div>
            </div>
            <p class="mt-4 text-sm leading-6 text-ink-600">
              Final written confirmation of the operational stewardship arrangement remains an M2 acceptance item before final grant payment.
            </p>
            <a href="https://github.com/PWNDAO" target="_blank" rel="noreferrer" class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-signal-blue">
              PWN DAO public profile <ExternalLink :size="13" />
            </a>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-semibold text-ink-950 mb-4">Built as a public good</h2>
          <p>
            OpenRisk is prepared under the AGPL-3.0 license and designed to be community-correctable.
            The public grant repository is opened at engagement start so development history begins in the open,
            as required by the RFP.
          </p>
          <div class="mt-4 flex gap-3">
            <NuxtLink
              to="/methodology"
              class="inline-flex items-center gap-2 rounded-md bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800"
            >
              Read methodology
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
