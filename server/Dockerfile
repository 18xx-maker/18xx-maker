# Build with the repository root as the context:
#   docker build -f server/Dockerfile -t 18xx-maker-play .
FROM node:24-slim AS deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Only the play server's own dependencies, not the root's devDependencies
# (electron, playwright, ...). Hoisted into the root node_modules because the
# shared code in src/ imports packages (ramda, chalk, ...) from there.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json server/
RUN pnpm install --frozen-lockfile --prod --shamefully-hoist \
    --filter 18xx-maker-play-server...

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY --from=deps /app/server/node_modules server/node_modules
# The server imports src/play, src/cli/validate.js and, through the #cli/*,
# #util/* and #export/* imports of package.json, more of src/
COPY package.json ./
COPY src src
COPY server/package.json server/
COPY server/migrations server/migrations
COPY server/src server/src

USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "server/src/index.js"]
