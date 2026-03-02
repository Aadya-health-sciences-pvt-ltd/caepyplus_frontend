// scripts/generate-healthz.cjs
// --------------------------------------------------------------
// Generates public/healthz.json at build time with rich metadata.
// This replaces the static, hand-written healthz.json so every
// Docker image carries verifiable identity (build time, version,
// git SHA).  The file is served as a static asset by `serve`.
// --------------------------------------------------------------

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read app version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

// Attempt to get the git commit SHA (gracefully skip if not in a repo)
let gitSha = 'unknown';
try {
    gitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (_) {
    // Not a git repo or git not available (e.g. CI scratch container)
}

// BUILD_SHA can also be injected via Docker --build-arg for reproducible tracing
const buildSha = process.env.BUILD_SHA || gitSha;

const health = {
    status: 'ok',
    service: pkg.name,
    version: pkg.version,
    build_sha: buildSha,
    built_at: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
};

const outPath = path.join(__dirname, '..', 'public', 'healthz.json');
fs.writeFileSync(outPath, JSON.stringify(health, null, 2) + '\n', 'utf8');

console.log(`[generate-healthz] Written to ${outPath}`);
console.log(JSON.stringify(health, null, 2));
