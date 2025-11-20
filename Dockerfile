FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install (with --omit=dev) so the build works even when no package-lock.json
# `npm ci` requires a lockfile; some CI providers omit it. `npm install --omit=dev` installs
# production deps and works reliably in this repo.
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
