# Deterministic build for Railway (or any Docker host).
FROM node:20-slim

WORKDIR /app

# Install deps first (cached unless package files change).
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# App source, then build the Next.js production output.
COPY . .
RUN npm run build

# Next reads PORT from the environment (Railway sets it).
CMD ["npm", "run", "start"]
