// Exercise the consumer's real pnpm interface, outside the monorepo and its stores/config.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const fixture = fileURLToPath(new URL('./fixtures/mirror-consumer/', import.meta.url));
const tokens = fileURLToPath(new URL('../', import.meta.url));
const tarballPath = '/@gntik-ai/tokens/-/tokens-0.2.1.tgz';
const sha512 = (bytes) => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
const checkIntegrity = (bytes, integrity) =>
  assert.equal(sha512(bytes), integrity, 'carried tarball matches lockfile sha512');

test(
  'locked tokens install from a mirror and an offline store, while altered bytes are rejected',
  { timeout: 600_000 },
  async (t) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'gntik-mirror-'));
    const servers = [];
    t.after(async () => {
      await Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
      await fs.rm(root, { recursive: true, force: true });
    });

    // Allowlist process settings before reading values: no inherited token/auth variables or npm config.
    const env = Object.fromEntries(
      ['PATH', 'SystemRoot', 'COREPACK_HOME']
        .filter((key) => process.env[key] !== undefined)
        .map((key) => [key, process.env[key]]),
    );
    const home = path.join(root, 'home');
    await fs.mkdir(home);
    const config = path.join(root, 'empty.npmrc');
    await fs.writeFile(config, '');
    Object.assign(env, {
      HOME: home,
      USERPROFILE: home,
      XDG_CONFIG_HOME: home,
      NPM_CONFIG_USERCONFIG: config,
      NPM_CONFIG_GLOBALCONFIG: path.join(root, 'empty-global.npmrc'),
      CI: 'true',
    });
    await fs.writeFile(env.NPM_CONFIG_GLOBALCONFIG, '');

    const lock = await fs.readFile(path.join(fixture, 'pnpm-lock.yaml'), 'utf8');
    const publishedIntegrity = /integrity: (sha512-[A-Za-z0-9+/=]+)/.exec(lock)?.[1];
    assert.ok(publishedIntegrity, 'fixture pins sha512 integrity');
    assert.doesNotMatch(lock, /tarball:|https?:/);
    let integrity = publishedIntegrity;
    let tarball;
    try {
      const response = await fetch(`https://registry.npmjs.org${tarballPath}`, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`public registry returned ${response.status}`);
      tarball = Buffer.from(await response.arrayBuffer());
    } catch {
      // Pack only local published files; use a temporary integrity, never overwrite the fixture.
      const local = path.join(root, 'local-package');
      await fs.mkdir(local);
      for (const name of ['package.json', 'src', 'dist']) {
        try {
          await fs.cp(path.join(tokens, name), path.join(local, name), { recursive: true });
        } catch (error) {
          // Like npm pack on a clean checkout, include dist only when it has been built.
          if (name !== 'dist' || error.code !== 'ENOENT') throw error;
        }
      }
      await exec(
        'npm',
        ['pack', local, '--ignore-scripts', '--pack-destination', root, '--cache', path.join(root, 'npm-cache')],
        {
          cwd: root,
          env,
          signal: t.signal,
        },
      );
      tarball = await fs.readFile(path.join(root, 'gntik-ai-tokens-0.2.1.tgz'));
      integrity = sha512(tarball);
      t.diagnostic(
        'Public registry unreachable: this run checks integrity and offline mechanics only, not byte identity with the npm artifact.',
      );
    }
    const preparedFixture = path.join(root, 'fixture');
    await fs.cp(fixture, preparedFixture, { recursive: true });
    if (integrity !== publishedIntegrity) {
      await fs.writeFile(path.join(preparedFixture, 'pnpm-lock.yaml'), lock.replace(publishedIntegrity, integrity));
    }
    // A successful download must match the committed published integrity; mismatch never falls back.
    const preparedLock = await fs.readFile(path.join(preparedFixture, 'pnpm-lock.yaml'), 'utf8');
    integrity = /integrity: (sha512-[A-Za-z0-9+/=]+)/.exec(preparedLock)[1];
    checkIntegrity(tarball, integrity);
    const altered = Buffer.from(tarball);
    altered[altered.length - 1] ^= 1;
    assert.throws(() => checkIntegrity(altered, integrity), { code: 'ERR_ASSERTION' });

    const consumer = async (name) => {
      const cwd = path.join(root, name);
      await fs.cp(preparedFixture, cwd, { recursive: true });
      return cwd;
    };
    const store = async (name) => {
      const dir = path.join(root, name);
      await fs.mkdir(dir);
      assert.deepEqual(await fs.readdir(dir), []);
      return dir;
    };
    const mirror = async (bytes) => {
      const requests = [];
      const server = createServer((req, res) => {
        requests.push(`${req.method} ${req.url}`);
        if (req.method !== 'GET' || req.url !== tarballPath) {
          res.writeHead(404).end();
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Length': bytes.length });
        res.end(bytes);
      });
      servers.push(server);
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
      return {
        url: `http://127.0.0.1:${server.address().port}/`,
        requests,
        close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
      };
    };
    const pnpm = async (cwd, storeDir, args) => {
      const before = await fs.readFile(path.join(cwd, 'pnpm-lock.yaml'), 'utf8');
      try {
        await exec('pnpm', [...args, '--store-dir', storeDir, '--ignore-scripts', '--fetch-retries', '0'], {
          cwd,
          env,
          signal: t.signal,
        });
        return 0;
      } catch (error) {
        // Missing tools, sockets, aborts, etc. must not satisfy a negative install assertion.
        if (!Number.isInteger(error.code) || error.code === 0 || error.signal) throw error;
        return error.code;
      } finally {
        assert.equal(await fs.readFile(path.join(cwd, 'pnpm-lock.yaml'), 'utf8'), before, 'lockfile stays unchanged');
      }
    };
    const installedVersion = async (cwd) =>
      JSON.parse(await fs.readFile(path.join(cwd, 'node_modules/@gntik-ai/tokens/package.json'), 'utf8')).version;
    const absent = async (cwd) =>
      assert.rejects(fs.access(path.join(cwd, 'node_modules/@gntik-ai/tokens')), { code: 'ENOENT' });

    const good = await mirror(tarball);
    const connected = await consumer('mirror-consumer');
    assert.equal(
      await pnpm(connected, await store('mirror-store'), ['install', '--frozen-lockfile', '--registry', good.url]),
      0,
      'mirror install succeeds',
    );
    assert.ok(good.requests.includes(`GET ${tarballPath}`), 'mirror tarball was fetched');
    assert.equal(await installedVersion(connected), '0.2.1');

    const offlineStore = await store('offline-store');
    good.requests.length = 0;
    assert.equal(
      await pnpm(await consumer('fetch-consumer'), offlineStore, [
        'fetch',
        '--frozen-lockfile',
        '--registry',
        good.url,
      ]),
      0,
      'fetch fills a separate empty store',
    );
    assert.ok(good.requests.includes(`GET ${tarballPath}`), 'fetch requested the carried tarball');
    await good.close();
    const offline = await consumer('offline-consumer');
    assert.equal(
      await pnpm(offline, offlineStore, ['install', '--frozen-lockfile', '--offline', '--registry', good.url]),
      0,
      'offline install succeeds with the server stopped',
    );
    assert.equal(await installedVersion(offline), '0.2.1');

    const bad = await mirror(altered);
    const tampered = await consumer('tampered-consumer');
    assert.notEqual(
      await pnpm(tampered, await store('tampered-store'), ['install', '--frozen-lockfile', '--registry', bad.url]),
      0,
      'altered mirror install fails',
    );
    assert.ok(bad.requests.includes(`GET ${tarballPath}`), 'altered tarball was fetched');
    await absent(tampered);
    const poisonedStore = await store('failed-fetch-store');
    bad.requests.length = 0;
    const failedFetch = await consumer('failed-fetch-consumer');
    assert.notEqual(
      await pnpm(failedFetch, poisonedStore, ['fetch', '--frozen-lockfile', '--registry', bad.url]),
      0,
      'fetch of altered bytes fails',
    );
    assert.ok(bad.requests.includes(`GET ${tarballPath}`), 'fetch requested the altered tarball');
    await absent(failedFetch);
    await bad.close();
    const rejectedOffline = await consumer('rejected-offline-consumer');
    assert.notEqual(
      await pnpm(rejectedOffline, poisonedStore, ['install', '--frozen-lockfile', '--offline', '--registry', bad.url]),
      0,
      'offline install after failed fetch fails',
    );
    await absent(rejectedOffline);
  },
);
