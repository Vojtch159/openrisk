import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const forbiddenKeyPattern = /^\s*(score|scores|rank|ranking|composite|compositeScore|normalizedScore|openRiskScore)\s*:/i;
const roots = ['data', 'shared', 'server', 'app'];
const allowedText = new Set(['shared/openrisk.ts', 'app/pages/methodology.vue', 'app/pages/contribute.vue']);

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      return [fullPath];
    }),
  );
  return files.flat();
}

for (const root of roots) {
  const files = await walk(root);
  for (const file of files) {
    if (!/\.(ts|vue|ya?ml)$/.test(file)) continue;
    const content = await readFile(file, 'utf8');
    const relative = file.replace(`${process.cwd()}/`, '');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (forbiddenKeyPattern.test(line)) {
        throw new Error(`Forbidden scoring-like key in ${relative}:${index + 1}`);
      }

      if (!allowedText.has(relative) && /openrisk(?:-created)?\s+(?:composite\s+)?score/i.test(line)) {
        throw new Error(`Forbidden scoring copy in ${relative}:${index + 1}`);
      }
    });
  }
}

console.log('No OpenRisk scoring fields found.');
