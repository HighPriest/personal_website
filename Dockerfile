# Pinned: keep the major in step with .nvmrc and the CI job image.
ARG NODE_IMAGE=docker.io/library/node:26.12.1-trixie-slim
# Where the runtime stage takes the app from: `build` builds it here (the default); `prebuilt`
# takes CI's already-tested build output from ./prebuilt. The
# stage that isn't used is skipped.
ARG APP_FROM=build

# Build stage: runs on the build host's own platform (arm64 on the CI machine). Its output is plain
# JavaScript with no runtime dependencies, so it runs on any platform.
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# Node 25 and later ship without corepack: install the pnpm version named in package.json.
RUN npm install --global "$(node -p "require('./package.json').packageManager.split('+')[0]")"
RUN --mount=type=cache,target=/pnpm-store pnpm install --frozen-lockfile --store-dir /pnpm-store
COPY . .
RUN pnpm build

# CI's build output: ./prebuilt holds build/ and package.json.
FROM scratch AS prebuilt
COPY prebuilt/ /app/

FROM ${APP_FROM} AS app

# Runtime stage: the target platform (linux/amd64 for the server). It has no RUN steps, so building
# it on another architecture needs no emulation. It holds only the build output and package.json.
FROM ${NODE_IMAGE}
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=app /app/package.json ./
COPY --from=app /app/build ./build
USER node
EXPOSE 3000
# Kept only in Docker-format images: build with `podman build --format docker`.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD ["node", "-e", "fetch('http://127.0.0.1:' + process.env.PORT + '/healthz').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
# Node's permission model: the server may read only its own files, write none, and start no child
# processes or workers. Every route works under it (checked in e2e, see playwright.config.ts).
CMD ["node", "--permission", "--allow-fs-read=/app/build", "--allow-fs-read=/app/package.json", "--allow-net", "build/index.js"]
