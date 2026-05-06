FROM node:18-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
# Copy shared types to a local directory within the build context
COPY shared-types ./shared-types
# Copy bff files
COPY bff/package.json bff/pnpm-lock.yaml bff/tsconfig.json ./
# Update tsconfig to point to the local shared-types during build
RUN sed -i 's|../shared-types|./shared-types|g' tsconfig.json
RUN pnpm install --frozen-lockfile
COPY bff/src ./src
RUN pnpm run build

FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY bff/pnpm-lock.yaml bff/package.json ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 3001
# tsc with multiple root dirs (src and shared-types) will output them as subfolders in dist
CMD ["node", "dist/src/server.js"]
