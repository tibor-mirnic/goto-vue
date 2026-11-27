import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

type Host = 'vite' | 'nuxt';
type Mode = 'production' | 'mock' | 'off' | 'unset';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const loopback = '127.0.0.1';

const listenOnLoopback = async () => {
  const server = createServer();
  server.listen(0, loopback);
  await once(server, 'listening');
  return server;
};

const reservePorts = async () => {
  const web = await listenOnLoopback();
  try {
    const api = await listenOnLoopback();
    const ports = [web.address(), api.address()] as const;
    await Promise.all(
      [web, api].map(
        (server) =>
          new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
          })
      )
    );
    const [webAddress, apiAddress] = ports;
    if (!webAddress || typeof webAddress === 'string' || !apiAddress || typeof apiAddress === 'string') {
      throw new Error('Expected loopback TCP addresses');
    }
    return { webPort: webAddress.port, apiPort: apiAddress.port };
  } finally {
    if (web.listening) web.close();
  }
};

const launch = (command: string, args: string[], env: NodeJS.ProcessEnv) => {
  const child = spawn(command, args, {
    cwd: workspace,
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  let finished = false;
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk: Buffer) => {
      output = (output + chunk.toString()).slice(-8000);
    });
  }
  const closed = new Promise<number | null>((resolve) => {
    child.once('close', (code) => {
      finished = true;
      resolve(code);
    });
    child.once('error', (error) => {
      finished = true;
      output += error.message;
      resolve(null);
    });
  });
  const terminate = (signal: NodeJS.Signals) => {
    if (finished || !child.pid) return;
    try {
      process.kill(-child.pid, signal);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error;
    }
  };
  const stop = async () => {
    terminate('SIGTERM');
    const stopped = await Promise.race([closed.then(() => true), delay(3000, false, { ref: false })]);
    if (!stopped) {
      terminate('SIGKILL');
      await closed;
    }
  };
  let stopping: Promise<void> | undefined;
  return {
    exited: () => child.exitCode !== null || child.signalCode !== null || child.pid === undefined,
    stop: () => (stopping ??= stop()),
    closed,
    failure: () => new Error(`${command} ${args.join(' ')}\n${output}`)
  };
};

const waitForServer = async (server: ReturnType<typeof launch>, readyUrl: string) => {
  const deadline = Date.now() + 90_000;
  try {
    while (Date.now() < deadline && !server.exited()) {
      const response = await fetch(readyUrl, {
        headers: { connection: 'close' },
        signal: AbortSignal.timeout(1500)
      }).catch(() => undefined);
      if (response) {
        await response.body?.cancel();
        if (response.ok && !server.exited()) return server;
      }
      await delay(150);
    }
    throw server.failure();
  } catch (error) {
    await server.stop();
    throw error;
  }
};

export const createPaletteServers = async (host: Host) => {
  const { webPort, apiPort } = await reservePorts();
  const origin = `http://${loopback}:${webPort}`;
  const apiOrigin = `http://${loopback}:${apiPort}`;
  const apiUrl = apiOrigin + '/api/palettes/aurora';
  const children = new Set<ReturnType<typeof launch>>();
  let closing = false;
  let web: ReturnType<typeof launch> | undefined;
  let api: ReturnType<typeof launch> | undefined;

  const launchOwned = (command: string, args: string[], env: NodeJS.ProcessEnv) => {
    if (closing) throw new Error('The palette test fixture is closing');
    const child = launch(command, args, env);
    children.add(child);
    void child.closed.then(() => children.delete(child));
    return child;
  };

  const start = (command: string, args: string[], env: NodeJS.ProcessEnv, readyUrl: string) =>
    waitForServer(launchOwned(command, args, env), readyUrl);

  const startApi = async () => {
    api = await start(
      'pnpm',
      ['exec', 'vpx', 'apps/api/src/index.ts'],
      {
        ...process.env,
        HOST: loopback,
        PORT: String(apiPort)
      },
      apiUrl
    );
  };
  const stopApi = async () => {
    await api?.stop();
    api = undefined;
  };
  const startWeb = async (mode: Mode) => {
    await web?.stop();
    web = undefined;
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      API_URL: apiOrigin,
      NUXT_TELEMETRY_DISABLED: '1',
      ENABLE_MOCK_API: 'true'
    };
    if (mode === 'off') env.ENABLE_MOCK_API = 'false';
    if (mode === 'unset') delete env.ENABLE_MOCK_API;

    const listen = ['--host', loopback, '--port', String(webPort), '--strictPort'];
    const readyUrl = origin + '/palette';
    if (mode !== 'production') {
      const args =
        host === 'nuxt' ? ['dev:nuxt', ...listen, '--no-fork', '--no-tui', '--no-takeover'] : ['dev', ...listen];
      web = await start('pnpm', args, env, readyUrl);
      return;
    }

    const build = launchOwned('pnpm', ['exec', 'vp', 'run', '--no-cache', `@goto/${host}-app#build`], env);
    if ((await build.closed) !== 0) throw build.failure();
    if (host === 'vite') {
      web = await start('pnpm', ['--filter', '@goto/vite-app', 'run', 'preview', ...listen], env, readyUrl);
      return;
    }
    web = await start(
      process.execPath,
      ['apps/nuxt/.output/server/index.mjs'],
      {
        ...env,
        NITRO_HOST: loopback,
        NITRO_PORT: String(webPort)
      },
      readyUrl
    );
  };

  return {
    origin,
    apiUrl,
    startApi,
    stopApi,
    startWeb,
    close: async () => {
      closing = true;
      await Promise.all([...children].map((child) => child.stop()));
    }
  };
};
