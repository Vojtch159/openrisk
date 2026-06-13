<template>
  <div class="faq-page">
    <div class="app-shell py-8">
      <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-signal-blue">FAQ</p>
      <h1 class="text-3xl font-semibold tracking-normal text-ink-950 sm:text-5xl">
        Frequently asked questions
      </h1>

      <dl class="mt-10 space-y-10">
        <div>
          <dt class="text-xl font-semibold text-ink-950">What is a DeFi risk feed?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            A DeFi risk feed is any independent provider that publishes assessments, ratings, dashboards,
            or research about protocol security, governance, or financial risk. These include rating agencies
            (like DeFiScan or Xerberus), dashboards (like BlockAnalitica or Zyfai), monitoring services
            (like DeFi Saver), and research providers (like LlamaRisk).
          </dd>
        </div>

        <div>
          <dt class="text-xl font-semibold text-ink-950">What does "coverage" mean?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            Coverage means a feed provider has published protocol-specific intelligence for a given protocol.
            <strong>Covered</strong> means the feed provides comprehensive protocol-level data or ratings.
            <strong>Partial</strong> means the feed covers only part of the protocol, a specific version, a market, or a related vault set.
            <strong>Not yet covered</strong> means no protocol-specific provider entry has been found in the current registry.
          </dd>
        </div>

        <div>
          <dt class="text-xl font-semibold text-ink-950">Why does OpenRisk aggregate feeds rather than scoring them?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            Composite scoring is deliberately out of scope. The mental model is oracle diversity: no single feed
            should be canonical for something as important as protocol risk. We show what each feed publishes
            side by side, attributed and verbatim, and let users weigh them. The aggregation is the value.
            OpenRisk is bound by its
            <NuxtLink to="/about#project-charter" class="text-signal-blue hover:underline">project charter</NuxtLink>
            to never produce its own risk score, ranking, or composite assessment.
          </dd>
        </div>

        <div>
          <dt class="text-xl font-semibold text-ink-950">How are protocols selected?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            The registry covers the top 20 Ethereum DeFi protocols by TVL (Total Value Locked), or 24-hour volume
            where TVL does not apply (such as for swap aggregators like 1inch and CoW Swap). The seed list comes
            from the Ethereum Foundation's Neutral DeFi Risk Intelligence Aggregator RFP. We add no selection
            criterion of our own.
          </dd>
        </div>

        <div>
          <dt class="text-xl font-semibold text-ink-950">How are feeds selected?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            The registry includes 16 feeds chosen to maximize methodology diversity: formal rating desks, dashboards,
            security-monitoring tools, and research. Each feed's independence, methodology, and machine-readability
            are documented in the
            <NuxtLink to="/methodology" class="text-signal-blue hover:underline">methodology page</NuxtLink>.
            Feed automation is tracked per provider and will be automated wherever providers expose data publicly (M2 target).
          </dd>
        </div>

        <div>
          <dt class="text-xl font-semibold text-ink-950">How can I contribute or correct data?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            OpenRisk is community-correctable. You can correct a fact, add a protocol, or add a feed provider
            through our
            <NuxtLink to="/contribute" class="text-signal-blue hover:underline">contribution page</NuxtLink>.
            All contributions go through GitHub issues and PRs so every change is reviewable and attributable.
            Corrections are triaged within 5 business days.
          </dd>
        </div>

        <div>
          <dt class="text-xl font-semibold text-ink-950">Is OpenRisk open source?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            Yes. The codebase and data layer are AGPL-3.0 licensed. The grant repository is published at engagement
            start so the funded development history is public from day one.
          </dd>
        </div>

        <div>
          <dt class="text-xl font-semibold text-ink-950">Does OpenRisk have commercial relationships with listed protocols?</dt>
          <dd class="mt-3 text-base leading-7 text-ink-600">
            No. OpenRisk maintains neutral positioning with no undisclosed commercial relationships with listed protocols.
            All conflicts are declared in <code class="rounded bg-ink-100 px-1.5 py-0.5 text-sm text-ink-800">DISCLOSURES.md</code>.
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
