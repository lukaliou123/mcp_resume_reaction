FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port if needed (for HTTP server)
# EXPOSE 3000

# Start the application
CMD ["node", "dist/stdio.js"]
