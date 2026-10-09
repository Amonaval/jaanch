import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

type AIReviewRuntime = typeof import('@jaanch/ai-runtime');

async function liveAIReviewPlugin(environment: Record<string, string>): Promise<Plugin | undefined> {
  if (environment.JAANCH_AI_LIVE_ENABLED !== 'true') return undefined;

  let runtime: AIReviewRuntime;
  try {
    runtime = await import('@jaanch/ai-runtime');
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Live AI review is enabled, but the optional @jaanch/ai-runtime could not be loaded. ` +
      `Set JAANCH_AI_LIVE_ENABLED=false to run the normal Jaanch web app without AI review. ` +
      `Runtime load error: ${detail}`,
    );
  }

  const common = {
    enabled: true,
    apiKey: environment.OPENAI_API_KEY,
    model: environment.JAANCH_AI_MODEL,
  };
  const v1Handler = runtime.createAIReviewHttpHandler(common);
  const v2Handler = runtime.createAIReviewV2HttpHandler(common);
  const mount = (middlewares: { use: (path: string, handler: (req: any, res: any) => void) => void }) => {
    middlewares.use('/api/ai-review', (request, response) => { void v1Handler(request, response); });
    middlewares.use('/api/ai-review-v2', (request, response) => { void v2Handler(request, response); });
  };
  return {
    name: 'jaanch-live-ai-review',
    configureServer(server) { mount(server.middlewares); },
    configurePreviewServer(server) { mount(server.middlewares); },
  };
}

export default defineConfig(async ({ mode }) => {
  const environment = loadEnv(mode, repoRoot, '');
  const aiPlugin = await liveAIReviewPlugin(environment);
  return {
    envDir: repoRoot,
    plugins: [react(), ...(aiPlugin ? [aiPlugin] : [])],
  };
});
