// Production server: serves the built Fihh site and the Wisp server on ONE port.
//   site:  http://HOST:PORT/
//   wisp:  ws://HOST:PORT/wisp/   (wss:// when behind HTTPS)
// Build the site first:  cd packages/demo && pnpm build
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "packages/demo/dist");
const PORT = Number(process.env.PORT || 8080);

// Public server: never let visitors reach the host's own network.
wisp.options.allow_private_ips = false;
wisp.options.allow_loopback_ips = false;

const MIME = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".wasm": "application/wasm",
	".png": "image/png",
	".jpg": "image/jpeg",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".map": "application/json",
	".woff2": "font/woff2",
	".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
	let pathname;
	try {
		pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
	} catch {
		res.writeHead(400).end("Bad request");
		return;
	}
	if (pathname.endsWith("/")) pathname += "index.html";

	const file = path.normalize(path.join(ROOT, pathname));
	if (!file.startsWith(ROOT + path.sep)) {
		res.writeHead(403).end("Forbidden");
		return;
	}

	fs.readFile(file, (err, data) => {
		if (err) {
			res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
			return;
		}
		const headers = {
			"content-type": MIME[path.extname(file)] || "application/octet-stream",
		};
		if (pathname === "/sw.js") {
			headers["cache-control"] = "no-cache";
			headers["service-worker-allowed"] = "/";
		}
		res.writeHead(200, headers).end(data);
	});
});

server.on("upgrade", (req, socket, head) => {
	if (req.url && req.url.startsWith("/wisp/")) {
		wisp.routeRequest(req, socket, head);
	} else {
		socket.destroy();
	}
});

server.listen(PORT, "0.0.0.0", () => {
	console.log(`Fihh listening on port ${PORT} (site at /, wisp at /wisp/)`);
});
