# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy application files
COPY . .

# Set build-time environment variables
# ARG API_BASE_URL
# ENV NEXT_PUBLIC_API_BASE_URL=$API_BASE_URL

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Install production dependencies (if any are needed for serving)
# Next.js standalone output doesn't require this, but this is a safer default
RUN npm install --omit=dev

# Expose the port the app runs on
EXPOSE 9002

# Set the command to start the application
CMD ["npm", "start", "-p", "9002"]
