# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# EXPOSE 5173

# CMD ["npm", "run", "dev", "--", "--host"]

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept build args for Vite env vars (baked in at build time)
ARG VITE_BASE_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]