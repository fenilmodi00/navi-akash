FROM node:18-slim

WORKDIR /app

# Install git for submodule initialization
RUN apt-get update && apt-get install -y git && apt-get clean

# Copy package files
COPY package.json bun.lock ./
COPY .gitmodules ./

# Copy submodule references
COPY plugin-discord ./plugin-discord/
COPY plugin-akash-chat ./plugin-akash-chat/

# Create directories that are excluded from version control
RUN mkdir -p elizadb data

# Install dependencies
RUN npm install --production --ignore-scripts

# Copy the rest of the application (excluding akash and elizadb which are ignored)
COPY . .

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "run", "start"] 