FROM node:18-alpine

WORKDIR /app

# Package files kopyala
COPY package*.json ./

# Dependencies yükle
RUN npm install

# Uygulama kodunu kopyala
COPY . .

# Port ayarla
EXPOSE 3000

# Development server başlat
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 