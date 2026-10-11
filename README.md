<h1 align="center">Fihh</h1>
<div align="center">
  <img src="assets/fihh.png" height="200" />
</div>

<div align="center">
  <a href="https://www.npmjs.com/package/@mercuryworkshop/scramjet"><img src="https://img.shields.io/npm/v/@mercuryworkshop/scramjet.svg?maxAge=3600" alt="npm version" /></a>
  <img src="https://img.shields.io/github/issues/MercuryWorkshop/scramjet?style=flat&color=orange" />
  <img src="https://img.shields.io/github/stars/MercuryWorkshop/scramjet?style=flat&color=orange" />
</div>

---

Fihh is a blue-themed web proxy built on [Scramjet](https://github.com/MercuryWorkshop/scramjet) by Mercury Workshop, an experimental interception-based web proxy designed to evade internet censorship and bypass arbitrary browser restrictions.<br><br>
Fihh allows you to sandbox arbitrary web content, bypass CORS restrictions on loading websites, and instrument and debug websites inside the browser itself. This is accomplished through a combination of interception, rewriting, and sandboxing techniques. You can learn more about the technical details <a href="https://developer.puter.com/blog/how-I-ported-the-web-to-the-web/"><strong>here</strong></a>.<br><br>

## Supported Sites

Some of the popular websites that Scramjet supports include:

- [Google](https://google.com)
- [Youtube](https://youtube.com)
- [Instagram](https://instagram.com)
- [ChatGPT](https://chatgpt.com)
- [Reddit](https://reddit.com)
- [Twitter](https://twitter.com)
- [Discord](https://discord.com)
- [Spotify](https://spotify.com)
- [GeForce NOW](https://play.geforcenow.com/)
- [now.gg](https://now.gg)

## Development

### Dependencies

- Recent versions of `node.js` and `pnpm`
- `rustup`
- `wasm-bindgen`
- [Binaryen's `wasm-opt`](https://github.com/WebAssembly/binaryen)
- [this `wasm-snip` fork](https://github.com/r58Playz/wasm-snip)

#### Building

- Clone the repository with `git clone https://github.com/YOUR-USERNAME/fihh` (replace with your repo address)
- Install the dependencies with `pnpm i`
- Change directories with `cd packages/core`
- Build the rewriter with `pnpm rewriter:build`
- Build Scramjet with `pnpm build`

### Running Scramjet Locally

You can run the Scramjet dev server when running this command at the root

```sh
pnpm dev
```

The demo page for scramjet should now be running at <http://localhost:4141> and should rebuild upon a file being changed (excluding the rewriter).

### Wisp server

Fihh ships with its own copy of [wisp-js](packages/wisp-js) as a workspace package, so `pnpm dev` starts the Wisp server (default `ws://localhost:4142/`) alongside the demo. After pulling these changes, run `pnpm install` once (without `--frozen-lockfile`) to refresh `pnpm-lock.yaml`.

To run the Wisp server on its own:

```sh
pnpm --filter @mercuryworkshop/wisp-js server_cli -- --host 0.0.0.0 --port 4142
```

Then point the demo at it with `VITE_WISP_URL=ws://your-host:4142/ pnpm dev`.
