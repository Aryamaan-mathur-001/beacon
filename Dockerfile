FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 beacon

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER beacon
EXPOSE 4000
ENV PORT=4000

CMD ["node", "server.js"]
