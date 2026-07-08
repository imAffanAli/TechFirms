# Deterministic build for Railway (or any Docker host).
# Single stage on purpose: keeps devDeps (prisma CLI, tsx) available so the
# first-boot migrate + seed step can run.
FROM node:20-slim

# Prisma's query engine needs the OpenSSL runtime.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first (cached unless package files change).
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# App source, then generate the Prisma client and compile TS -> dist/.
COPY . .
RUN npx prisma generate && npm run build

# Railway injects PORT + the DB vars at runtime. `npm start` migrates + seeds
# (idempotent, guarded) and then boots the API.
CMD ["npm", "run", "start"]
