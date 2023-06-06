FROM  nikolaik/python-nodejs as base
FROM base AS deps
# RUN apk add --no-cache libc6-compat

WORKDIR /app
# Install dependencies based on the preferred package manager
COPY package*.json ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


RUN npm run build
# Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
COPY --from=builder /app/dist /app
COPY --from=builder /app/package*.json /app
RUN npm ci --omit=dev
EXPOSE 3001
ENV PORT 3001
ENV TERM xterm-256color
RUN ls
CMD ["node", "app.js"]