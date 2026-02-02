FROM node:22-alpine

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source code and Prisma schema
COPY . .
RUN npx prisma generate

# We will pass the PORT and other envs via docker-compose
EXPOSE 3000
CMD ["npx", "tsx", "src/index.ts"]