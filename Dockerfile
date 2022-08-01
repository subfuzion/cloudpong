FROM node:16-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

#FROM gcr.io/distroless/nodejs:16
FROM node:16-slim
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package.json .
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist .
EXPOSE 8080
# CMD [ "main.js" ]
ENTRYPOINT ["node", "--experimental-specifier-resolution=node", "server/main.js"]