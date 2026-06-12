import { z } from 'zod';

export const coverageStatuses = ['covered', 'partial', 'not_covered'] as const;
export const feedTypes = ['rating', 'dashboard', 'monitoring', 'research'] as const;
export const provenanceTypes = ['provider_api', 'provider_page', 'governance_forum', 'onchain', 'defillama', 'manual_curated'] as const;
export const independenceTypes = ['independent', 'commercial', 'paid_mandate', 'curates_vaults'] as const;

export const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  provenance: z.enum(provenanceTypes),
  capturedAt: z.string().datetime(),
});

export const protocolSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  family: z.string().min(1).optional(),
  category: z.enum(['lending', 'dex', 'swap_aggregator', 'yield', 'liquid_staking']),
  summary: z.string().min(1),
  notes: z.string().min(1),
  versions: z.array(z.string().min(1)).min(1),
  ethereumScope: z.string().min(1),
  defillama: z.object({
    protocolSlug: z.string().min(1).optional(),
    chain: z.literal('Ethereum').default('Ethereum'),
    metric: z.enum(['tvl', 'volume']),
  }),
  links: z.object({
    website: z.string().url(),
    docs: z.string().url().optional(),
    governance: z.string().url().optional(),
    defillama: z.string().url(),
  }),
});

export const feedSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  type: z.enum(feedTypes),
  focus: z.string().min(1),
  methodology: z.string().min(1),
  automation: z.enum(['api', 'page_snapshot', 'manual_snapshot']),
  shortName: z.string().min(1).optional(),
  machineReadable: z.enum(['yes', 'partial', 'no']).default('no'),
  independence: z.enum(independenceTypes).optional(),
  independenceNote: z.string().min(1).optional(),
  links: z.object({
    homepage: z.string().url(),
    methodology: z.string().url().optional(),
    data: z.string().url().optional(),
  }),
});

export const coverageCellSchema = z.object({
  protocolId: z.string().regex(/^[a-z0-9-]+$/),
  feedId: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(coverageStatuses),
  summary: z.string(),
  providerText: z.string().min(1).optional(),
  providerTextVerified: z.boolean().optional(),
  providerLabel: z.string().optional(),
  scope: z.string().optional(),
  referenceStatus: z.enum(['verified', 'reference_sample']).optional(),
  referenceUrl: z.string().url().optional(),
  source: sourceSchema.optional(),
  notes: z.string().optional(),
}).superRefine((cell, ctx) => {
  if (cell.status !== 'not_covered' && !cell.source) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'covered and partial cells require a dated source',
      path: ['source'],
    });
  }
  if (cell.status !== 'not_covered' && cell.summary.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'covered and partial cells require a sourced coverage summary',
      path: ['summary'],
    });
  }
});

export const governanceFactSchema = z.object({
  protocolId: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
  value: z.string().min(1),
  source: sourceSchema,
});

export const auditSchema = z.object({
  protocolId: z.string().regex(/^[a-z0-9-]+$/),
  firm: z.string().min(1),
  subject: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceUrl: z.string().url(),
});

export const incidentSchema = z.object({
  protocolId: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(1),
  sourceUrl: z.string().url(),
});

export type Protocol = z.infer<typeof protocolSchema>;
export type Feed = z.infer<typeof feedSchema>;
export type CoverageCell = z.infer<typeof coverageCellSchema>;
export type GovernanceFact = z.infer<typeof governanceFactSchema>;
export type Audit = z.infer<typeof auditSchema>;
export type Incident = z.infer<typeof incidentSchema>;

export type ProtocolDetail = Protocol & {
  governance: GovernanceFact[];
  coverage: CoverageCell[];
  audits: Audit[];
  incidents: Incident[];
};

export type MatrixRow = Protocol & {
  coverage: Record<string, CoverageCell>;
  coverageCount: number;
  partialCount: number;
};

export type ProtocolMetric = {
  protocolId: string;
  metric: 'tvl' | 'volume';
  value: number | null;
  asOf: string | null;
  source: string;
  scopeNote?: string;
  unavailableReason?: string;
};

export const categoryLabels: Record<Protocol['category'], string> = {
  lending: 'Lending',
  dex: 'DEX / AMM',
  swap_aggregator: 'Swap aggregator',
  yield: 'Yield / vault',
  liquid_staking: 'Liquid staking',
};

export const statusLabels: Record<CoverageCell['status'], string> = {
  covered: 'Covered',
  partial: 'Partially covered',
  not_covered: 'Missing',
};

export const statusDescriptions: Record<CoverageCell['status'], string> = {
  covered: 'Provider has protocol-specific risk intelligence or rating data.',
  partial: 'Provider covers only part of the protocol, a version, a market, or a related vault set.',
  not_covered: 'No protocol-specific provider coverage has been found yet.',
};
