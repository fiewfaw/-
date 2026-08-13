FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
COPY --chown=node:node contract ./contract
COPY --chown=node:node scripts ./scripts
USER node
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "src/server.mjs"]
