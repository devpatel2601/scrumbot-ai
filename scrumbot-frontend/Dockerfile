# Use official Node image as base
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json vite.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public

RUN npm install

# Expose port 5173 which Vite uses by default
EXPOSE 5173

# Start Vite dev server with host binding so it’s accessible externally
CMD ["npm", "run", "dev"]
