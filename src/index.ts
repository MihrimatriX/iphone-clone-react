import { serve } from "bun";
import { resolve, sep } from "node:path";
import index from "./index.html";

// Safari app asks here whether a URL may be shown in an iframe; the browser cannot tell us.
async function frameCheck(req: Request): Promise<Response> {
  const target = new URL(req.url).searchParams.get("url") ?? "";
  if (!/^https?:\/\//.test(target)) return Response.json({ embeddable: false }, { status: 400 });
  try {
    const res = await fetch(target, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(5000) });
    await res.body?.cancel();
    const xfo = res.headers.get("x-frame-options") ?? "";
    const csp = res.headers.get("content-security-policy") ?? "";
    const blocked = /deny|sameorigin/i.test(xfo) || /frame-ancestors\s+(?!\*)/i.test(csp);
    return Response.json({ embeddable: !blocked });
  } catch {
    return Response.json({ embeddable: false });
  }
}

const PUBLIC = resolve(import.meta.dir, "../public");

/** CC0 models and textures for the 3D room, from public/assets; never outside that folder. */
async function asset(req: Request): Promise<Response> {
  const path = resolve(PUBLIC, "." + decodeURIComponent(new URL(req.url).pathname));
  if (!path.startsWith(PUBLIC + sep)) return new Response(null, { status: 403 });
  const file = Bun.file(path);
  return (await file.exists()) ? new Response(file, { headers: { "cache-control": "public, max-age=86400" } }) : new Response(null, { status: 404 });
}

const server = serve({
  routes: {
    "/*": index,
    "/assets/*": asset,
    "/api/frame-check": frameCheck,
  },
  // Client HMR is off: Bun 1.4.2's HMR transform drops `*.module.css` imports (ReferenceError at runtime).
  development: process.env.NODE_ENV !== "production" && { hmr: false, console: true },
});

console.log(`iPhone clone: ${server.url}`);
