<script setup lang="ts">
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type SortingState,
} from "@tanstack/vue-table";
import {
  ArrowUpDown,
  Database,
  ExternalLink,
  Filter,
  Info,
  Search,
  X,
} from "@lucide/vue";
import {
  categoryLabels,
  statusDescriptions,
  statusLabels,
  type CoverageCell,
  type Feed,
  type MatrixRow,
} from "#openrisk";

const query = ref("");
const category = ref("all");
const status = ref<"all" | CoverageCell["status"]>("all");
const feedId = ref("all");
const sorting = ref<SortingState>([]);
const selected = ref<{ row: MatrixRow; feed: Feed } | null>(null);
const legendStatuses: CoverageCell["status"][] = [
  "covered",
  "partial",
  "not_covered",
];

const { data, isLoading, feeds, rows } = useMatrix();
const categories = computed(() =>
  Array.from(new Set(rows.value.map((row) => row.category))),
);
const focusedFeed = computed(() =>
  feeds.value.find((feed) => feed.id === feedId.value),
);
const positiveCells = computed(() =>
  rows.value.reduce(
    (total, row) =>
      total +
      Object.values(row.coverage).filter(
        (cell) => cell.status !== "not_covered",
      ).length,
    0,
  ),
);

const filteredRows = computed(() => {
  const needle = query.value.trim().toLowerCase();
  return rows.value.filter((row) => {
    const textMatch =
      !needle ||
      [row.name, row.family, row.summary, row.notes, ...row.versions]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    const categoryMatch =
      category.value === "all" || row.category === category.value;
    const cells =
      feedId.value === "all"
        ? Object.values(row.coverage)
        : [row.coverage[feedId.value]].filter((cell): cell is CoverageCell =>
            Boolean(cell),
          );
    const statusMatch =
      status.value === "all" ||
      cells.some((cell) => cell.status === status.value);
    return textMatch && categoryMatch && statusMatch;
  });
});

const columnHelper = createColumnHelper<MatrixRow>();
const columns = [
  columnHelper.accessor("name", { id: "name", header: "Protocol" }),
  columnHelper.accessor("category", { id: "category", header: "Category" }),
  columnHelper.accessor("coverageCount", {
    id: "coverageCount",
    header: "Covered",
  }),
  columnHelper.accessor((row) => data.value.metrics[row.id]?.value ?? -1, {
    id: "metricValue",
    header: "Metric",
  }),
];

const table = useVueTable({
  get data() {
    return filteredRows.value;
  },
  columns,
  state: {
    get sorting() {
      return sorting.value;
    },
  },
  onSortingChange: (updater) => {
    sorting.value =
      typeof updater === "function" ? updater(sorting.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

function cellFor(row: MatrixRow, feed: Feed): CoverageCell {
  return (
    row.coverage[feed.id] ?? {
      protocolId: row.id,
      feedId: feed.id,
      status: "not_covered",
      summary: "",
    }
  );
}

function resetFilters() {
  query.value = "";
  category.value = "all";
  status.value = "all";
  feedId.value = "all";
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") selected.value = null;
}

onMounted(() => window.addEventListener("keydown", onKeyDown));
onUnmounted(() => window.removeEventListener("keydown", onKeyDown));
</script>

<template>
  <div class="matrix-page mx-auto py-8">
    <div class="matrix-hero">
      <div>
        <p class="eyebrow">Protocol-by-feed research matrix</p>
        <h1>One evidence surface. No hidden cells.</h1>
        <p class="matrix-intro">
          Compare all 20 RFP protocols across 16 independent feeds. Version
          differences remain visible inside each cell, and every provider claim
          stays linked to its source.
        </p>
      </div>
      <dl class="matrix-stats">
        <div>
          <dt>Protocols</dt>
          <dd>{{ rows.length }}</dd>
        </div>
        <div>
          <dt>Feeds</dt>
          <dd>{{ feeds.length }}</dd>
        </div>
        <div>
          <dt>Reporting cells</dt>
          <dd>{{ positiveCells }}</dd>
        </div>
      </dl>
    </div>

    <section class="matrix-toolbar" aria-label="Matrix filters">
      <label class="matrix-search">
        <Search :size="17" aria-hidden="true" />
        <span class="sr-only">Search protocols</span>
        <input v-model="query" placeholder="Search protocol or version" >
      </label>
      <label>
        <span>Category</span>
        <select v-model="category">
          <option value="all">All categories</option>
          <option v-for="item in categories" :key="item" :value="item">
            {{ categoryLabels[item] }}
          </option>
        </select>
      </label>
      <label>
        <span>Focus feed</span>
        <select v-model="feedId">
          <option value="all">All {{ data.stats.feeds }} feeds</option>
          <option v-for="feed in feeds" :key="feed.id" :value="feed.id">
            {{ feed.name }}
          </option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select v-model="status">
          <option value="all">Any status</option>
          <option value="covered">Covered</option>
          <option value="partial">Partial</option>
          <option value="not_covered">Not yet covered</option>
        </select>
      </label>
      <button class="reset-button" type="button" @click="resetFilters">
        <X :size="15" aria-hidden="true" /> Reset
      </button>
    </section>

    <div class="matrix-meta">
      <div class="status-legend" aria-label="Coverage legend">
        <span v-for="item in legendStatuses" :key="item">
          <i :class="`status-dot ${item}`" /> {{ statusLabels[item] }}
        </span>
      </div>
      <p>
        <Filter :size="14" aria-hidden="true" />
        {{ table.getRowModel().rows.length }} protocols shown
        <span class="hidden lg:inline">· scroll the table to compare all {{ feeds.length }} feeds</span>
      </p>
    </div>

    <div v-if="isLoading" class="matrix-loading">
      Loading the evidence matrix...
    </div>

    <template v-else>
      <div data-testid="matrix-scroll" class="matrix-scroll">
        <table
          class="matrix-table"
          :style="{ width: `${580 + feeds.length * 154}px` }"
        >
          <colgroup>
            <col class="w-[260px]" >
            <col class="w-[130px]" >
            <col class="w-[96px]" >
            <col class="w-[94px]" >
            <col v-for="feed in feeds" :key="feed.id" class="w-[154px]" >
          </colgroup>
          <thead>
            <tr
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
            >
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                :class="header.id === 'name' && 'sticky-name'"
              >
                <button
                  v-if="header.column.getCanSort()"
                  @click="header.column.toggleSorting()"
                >
                  {{ header.column.columnDef.header }}
                  <ArrowUpDown :size="13" aria-hidden="true" />
                </button>
              </th>
              <th v-for="feed in feeds" :key="feed.id" class="feed-heading">
                <NuxtLink :to="`/feeds/${feed.id}`">{{
                  feed.shortName ?? feed.name
                }}</NuxtLink>
                <span>{{ feed.type }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in table.getRowModel().rows" :key="row.id">
              <td class="sticky-name protocol-cell">
                <NuxtLink :to="`/protocols/${row.original.id}`">
                  <div class="flex items-center gap-2">
                    <img
                      :src="`/icons/protocols/${row.original.id}.png`"
                      :alt="row.original.name"
                      class="h-6 w-6 rounded-md border border-ink-100 bg-white object-contain"
                      loading="eager"
                      width="24"
                      height="24"
                    >
                    <div>
                      <strong>{{ row.original.name }}</strong>
                      <span>{{ row.original.versions.join(" · ") }}</span>
                    </div>
                  </div>
                </NuxtLink>
              </td>
              <td class="category-cell">
                {{ categoryLabels[row.original.category] }}
              </td>
              <td class="count-cell">
                <strong>{{ row.original.coverageCount }}</strong
                ><span>+{{ row.original.partialCount }} partial</span>
              </td>
              <td>
                <MetricCell
                  :protocol-id="row.original.id"
                  :metric="row.original.defillama.metric"
                />
              </td>
              <td v-for="feed in feeds" :key="feed.id" class="evidence-cell">
                <button
                  :class="`cell-button ${cellFor(row.original, feed).status}`"
                  :aria-label="`${row.original.name}, ${feed.name}: ${statusLabels[cellFor(row.original, feed).status]}`"
                  @click="selected = { row: row.original, feed }"
                >
                  <span class="cell-status"
                    ><i
                      :class="`status-dot ${cellFor(row.original, feed).status}`"
                    />{{
                      statusLabels[cellFor(row.original, feed).status]
                    }}</span
                  >
                  <span>{{
                    cellFor(row.original, feed).providerLabel ??
                    "No provider entry"
                  }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-if="!isLoading" class="mobile-matrix">
      <article
        v-for="row in table.getRowModel().rows"
        :key="row.id"
        class="mobile-matrix-card"
      >
        <header>
          <div>
            <NuxtLink :to="`/protocols/${row.original.id}`">{{
              row.original.name
            }}</NuxtLink>
            <span
              >{{ categoryLabels[row.original.category] }} ·
              {{ row.original.versions.join(" / ") }}</span
            >
          </div>
          <MetricCell
            :protocol-id="row.original.id"
            :metric="row.original.defillama.metric"
          />
        </header>
        <button
          v-if="focusedFeed"
          class="mobile-focused-cell"
          @click="selected = { row: row.original, feed: focusedFeed }"
        >
          <span
            ><strong>{{ focusedFeed.name }}</strong
            ><small>{{ focusedFeed.methodology }}</small></span
          >
          <StatusBadge :status="cellFor(row.original, focusedFeed).status" />
        </button>
        <div v-else class="mobile-cell-grid" aria-label="Feed coverage cells">
          <button
            v-for="feed in feeds"
            :key="feed.id"
            :title="`${feed.name}: ${statusLabels[cellFor(row.original, feed).status]}`"
            @click="selected = { row: row.original, feed }"
          >
            <i :class="`status-dot ${cellFor(row.original, feed).status}`" />
            <span>{{ feed.shortName ?? feed.name }}</span>
          </button>
        </div>
        <footer>
          {{ row.original.coverageCount }} covered ·
          {{ row.original.partialCount }} partial ·
          {{
            feeds.length -
            row.original.coverageCount -
            row.original.partialCount
          }}
          not yet covered
        </footer>
      </article>
      <div v-if="table.getRowModel().rows.length === 0" class="empty-state">
        <Database :size="24" aria-hidden="true" />
        <strong>No protocols match these filters.</strong>
        <button type="button" @click="resetFilters">Reset filters</button>
      </div>
    </div>

    <Transition name="fade"
      ><div
        v-if="selected"
        class="drawer-backdrop"
        aria-hidden="true"
        @click="selected = null"
    /></Transition>
    <Transition name="slide">
      <aside
        v-if="selected"
        class="evidence-drawer"
        aria-label="Coverage evidence"
      >
        <header>
          <div>
            <span>{{ selected.feed.name }}</span>
            <h2>{{ selected.row.name }}</h2>
          </div>
          <button
            type="button"
            aria-label="Close evidence panel"
            @click="selected = null"
          >
            <X :size="18" />
          </button>
        </header>
        <div class="drawer-body">
          <div class="drawer-status-line">
            <StatusBadge
              :status="cellFor(selected.row, selected.feed).status"
            />
            <span
              :class="
                cellFor(selected.row, selected.feed).referenceStatus ===
                'verified'
                  ? 'verified-tag'
                  : 'sample-tag'
              "
            >
              {{
                cellFor(selected.row, selected.feed).referenceStatus ===
                "verified"
                  ? "Reference verified"
                  : "Reference sample"
              }}
            </span>
          </div>
          <p>
            {{
              statusDescriptions[cellFor(selected.row, selected.feed).status]
            }}
          </p>

          <section>
            <h3><Info :size="15" /> Coverage scope</h3>
            <p>
              {{
                cellFor(selected.row, selected.feed).scope ??
                "No version-specific provider coverage is recorded."
              }}
            </p>
          </section>
          <section>
            <h3>Provider methodology</h3>
            <p>{{ selected.feed.methodology }}</p>
            <dl class="feed-context">
              <div>
                <dt>Type</dt>
                <dd>{{ selected.feed.type }}</dd>
              </div>
              <div>
                <dt>Machine-readable</dt>
                <dd>{{ selected.feed.machineReadable }}</dd>
              </div>
              <div v-if="selected.feed.independence">
                <dt>Independence</dt>
                <dd>{{ selected.feed.independence.replaceAll("_", " ") }}</dd>
              </div>
            </dl>
          </section>
          <section>
            <h3>Curated coverage note</h3>
            <p>
              {{
                cellFor(selected.row, selected.feed).summary ||
                "No provider-specific note is present."
              }}
            </p>
          </section>
          <section
            v-if="cellFor(selected.row, selected.feed).providerText"
            class="provider-finding"
          >
            <h3>Verbatim provider rating</h3>
            <blockquote>
              {{ cellFor(selected.row, selected.feed).providerText }}
            </blockquote>
          </section>
          <section
            v-else-if="cellFor(selected.row, selected.feed).providerLabel"
          >
            <h3>Reference label</h3>
            <p>{{ cellFor(selected.row, selected.feed).providerLabel }}</p>
            <small
              >Not presented as verbatim provider text unless independently
              marked verified.</small
            >
          </section>
          <div class="drawer-links">
            <ProvenanceTag
              v-if="cellFor(selected.row, selected.feed).source"
              :label="cellFor(selected.row, selected.feed).source!.label"
              :provenance="
                cellFor(selected.row, selected.feed).source!.provenance
              "
              :url="cellFor(selected.row, selected.feed).source!.url"
            />
            <a
              v-if="cellFor(selected.row, selected.feed).referenceUrl"
              :href="cellFor(selected.row, selected.feed).referenceUrl"
              target="_blank"
              rel="noreferrer"
            >
              Reference record <ExternalLink :size="13" />
            </a>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.matrix-page {
  box-sizing: border-box;
  inline-size: min(100%, 96rem);
  min-inline-size: 0;
  padding-inline: 1rem;
}
.matrix-hero {
  display: grid;
  gap: 2rem;
  padding: 1.5rem 0 2rem;
}
.eyebrow {
  color: #1d6fd8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin: 0 0 0.65rem;
  text-transform: uppercase;
}
.matrix-hero h1 {
  color: #121418;
  font-size: clamp(2rem, 5vw, 3.75rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1;
  margin: 0;
}
.matrix-intro {
  color: #4a5361;
  font-size: 1rem;
  line-height: 1.7;
  margin: 1rem 0 0;
  max-width: 50rem;
}
.matrix-stats {
  align-self: end;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  overflow: hidden;
  border: 1px solid #d8dee7;
  border-radius: 0.9rem;
  background: white;
}
.matrix-stats div {
  padding: 1rem;
  border-right: 1px solid #edf1f6;
}
.matrix-stats div:last-child {
  border: 0;
}
.matrix-stats dt {
  color: #697383;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.matrix-stats dd {
  color: #121418;
  font-size: 1.55rem;
  font-weight: 700;
  margin: 0.2rem 0 0;
}
.matrix-toolbar {
  align-items: end;
  background: #fff;
  border: 1px solid #d8dee7;
  border-radius: 0.85rem;
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem;
}
.matrix-toolbar label {
  color: #697383;
  display: grid;
  font-size: 0.68rem;
  font-weight: 800;
  gap: 0.35rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.matrix-toolbar input,
.matrix-toolbar select {
  background: #f7f9fc;
  border: 1px solid transparent;
  border-radius: 0.55rem;
  color: #181c22;
  height: 2.65rem;
  outline: none;
  padding: 0 0.75rem;
  text-transform: none;
  width: 100%;
}
.matrix-toolbar input:focus,
.matrix-toolbar select:focus {
  border-color: #1d6fd8;
  box-shadow: 0 0 0 3px #dbeafe;
}
.matrix-search {
  align-items: center;
  display: grid !important;
  grid-template-columns: auto 1fr;
  padding-top: 1.15rem;
  position: relative;
}
.matrix-search svg {
  margin-left: 0.7rem;
}
.matrix-search input {
  grid-column: 1 / -1;
  padding-left: 2.35rem;
  position: absolute;
  bottom: 0;
}
.reset-button {
  align-items: center;
  border: 1px solid #d8dee7;
  border-radius: 0.55rem;
  color: #4a5361;
  display: flex;
  font-size: 0.8rem;
  font-weight: 700;
  gap: 0.35rem;
  height: 2.65rem;
  justify-content: center;
  padding: 0.5rem 1rem;
}
.matrix-meta {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  padding: 1rem 0.1rem 0.75rem;
}
.matrix-meta p {
  align-items: center;
  color: #697383;
  display: flex;
  font-size: 0.75rem;
  gap: 0.35rem;
  margin: 0;
}
.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
}
.status-legend span {
  align-items: center;
  color: #4a5361;
  display: flex;
  font-size: 0.75rem;
  font-weight: 650;
  gap: 0.35rem;
}
.status-dot {
  background: #c7ced8;
  border-radius: 50%;
  display: inline-block;
  height: 0.52rem;
  width: 0.52rem;
}
.status-dot.covered {
  background: #1f9d63;
}
.status-dot.partial {
  background: #d78a1e;
}
.status-dot.not_covered {
  background: #aab2bf;
}
[data-testid="matrix-scroll"] {
  display: none;
}
:deep(div:has(> .matrix-table)) {
  display: none;
}
.matrix-scroll {
  background: white;
  border: 1px solid #d8dee7;
  border-radius: 0.9rem;
  inline-size: 100%;
  max-height: calc(100vh - 12rem);
  max-inline-size: 100%;
  overflow: auto;
}
.matrix-table {
  border-collapse: separate;
  border-spacing: 0;
  display: none;
  table-layout: fixed;
}
.matrix-table th {
  background: #f7f9fc;
  border-bottom: 1px solid #d8dee7;
  color: #697383;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 0.7rem 0.65rem;
  position: sticky;
  text-align: left;
  text-transform: uppercase;
  top: 0;
  z-index: 5;
}
.matrix-table th button {
  align-items: center;
  display: flex;
  gap: 0.3rem;
}
.matrix-table td {
  border-bottom: 1px solid #edf1f6;
  padding: 0.55rem;
  vertical-align: top;
}
.matrix-table tbody tr:hover td {
  background-color: #fbfcfe;
}
.matrix-table .sticky-name {
  left: 0;
  position: sticky;
  z-index: 8;
}
.matrix-table th.sticky-name {
  z-index: 12;
}
.protocol-cell {
  background: white;
}
.protocol-cell a {
  display: grid;
  gap: 0.25rem;
  padding: 0.2rem;
}
.protocol-cell strong {
  color: #181c22;
  font-size: 0.88rem;
}
.protocol-cell span {
  color: #697383;
  font-size: 0.67rem;
}
.category-cell {
  color: #4a5361;
  font-size: 0.72rem;
  font-weight: 650;
}
.count-cell strong,
.count-cell span {
  display: block;
}
.count-cell strong {
  font-size: 1rem;
}
.count-cell span {
  color: #697383;
  font-size: 0.65rem;
  margin-top: 0.15rem;
}
.feed-heading a {
  color: #303844;
  display: block;
  font-size: 0.67rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.feed-heading span {
  color: #8a94a3;
  display: block;
  font-size: 0.55rem;
  margin-top: 0.15rem;
}
.cell-button {
  border: 1px solid #e3e8ef;
  border-radius: 0.48rem;
  display: grid;
  gap: 0.35rem;
  min-height: 3.7rem;
  padding: 0.48rem;
  text-align: left;
  width: 100%;
}
.cell-button:hover {
  border-color: #99a6b8;
  transform: translateY(-1px);
}
.cell-button > span:last-child {
  color: #697383;
  display: -webkit-box;
  font-size: 0.62rem;
  line-height: 1.25;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.cell-status {
  align-items: center;
  color: #303844;
  display: flex;
  font-size: 0.62rem;
  font-weight: 750;
  gap: 0.3rem;
}
.cell-button.covered {
  background: #f1faf5;
}
.cell-button.partial {
  background: #fff9ee;
}
.cell-button.not_covered {
  background: #f8f9fb;
  opacity: 0.78;
}
.mobile-matrix {
  display: grid;
  gap: 0.8rem;
}
.mobile-matrix-card {
  background: white;
  border: 1px solid #d8dee7;
  border-radius: 0.85rem;
  overflow: hidden;
}
.mobile-matrix-card header {
  align-items: start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 1rem;
}
.mobile-matrix-card header a {
  color: #181c22;
  display: block;
  font-size: 1rem;
  font-weight: 750;
}
.mobile-matrix-card header span {
  color: #697383;
  display: block;
  font-size: 0.68rem;
  margin-top: 0.2rem;
}
.mobile-matrix-card footer {
  background: #f7f9fc;
  color: #697383;
  font-size: 0.68rem;
  padding: 0.65rem 1rem;
}
.mobile-cell-grid {
  border-top: 1px solid #edf1f6;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: #edf1f6;
}
.mobile-cell-grid button {
  align-items: center;
  background: white;
  display: flex;
  gap: 0.35rem;
  min-height: 2.5rem;
  min-width: 0;
  padding: 0.45rem;
}
.mobile-cell-grid span {
  color: #4a5361;
  font-size: 0.57rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mobile-focused-cell {
  align-items: center;
  border-top: 1px solid #edf1f6;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding: 0.9rem 1rem;
  text-align: left;
  width: 100%;
}
.mobile-focused-cell > span {
  min-width: 0;
}
.mobile-focused-cell strong,
.mobile-focused-cell small {
  display: block;
}
.mobile-focused-cell small {
  color: #697383;
  font-size: 0.68rem;
  line-height: 1.35;
  margin-top: 0.2rem;
}
.empty-state {
  align-items: center;
  border: 1px dashed #b4bdca;
  border-radius: 0.8rem;
  color: #697383;
  display: grid;
  gap: 0.5rem;
  justify-items: center;
  padding: 2rem;
  text-align: center;
}
.empty-state button {
  color: #1d6fd8;
  font-size: 0.8rem;
  font-weight: 700;
}
.matrix-loading {
  background: white;
  border: 1px solid #d8dee7;
  border-radius: 0.8rem;
  color: #697383;
  padding: 3rem;
  text-align: center;
}
.drawer-backdrop {
  background: rgba(18, 20, 24, 0.35);
  inset: 0;
  position: fixed;
  z-index: 50;
  backdrop-filter: blur(3px);
}
.evidence-drawer {
  background: #f7f9fc;
  bottom: 0;
  box-shadow: -18px 0 50px rgba(18, 20, 24, 0.16);
  display: flex;
  flex-direction: column;
  max-width: 32rem;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 60;
}
.evidence-drawer > header {
  align-items: start;
  background: white;
  border-bottom: 1px solid #d8dee7;
  display: flex;
  justify-content: space-between;
  padding: 1.15rem;
}
.evidence-drawer header span {
  color: #697383;
  font-size: 0.72rem;
  font-weight: 750;
}
.evidence-drawer h2 {
  color: #121418;
  font-size: 1.45rem;
  margin: 0.2rem 0 0;
}
.evidence-drawer header button {
  border: 1px solid #d8dee7;
  border-radius: 0.5rem;
  padding: 0.45rem;
}
.drawer-body {
  display: grid;
  gap: 0.8rem;
  overflow: auto;
  padding: 1rem;
}
.drawer-body > p {
  color: #4a5361;
  font-size: 0.8rem;
  line-height: 1.55;
  margin: 0;
}
.drawer-body section {
  background: white;
  border: 1px solid #e0e5ec;
  border-radius: 0.7rem;
  padding: 0.9rem;
}
.drawer-body h3 {
  align-items: center;
  color: #303844;
  display: flex;
  font-size: 0.72rem;
  font-weight: 800;
  gap: 0.4rem;
  letter-spacing: 0.05em;
  margin: 0 0 0.45rem;
  text-transform: uppercase;
}
.drawer-body section p,
.drawer-body blockquote {
  color: #4a5361;
  font-size: 0.8rem;
  line-height: 1.55;
  margin: 0;
}
.drawer-body small {
  color: #697383;
  display: block;
  font-size: 0.67rem;
  margin-top: 0.45rem;
}
.drawer-status-line {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.verified-tag,
.sample-tag {
  border-radius: 99px;
  font-size: 0.65rem;
  font-weight: 750;
  padding: 0.35rem 0.55rem;
}
.verified-tag {
  background: #e7f7ef;
  color: #136340;
}
.sample-tag {
  background: #fff3dc;
  color: #824f0e;
}
.feed-context {
  display: grid;
  gap: 0.35rem;
  grid-template-columns: repeat(3, 1fr);
  margin: 0.8rem 0 0;
}
.feed-context div {
  background: #f7f9fc;
  border-radius: 0.4rem;
  padding: 0.5rem;
}
.feed-context dt {
  color: #8a94a3;
  font-size: 0.56rem;
  font-weight: 800;
  text-transform: uppercase;
}
.feed-context dd {
  color: #303844;
  font-size: 0.68rem;
  font-weight: 700;
  margin: 0.15rem 0 0;
}
.provider-finding {
  border-left: 3px solid #1d6fd8 !important;
}
.provider-finding blockquote {
  color: #181c22;
  font-size: 0.9rem;
  font-weight: 650;
}
.drawer-links {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.drawer-links > a {
  align-items: center;
  color: #1d6fd8;
  display: flex;
  font-size: 0.7rem;
  font-weight: 700;
  gap: 0.3rem;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.24s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (min-width: 768px) {
  .matrix-page {
    padding-inline: 1.5rem;
  }
  .matrix-hero {
    grid-template-columns: minmax(0, 1fr) 25rem;
  }
  .matrix-toolbar {
    grid-template-columns: minmax(15rem, 1fr) 11rem 13rem 12rem auto;
  }
}
@media (min-width: 1024px) {
  [data-testid="matrix-scroll"],
  :deep(div:has(> .matrix-table)) {
    display: block;
  }
  .matrix-table {
    display: table;
  }
  .mobile-matrix {
    display: none;
  }
}
@media (hover: none) and (pointer: coarse) {
  :deep(div:has(> .matrix-table)),
  .matrix-scroll,
  .matrix-table {
    display: none !important;
  }
  .mobile-matrix {
    display: grid !important;
  }
}
</style>
