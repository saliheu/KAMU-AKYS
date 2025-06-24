# Build stage
FROM node:18-alpine as build

# Build arguments
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_MAPBOX_TOKEN

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]