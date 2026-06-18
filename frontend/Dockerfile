# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json .
RUN npm install

# Build arguments to inject environment variables at compile-time (Vite requirement)
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration for single-page application routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
