FROM node:18-alpine

WORKDIR /app

# Copy only package files first (for better caching)

COPY package*.json ./

RUN npm install --only=production

# Copy rest of the app

COPY . .

EXPOSE 3000

ENV APP_VERSION=v1

CMD ["node", "app.js"]
