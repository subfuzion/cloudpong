FROM node:16-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

# Remove dev dependencies (saves ~110 MB in image size).
RUN npm ci --omit=dev

FROM gcr.io/distroless/nodejs:16

# The app listens on 8080 by default (override by setting PORT env var).
EXPOSE 8080

WORKDIR /usr/src/app

# Need package.json to let Node know app uses ES modules ("type": "module").
COPY --from=builder /usr/src/app/package.json .

# Build output (dist) will be surfaced at the app root.
COPY --from=builder /usr/src/app/dist .

# Don't forget to run `npm ci --omit=dev` in the previous build stage.
COPY --from=builder /usr/src/app/node_modules ./node_modules

# The app shares common library code between the browser and backend.
# The option is needed to allow imports without file extensions.
CMD ["--experimental-specifier-resolution=node", "server/main.js"]
