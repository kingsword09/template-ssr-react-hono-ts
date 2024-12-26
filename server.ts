import { Hono } from "hono";
import { serve, type HttpBindings } from "@hono/node-server";
import { createMiddleware } from "hono/factory";
import { createServer, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";

const app = new Hono<{ Bindings: HttpBindings }>();
const PORT = 3000;

app.all(
  "/*",
  createMiddleware<{ Bindings: HttpBindings }>(async (ctx, next) => {
    const vite = await getViteServer();
    return new Promise((resolve) => {
      vite.middlewares(ctx.env.incoming, ctx.env.outgoing, () => {
        resolve(next())
      });
    });
  })
);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log("Listening on http://localhost:3000");
});

let server: ViteDevServer;

async function getViteServer() {
  if (!server) {
    server = await createServer({
      server: {
        port: PORT,
        hmr: {
            host: "localhost",
            clientPort: PORT
        }
      },
      appType: "spa",
      plugins: [react()],
    });
  }
  return server;
}
