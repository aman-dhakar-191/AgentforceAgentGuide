/**
 * Validates verification.json before the site build.
 *
 * Docusaurus imports this file through webpack, so a syntax error surfaces as
 * "Module parse failed ... at position 498", which says nothing about which
 * entry is wrong. This fails early with a message you can act on.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'verification.json');
const DOCS = path.join(ROOT, 'docs');

const raw = fs.readFileSync(FILE, 'utf8');

let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  const pos = Number((err.message.match(/position (\d+)/) ?? [])[1]);
  let where = '';
  if (!Number.isNaN(pos)) {
    const line = raw.slice(0, pos).split('\n').length;
    where = `\n  at line ${line}: ${raw.split('\n')[line - 1]?.trim()}`;
    where += '\n  (a missing comma between entries is the usual cause)';
  }
  console.error(`\nverification.json is not valid JSON.\n  ${err.message}${where}\n`);
  process.exit(1);
}

const problems = [];

for (const [id, entry] of Object.entries(data)) {
  if (id.startsWith('_')) continue;

  if (!fs.existsSync(path.join(DOCS, `${id}.md`))) {
    problems.push(`"${id}" has no matching docs/${id}.md`);
  }
  if (entry.exempt) continue;

  if (typeof entry.verified !== 'boolean') {
    problems.push(`"${id}" needs "verified": true or false`);
  }
  if (entry.verified && !entry.date) {
    problems.push(`"${id}" is verified but has no "date" - readers cannot tell how stale it is`);
  }
}

if (problems.length) {
  console.error('\nverification.json problems:');
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`[verification] ${Object.keys(data).length - 1} entries OK`);
