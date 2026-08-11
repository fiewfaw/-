FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "src/server.mjs"]
