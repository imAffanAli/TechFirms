/**
 * Production entrypoint for hosted deploys (Railway/Render/etc).
 *
 * The key idea: never block the HTTP server (and therefore the health check) on
 * the one-time data seed.
 *
 *   1. Apply migrations synchronously — fast, and the schema must exist first.
 *   2. Kick off the company/score seed in the BACKGROUND (idempotent + guarded,
 *      so it's a no-op on later boots).
 *   3. Start the API in the foreground. `/health` has no DB dependency, so the
 *      platform health check goes green within seconds while data loads behind it.
 */
import { spawn, execSync } from 'node:child_process';

console.log('[startProd] applying database migrations…');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
} catch (e) {
  console.error('[startProd] migrate failed:', e);
  process.exit(1);
}

console.log('[startProd] launching background data seed…');
const seed = spawn('node', ['dist/scripts/seedData.js'], { stdio: 'inherit' });
seed.on('error', (e) => console.error('[startProd] seed failed to start:', e));
seed.on('exit', (code) => console.log(`[startProd] background seed finished (exit ${code}).`));

console.log('[startProd] starting API…');
const server = spawn('node', ['dist/index.js'], { stdio: 'inherit' });
server.on('exit', (code) => process.exit(code ?? 0));
