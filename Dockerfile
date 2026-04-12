# Stage 1: Build the Angular application
FROM node:20-alpine AS build

ARG configuration=docker

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Replace dev config with docker config before build
RUN cp src/assets/config/config.docker.json src/assets/config/config.dev.json

RUN npx ng build --configuration ${configuration}

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist/interview-app/browser /usr/share/nginx/html

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Expose ports
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
