import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { createAIReviewHttpHandler, createAIReviewV2HttpHandler } from '@jaanch/ai-runtime';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function liveAIReviewPlugin(environment: Record<string, string>): Plugin {
  const common = {
    enabled: environment.JAANCH_AI_LIVE_ENABLED === 'true',
    apiKey: environment.OPENAI_API_KEY,
    model: environment.JAANCH_AI_MODEL,
  };
  const v1Handler = createAIReviewHttpHandler(common);
  const v2Handler = createAIReviewV2HttpHandler(common);
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

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, repoRoot, '');
  return { envDir: repoRoot, plugins: [react(), liveAIReviewPlugin(environment)] };
});
