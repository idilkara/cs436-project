# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the port your server uses (update if not 3000)
EXPOSE 3000

# Run your server
CMD ["node", "server.js"]
