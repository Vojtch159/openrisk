<script setup lang="ts">
import { ExternalLink, GitPullRequestArrow } from '@lucide/vue';
import { GITHUB_REPOSITORY_URL } from '~/utils/links';

const { data } = useOpenRiskData();
</script>

<template>
  <div class="app-shell py-10">
    <SectionHeader title="How OpenRisk works" description="The project purpose, coverage model, provenance rules, and common questions in one concise reference." />

    <section id="about" class="info-section">
      <span>About</span><h2>Neutral aggregation, not another score</h2>
      <p>OpenRisk shows what independent risk providers publish about Ethereum DeFi protocols. Provider positions stay attributed and side by side; OpenRisk does not reconcile them into a proprietary score, ranking, or investment recommendation.</p>
      <div class="principles-grid"><article><strong>{{ data.stats.protocols }}</strong><small>Ethereum protocols</small></article><article><strong>{{ data.stats.feeds }}</strong><small>Independent sources</small></article><article><strong>{{ data.stats.positiveCells }}</strong><small>Sourced entries</small></article></div>
    </section>

    <section id="methodology" class="info-section">
      <span>Methodology</span><h2>Oracle diversity for risk intelligence</h2>
      <p class="methodology-intro">No single provider should be canonical for something as contextual as protocol risk. The registry prioritizes methodology diversity, explicit version scope, dated source links, and verified provider-authored language.</p>
      <div class="methodology-grid">
        <article><span>01</span><div><strong>Protocol selection</strong><p>Leading Ethereum applications selected by TVL or trading volume.</p></div></article>
        <article><span>02</span><div><strong>Source diversity</strong><p>Ratings, dashboards, monitoring, and research remain distinct.</p></div></article>
        <article><span>03</span><div><strong>Independence</strong><p>Commercial relationships and provider independence are disclosed.</p></div></article>
        <article><span>04</span><div><strong>Attribution</strong><p>Capital metrics come from DefiLlama; risk claims stay with their original provider.</p></div></article>
      </div>
    </section>

    <section id="coverage" class="info-section">
      <span>Coverage model</span><h2>What the three states mean</h2>
      <p class="coverage-context"><strong>Coverage measures availability, not safety.</strong> A covered protocol is not necessarily safer than a missing one.</p>
      <div class="definition-list"><article><b class="covered">Covered</b><p>Protocol-specific intelligence is available for the relevant protocol or version.</p></article><article><b class="partial">Partially covered</b><p>A provider covers only a version, market, vault, feature, or otherwise limited evidence set.</p></article><article><b class="missing">Missing</b><p>No protocol-specific provider entry has been found in the current static snapshot.</p></article></div>
    </section>

    <section id="faq" class="info-section">
      <span>FAQ</span><h2>Common questions</h2>
      <div class="faq-list"><details open><summary>Why not combine providers into one score?</summary><p>Methodologies measure different things and may conflict. Combining them would introduce an OpenRisk judgment that the project charter explicitly excludes.</p></details><details><summary>How should version rows be read?</summary><p>Version views include only evidence whose source scope explicitly names that version. Evidence without explicit version scope remains at the parent protocol level.</p></details><details><summary>Is the data live?</summary><p>No. This prototype is a dated, fully static snapshot. The snapshot date and raw JSON link appear in the footer.</p></details><details><summary>Can the registry be corrected?</summary><p>Yes. Corrections should include a provider URL, governance record, onchain reference, or another dated source.</p></details></div>
    </section>

    <section class="contribute-callout"><div><GitPullRequestArrow :size="20" /><div><strong>Review the data in public</strong><p>Open an issue, propose a correction, or inspect the repository-native dataset.</p></div></div><div class="callout-actions"><NuxtLink to="/contribute">Prepare a correction</NuxtLink><a :href="GITHUB_REPOSITORY_URL" target="_blank" rel="noreferrer">GitHub repository <ExternalLink :size="14" /></a></div></section>
  </div>
</template>

<style scoped>
.info-section { border-top: 1px solid var(--color-ink-200); padding: 3rem 0; }.info-section:first-of-type { margin-top: 2.5rem; }.info-section > span { color: var(--color-signal-blue); font-size: .67rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }.info-section h2 { color: var(--color-ink-950); font-size: clamp(1.7rem,4vw,2.5rem); letter-spacing: -.035em; margin: .45rem 0 .8rem; }.info-section > p { color: var(--color-ink-600); font-size: .92rem; line-height: 1.75; }
.principles-grid { display: grid; gap: .7rem; margin-top: 1.5rem; }.principles-grid article { background: var(--color-white); border: 1px solid var(--color-ink-200); border-radius: .65rem; padding: 1rem; }.principles-grid strong,.principles-grid small { display: block; }.principles-grid strong { color: var(--color-ink-950); font-size: 1.5rem; }.principles-grid small { color: var(--color-ink-500); font-size: .67rem; font-weight: 700; margin-top: .2rem; text-transform: uppercase; }
.methodology-intro { margin-bottom: 0; max-width: 50rem; }.methodology-grid { display: grid; gap: .65rem; margin-top: 1.4rem; }.methodology-grid article { align-items: start; background: var(--color-white); border: 1px solid var(--color-ink-200); border-radius: .65rem; display: grid; gap: .75rem; grid-template-columns: auto minmax(0,1fr); padding: 1rem; }.methodology-grid article > span { color: var(--color-signal-blue); font-size: .62rem; font-weight: 800; letter-spacing: .08em; padding-top: .15rem; }.methodology-grid strong { color: var(--color-ink-900); display: block; font-size: .82rem; }.methodology-grid p { color: var(--color-ink-600); font-size: .75rem; line-height: 1.55; margin: .3rem 0 0; }
.coverage-context { margin: 0; max-width: 48rem; }.coverage-context strong { color: var(--color-ink-800); font-weight: 750; }.definition-list,.faq-list { display: grid; gap: .6rem; margin-top: 1.25rem; }.definition-list article,.faq-list details { background: var(--color-white); border: 1px solid var(--color-ink-200); border-radius: .65rem; padding: 1rem; }.definition-list b { border-radius: 99px; display: inline-block; font-size: .68rem; padding: .35rem .55rem; text-transform: uppercase; }.definition-list b.covered { background: #dff6ea; color: #11613c; }.definition-list b.partial { background: #fff0d6; color: #7c4a09; }.definition-list b.missing { background: var(--color-ink-100); color: var(--color-ink-600); }.definition-list p,.faq-list p { color: var(--color-ink-600); font-size: .8rem; line-height: 1.6; margin: .65rem 0 0; }.faq-list summary { color: var(--color-ink-950); cursor: pointer; font-size: .86rem; font-weight: 750; }
.contribute-callout { align-items: center; background: #202937; border-radius: .8rem; color: var(--color-on-dark); display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; padding: 1.2rem; }.contribute-callout > div:first-child { align-items: start; display: flex; gap: .7rem; }.contribute-callout strong { display: block; }.contribute-callout p { color: #b4bdca; font-size: .75rem; margin: .25rem 0 0; }.callout-actions { display: flex; flex-wrap: wrap; gap: .5rem; }.callout-actions a { align-items: center; background: #e8ecf1; border-radius: .45rem; color: #20242b; display: inline-flex; font-size: .72rem; font-weight: 750; gap: .3rem; padding: .65rem .75rem; }
@media (min-width:640px) { .principles-grid { grid-template-columns: repeat(3,1fr); }.methodology-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>
