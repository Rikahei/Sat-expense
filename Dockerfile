# Use official Node.js 22 LTS slim version as the base image
FROM node:22-slim

# Set working directory inside the container (initially to /app)
WORKDIR /app

# Change working directory to /app/spending-app
WORKDIR /app/frontend

EXPOSE 5173

# Start the development server from /app/spending-app
CMD ["npm", "run", "dev", "--", "--host"]
