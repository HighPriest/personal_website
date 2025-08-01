# Use a specific version for reproducible builds
FROM node:24-slim AS base
# Set up pnpm in the base layer so it's available in all subsequent stages.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- Builder Stage ---
# This stage installs dependencies and builds the application.
FROM base AS builder
WORKDIR /app

# 1. Copy only dependency-related files first.
# This layer is only invalidated when dependencies change.
COPY pnpm-lock.yaml package.json ./

# 2. Install dependencies.
# This step is now cached as long as the lockfile doesn't change.
RUN pnpm install --prod=false

# 3. Copy the rest of your source code.
# The dependency layer above will remain cached if you only change these files.
# Any change here will only trigger a rebuild from this point forward.
COPY . .

# 4. Build the application.
RUN pnpm run build --logLevel error

# 5. Remove development dependencies.
RUN pnpm prune --prod

# --- Final Stage ---
# This stage creates the small, final image with only what's needed to run.
FROM base
WORKDIR /app

# Copy the pruned production dependencies from the builder stage.
COPY --from=builder /app/node_modules ./node_modules
# Copy the built application artifacts.
COPY --from=builder /app/build ./build
# CMD requires the static directory, so we must copy it.
COPY --from=builder /app/static ./static
# Copy package.json, as some libraries might read it at runtime.
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
# The CMD remains the same.
CMD [ "node", "/app/build/index.js", "--allow-fs-read=/app/build,/app/static", "--allow-fs-write=/app/uploads" ]