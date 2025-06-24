FROM node:18-alpine

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++ postgresql-client

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "src/server.js"]