<script setup lang="ts">
import { ExternalLink, GitPullRequestArrow } from '@lucide/vue';
import { GITHUB_REPOSITORY_URL } from '~/utils/links';

const { data } = useOpenRiskData();
</script>

<template>
  <div class="info-page">
    <section class="info-hero">
      <div class="app-shell info-hero-grid">
        <div class="info-hero-copy">
          <p class="page-eyebrow info-eyebrow">About OpenRisk</p>
          <h1 class="page-title">Risk evidence belongs in daylight.</h1>
          <p>
            OpenRisk collects what independent DeFi risk providers publish, keeps their words attached to their names,
            and shows the disagreements instead of smoothing them into a proprietary verdict.
          </p>
        </div>

        <aside class="evidence-ledger" aria-label="OpenRisk evidence model">
          <div class="ledger-topline">
            <span>Current snapshot</span>
          </div>
          <dl class="ledger-stats">
            <div>
              <dt>Protocols</dt>
              <dd>{{ data.stats.protocols }}</dd>
            </div>
            <div>
              <dt>Sources</dt>
              <dd>{{ data.stats.feeds }}</dd>
            </div>
            <div>
              <dt>Sourced entries</dt>
              <dd>{{ data.stats.positiveCells }}</dd>
            </div>
          </dl>
          <p>Each cell says whether source material exists. It does not say whether a protocol is safe.</p>
        </aside>
      </div>
    </section>

    <main class="app-shell info-main">
      <section id="about" class="info-panel intro-panel">
        <div class="section-label">Purpose</div>
        <div>
          <h2>A neutral layer over a fragmented risk landscape.</h2>
          <p>
            DeFi risk work is scattered across rating desks, monitoring dashboards, research notes, governance forums,
            and provider docs. OpenRisk gives that work a common table without pretending the methods are the same.
          </p>
          <p>
            The project is useful precisely because it refuses to collapse different methodologies into one number.
            Users can inspect who said what, when, and about which protocol or version.
          </p>
        </div>
      </section>

      <section id="methodology" class="info-panel">
        <div class="section-label">Operating rules</div>
        <div>
          <h2>The constraints are part of the product.</h2>
          <div class="rule-stack">
            <article>
              <strong>Keep providers distinct</strong>
              <p>Ratings, dashboards, monitoring outputs, and research stay attributed to the source that published them.</p>
            </article>
            <article>
              <strong>Preserve scope</strong>
              <p>Version-specific evidence is shown only when the source explicitly names that version, market, vault, or feature.</p>
            </article>
            <article>
              <strong>Reject derived verdicts</strong>
              <p>OpenRisk does not add rankings, normalized grades, composite scores, or investment recommendations.</p>
            </article>
            <article>
              <strong>Require provenance</strong>
              <p>Covered and partial cells need a dated provider URL, governance record, onchain reference, or other source.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="coverage" class="coverage-panel">
        <div class="coverage-copy">
          <div class="section-label">Coverage language</div>
          <h2>Coverage means evidence was found. Nothing more.</h2>
          <p>
            A covered protocol is not automatically safer than a missing one. The labels describe the availability and
            scope of source material in the static snapshot.
          </p>
        </div>
        <div class="coverage-definitions">
          <article>
            <b class="covered">Covered</b>
            <p>Protocol-specific intelligence is available for the relevant protocol or version.</p>
          </article>
          <article>
            <b class="partial">Partial</b>
            <p>The provider covers a limited version, market, vault, feature, or evidence set.</p>
          </article>
          <article>
            <b class="missing">Missing</b>
            <p>No protocol-specific provider entry has been found in the current snapshot.</p>
          </article>
        </div>
      </section>

      <section id="faq" class="info-panel faq-panel">
        <div class="section-label">FAQ</div>
        <div>
          <h2>Short answers before you use the table.</h2>
          <div class="faq-list">
            <details open>
              <summary>Why not combine providers into one score?</summary>
              <p>Because the methods measure different things. Combining them would make OpenRisk the judge, which is outside the charter.</p>
            </details>
            <details>
              <summary>How should version rows be read?</summary>
              <p>They include only evidence whose source scope explicitly names that version. Everything else stays at the parent protocol level.</p>
            </details>
            <details>
              <summary>Is the data live?</summary>
              <p>No. This prototype is a dated, static snapshot. The snapshot date and raw JSON link appear in the footer.</p>
            </details>
            <details>
              <summary>Can the registry be corrected?</summary>
              <p>Yes. Corrections should point to a dated provider URL, governance record, onchain reference, or primary source.</p>
            </details>
          </div>
        </div>
      </section>

      <section class="contribute-callout">
        <div>
          <GitPullRequestArrow :size="20" aria-hidden="true" />
          <div>
            <strong>Review the data in public</strong>
            <p>Open an issue, propose a correction, or inspect the repository-native dataset.</p>
          </div>
        </div>
        <div class="callout-actions">
          <NuxtLink to="/contribute">Prepare a correction</NuxtLink>
          <a :href="GITHUB_REPOSITORY_URL" target="_blank" rel="noreferrer">
            GitHub repository <ExternalLink :size="14" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.info-page {
  color: var(--color-ink-900);
}

.info-hero {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-signal-blue) 10%, transparent), transparent 42%),
    color-mix(in srgb, var(--color-white) 88%, transparent);
  border-bottom: 1px solid var(--color-ink-200);
}

.info-hero-grid {
  display: grid;
  gap: 2rem;
  padding-block: clamp(2rem, 6vw, 4.8rem);
}

.info-hero-copy {
  align-self: end;
  max-width: 50rem;
}

.info-eyebrow {
  color: var(--color-signal-blue);
  font-family: var(--font-mono);
  font-weight: 800;
  letter-spacing: .16em;
  margin: 0 0 .9rem;
  text-transform: uppercase;
}

.info-hero h1 {
  text-wrap: balance;
}

.info-hero-copy > p:not(.info-eyebrow) {
  color: var(--color-ink-700);
  font-size: clamp(1rem, 1.5vw, 1.18rem);
  line-height: 1.75;
  margin: 1.35rem 0 0;
  max-width: 43rem;
}

.evidence-ledger {
  align-self: end;
  background: var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-radius: .55rem;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.ledger-topline {
  align-items: center;
  border-bottom: 1px solid var(--color-ink-200);
  display: flex;
  gap: .75rem;
  justify-content: space-between;
  padding-bottom: .85rem;
}

.ledger-topline span,
.ledger-stats dt {
  color: var(--color-ink-500);
  font-family: var(--font-mono);
  font-size: .75rem;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.ledger-stats {
  display: grid;
  gap: .6rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
}

.ledger-stats div {
  border-left: 1px solid var(--color-ink-200);
  min-width: 0;
  padding-left: .7rem;
}

.ledger-stats div:first-child {
  border-left: 0;
  padding-left: 0;
}

.ledger-stats dd {
  color: var(--color-ink-950);
  font-size: clamp(1.45rem, 4vw, 2rem);
  font-weight: 760;
  line-height: 1;
  margin: .32rem 0 0;
}

.evidence-ledger > p {
  color: var(--color-ink-600);
  font-size: .88rem;
  line-height: 1.6;
  margin: 0;
}

.info-main {
  display: grid;
  gap: clamp(1.2rem, 3vw, 2rem);
  padding-block: clamp(1.5rem, 5vw, 3rem);
}

.info-panel,
.coverage-panel {
  background: color-mix(in srgb, var(--color-white) 82%, transparent);
  border: 1px solid var(--color-ink-200);
  border-radius: .7rem;
  box-shadow: var(--shadow-line);
  display: grid;
  gap: 1.4rem;
  padding: clamp(1.1rem, 3vw, 2rem);
}

.section-label {
  color: var(--color-signal-blue);
  font-family: var(--font-mono);
  font-size: .78rem;
  font-weight: 850;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.info-panel h2,
.coverage-panel h2 {
  color: var(--color-ink-950);
  font-family: var(--font-serif);
  font-size: clamp(1.9rem, 4.8vw, 3.2rem);
  font-weight: 520;
  letter-spacing: -.045em;
  line-height: 1;
  margin: 0;
  max-width: 46rem;
}

.info-panel p,
.coverage-panel p {
  color: var(--color-ink-600);
  font-size: .95rem;
  line-height: 1.75;
  margin: .9rem 0 0;
  max-width: 48rem;
}

.intro-panel {
  background:
    linear-gradient(90deg, var(--color-ink-950) .35rem, transparent .35rem),
    color-mix(in srgb, var(--color-white) 84%, transparent);
}

.rule-stack {
  display: grid;
  gap: .7rem;
  margin-top: 1.3rem;
}

.rule-stack article {
  align-items: start;
  background: var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-radius: .5rem;
  display: grid;
  gap: .35rem;
  padding: 1rem;
}

.rule-stack strong {
  color: var(--color-ink-950);
  font-size: .92rem;
}

.rule-stack p {
  font-size: .9rem;
  line-height: 1.6;
  margin: 0;
}

.coverage-panel {
  background: var(--surface-emphasis);
  border-color: var(--emphasis-border);
  color: var(--emphasis-ink);
}

.coverage-copy {
  min-width: 0;
}

.coverage-panel .section-label {
  color: var(--color-signal-blue);
}

.coverage-panel h2 {
  color: var(--emphasis-ink);
}

.coverage-panel p {
  color: var(--emphasis-muted);
}

.coverage-definitions {
  display: grid;
  gap: .7rem;
}

.coverage-definitions article {
  background: var(--surface-emphasis-raised);
  border: 1px solid var(--emphasis-border);
  border-radius: .55rem;
  padding: 1rem;
}

.coverage-definitions b {
  border-radius: 99px;
  display: inline-flex;
  font-family: var(--font-mono);
  font-size: .78rem;
  font-weight: 850;
  letter-spacing: .08em;
  padding: .36rem .56rem;
  text-transform: uppercase;
}

.coverage-definitions b.covered {
  background: color-mix(in srgb, var(--color-signal-green) 24%, transparent);
  color: var(--color-signal-green);
}

.coverage-definitions b.partial {
  background: color-mix(in srgb, var(--color-signal-amber) 26%, transparent);
  color: var(--color-signal-amber);
}

.coverage-definitions b.missing {
  background: color-mix(in srgb, var(--emphasis-muted) 14%, transparent);
  color: var(--emphasis-muted);
}

.coverage-definitions p {
  color: var(--emphasis-muted);
  font-size: .9rem;
  line-height: 1.6;
  margin-top: .7rem;
}

.faq-list {
  display: grid;
  gap: .65rem;
  margin-top: 1.2rem;
}

.faq-list details {
  background: var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-radius: .5rem;
  padding: .95rem 1rem;
}

.faq-list summary {
  color: var(--color-ink-950);
  cursor: pointer;
  font-size: .9rem;
  font-weight: 760;
}

.faq-list p {
  font-size: .9rem;
  line-height: 1.65;
  margin: .65rem 0 0;
}

.contribute-callout {
  align-items: center;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--color-signal-blue) 18%, transparent), transparent),
    var(--color-white);
  border: 1px solid var(--color-ink-200);
  border-radius: .7rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  padding: 1.15rem;
}

.contribute-callout > div:first-child {
  align-items: start;
  display: flex;
  gap: .7rem;
}

.contribute-callout svg {
  color: var(--color-signal-blue);
  flex: 0 0 auto;
}

.contribute-callout strong {
  color: var(--color-ink-950);
  display: block;
}

.contribute-callout p {
  color: var(--color-ink-600);
  font-size: .9rem;
  line-height: 1.55;
  margin: .2rem 0 0;
}

.callout-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}

.callout-actions a {
  align-items: center;
  background: var(--accent-mark);
  border-radius: .45rem;
  color: var(--accent-mark-ink);
  display: inline-flex;
  font-size: .86rem;
  font-weight: 780;
  gap: .3rem;
  padding: .68rem .82rem;
  text-decoration: none;
}

.callout-actions a:last-child {
  background: transparent;
  border: 1px solid var(--color-ink-300);
  color: var(--color-ink-900);
}

@media (min-width: 720px) {
  .info-panel {
    grid-template-columns: 11rem minmax(0, 1fr);
  }

  .rule-stack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .coverage-definitions {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .info-hero-grid {
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 28rem);
  }

  .evidence-ledger {
    margin-top: 1rem;
  }

  .coverage-copy {
    align-items: end;
    display: grid;
    gap: .75rem 2rem;
    grid-template-columns: minmax(0, 1.25fr) minmax(20rem, .75fr);
  }

  .coverage-copy .section-label {
    grid-column: 1 / -1;
  }

  .coverage-copy p {
    margin: 0;
  }
}
</style>
