/**
 * Emits machine-readable copies of the guide into the build output:
 *
 *   /llms.txt        index of pages, per the llms.txt convention
 *   /llms-full.txt   the entire guide as one plain-text document
 *   /<route>.md      per-page markdown
 *
 * Critically, this resolves `file=` code imports the same way
 * remark-code-import does at build time. The raw .md sources in the repo
 * contain import directives and no code, so serving those directly would
 * hand a reader empty code blocks.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY = require(path.join(ROOT, 'verification.json'));
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(ROOT, 'build');
const SITE = 'https://aman-dhakar-191.github.io/AgentforceAgentGuide';

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return e.name.endsWith('.md') ? [full] : [];
  });
}

function parseFrontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { data, body: text.slice(m[0].length) };
}

/** Inline ```lang file=path blocks with the real file contents. */
function resolveImports(body, mdPath) {
  return body.replace(
    /```(\w+)\s+file=([^\s`\n]+)\s*\n```/g,
    (whole, lang, rel) => {
      const target = path.resolve(path.dirname(mdPath), rel);
      if (!fs.existsSync(target)) {
        throw new Error(`Missing code import: ${rel} (from ${mdPath})`);
      }
      const code = fs.readFileSync(target, 'utf8').trimEnd();
      const label = path.relative(ROOT, target);
      return `\`\`\`${lang} title="${label}"\n${code}\n\`\`\``;
    }
  );
}

/** Flatten Docusaurus admonitions into plain prose. */
function flattenAdmonitions(body) {
  return body.replace(
    /:::(\w+)(?:\s+(.*))?\n([\s\S]*?):::/g,
    (whole, type, title, inner) =>
      `> **${(title || type).toUpperCase()}**\n` +
      inner.trim().split('\n').map((l) => `> ${l}`).join('\n')
  );
}

/**
 * The banner lives in verification.json and is rendered by a theme wrapper,
 * not in the markdown, so it has to be re-attached here or the text output
 * would drop the tested/untested signal entirely.
 */
function verificationLine(docId) {
  const entry = REGISTRY[docId] ?? {};
  if (entry.exempt) return null;
  if (!entry.verified) {
    return 'VERIFICATION: Not verified against a live org. Samples are ' +
      'derived from official documentation and should be treated as a ' +
      'starting point rather than tested code.';
  }
  const bits = [
    entry.org && `${entry.org} org`,
    entry.apiVersion && `API version ${entry.apiVersion}`,
    entry.date && `last checked ${entry.date}`,
  ].filter(Boolean);
  return `VERIFICATION: Deployed and run${bits.length ? ' in ' + bits.join(', ') : ''}.`;
}

function docIdFor(mdPath) {
  return path.relative(DOCS, mdPath).replace(/\.md$/, '').split(path.sep).join('/');
}

function routeFor(mdPath) {
  const rel = path.relative(DOCS, mdPath).replace(/\.md$/, '');
  return rel === 'intro' ? '' : `/${rel.split(path.sep).join('/')}`;
}

const pages = walk(DOCS)
  .map((mdPath) => {
    const raw = fs.readFileSync(mdPath, 'utf8');
    const { data, body } = parseFrontMatter(raw);
    // Drop the body's own H1; each output format supplies its own heading.
    // Drop the body's own H1; each output format supplies its own heading.
    // Trim first, or the leading newline after the front matter defeats ^.
    const content = flattenAdmonitions(resolveImports(body, mdPath))
      .trim()
      .replace(/^#\s+.*\n+/, '')
      .trim();
    const verification = verificationLine(docIdFor(mdPath));
    return {
      title: data.title || path.basename(mdPath, '.md'),
      verification,
      position: Number(data.sidebar_position ?? 99),
      route: routeFor(mdPath),
      content,
    };
  })
  .sort((a, b) => a.route.length - b.route.length || a.position - b.position);

fs.mkdirSync(OUT, { recursive: true });

// Per-page markdown, served alongside each HTML route.
for (const p of pages) {
  const dest = path.join(OUT, `${p.route || '/index'}.md`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const head = p.verification ? `> ${p.verification}\n\n` : '';
  fs.writeFileSync(dest, `# ${p.title}\n\n${head}${p.content}\n`);
}

const index = [
  '# Agentforce Agent Guide',
  '',
  '> A practical guide to building Agentforce agents with AgentScript, Apex,',
  '> Custom Lightning Types, and the Salesforce CLI. Code samples are imported',
  '> from a real SFDX project at build time. Each page states whether it has',
  '> been verified against a live org.',
  '',
  '## Docs',
  '',
  ...pages.map((p) => `- [${p.title}](${SITE}${p.route || '/index'}.md)`),
  '',
  '## Full text',
  '',
  `- [Entire guide as one document](${SITE}/llms-full.txt)`,
  '',
].join('\n');

const full = [
  '# Agentforce Agent Guide — full text',
  '',
  `Generated from ${SITE}`,
  '',
  ...pages.flatMap((p) => [
    '',
    '='.repeat(72),
    `# ${p.title}`,
    `Source: ${SITE}${p.route || '/'}`,
    ...(p.verification ? [p.verification] : []),
    '='.repeat(72),
    '',
    p.content,
  ]),
  '',
].join('\n');

fs.writeFileSync(path.join(OUT, 'llms.txt'), index);
fs.writeFileSync(path.join(OUT, 'llms-full.txt'), full);

console.log(
  `[llms] ${pages.length} pages -> llms.txt, llms-full.txt, ` +
    `${(full.length / 1024).toFixed(1)}KB full text`
);
