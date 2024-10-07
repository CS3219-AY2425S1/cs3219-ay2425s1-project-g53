# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /peerprep

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
COPY package*.json ./
RUN pnpm install

# Copy the Next.js app code (everything except what's in .dockerignore)
COPY . /peerprep

# Build the Next.js app
RUN pnpm run build

# Expose the Next.js default port
EXPOSE 3000

# Start the Next.js app in development mode
CMD ["pnpm", "start"]
