FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    gnupg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 16.x
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install goose CLI (non-interactive)
RUN curl -fsSL https://github.com/block/goose/releases/download/stable/download_cli.sh | CONFIGURE=false bash

# Set working directory
WORKDIR /workspace

# Copy the entire repository
COPY . .

# Install Node.js dependencies for QuoteGarden
WORKDIR /workspace/QuoteGarden
RUN npm install

# Go back to workspace root
WORKDIR /workspace

# Set environment variables
ENV PATH="/usr/local/bin:${PATH}"
ENV GOOSE_HOME="/root/.goose"

# Default command runs the recipe
CMD ["goose", "run", "--recipe", "recipe.yaml", "--no-session"]
