# Builds the Rust/WASM rewriter, the Fihh site, and runs one server for both site + Wisp.
FROM node:22-bookworm

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl build-essential git ca-certificates xz-utils \
 && rm -rf /var/lib/apt/lists/*

# Rust nightly + wasm target (the rewriter needs build-std)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup toolchain install nightly --profile minimal -c rust-src -t wasm32-unknown-unknown

# wasm tooling the build script checks for
RUN cargo install wasm-bindgen-cli --version 0.2.105 \
 && cargo install --git https://github.com/r58playz/wasm-snip
RUN VER=$(curl -sI https://github.com/WebAssembly/binaryen/releases/latest | awk -F '/' '/^location/ {print substr($NF, 1, length($NF)-1)}') \
 && curl -fL "https://github.com/WebAssembly/binaryen/releases/download/${VER}/binaryen-${VER}-x86_64-linux.tar.gz" | tar xz -C /tmp \
 && cp /tmp/binaryen-${VER}/bin/* /usr/local/bin/ \
 && cp /tmp/binaryen-${VER}/lib/* /usr/local/lib/ \
 && ldconfig \
 && rm -rf /tmp/binaryen-*

RUN corepack enable && corepack prepare pnpm@10.12.1 --activate

WORKDIR /app
COPY . .

# The build reads `git rev-parse`; make sure a repo exists even if .git wasn't copied.
RUN git rev-parse --short HEAD >/dev/null 2>&1 \
 || (git init -q && git add -A && git -c user.email=a@b.c -c user.name=build commit -q -m build)

RUN pnpm install --no-frozen-lockfile
RUN cd packages/core && pnpm rewriter:build && pnpm build
RUN cd packages/demo && pnpm build

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
