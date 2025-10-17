# Goose Test Coverage Docker Setup

This repository contains a Docker setup for running Goose AI test coverage analysis on the QuoteGarden project.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)
- API keys for Tetrate or Anthropic

## Setup

### 1. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```
TETRATE_API_KEY=your_actual_tetrate_api_key
ANTHROPIC_API_KEY=your_actual_anthropic_api_key
```

## Running Locally

### Using Docker Compose (Recommended)

```bash
# Build and run
docker-compose up

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop and remove
docker-compose down
```

### Using Docker directly

```bash
# Build the image
docker build -t goose-test-coverage .

# Run the container
docker run --rm \
  -e TETRATE_API_KEY="your_api_key" \
  goose-test-coverage
```

## GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/test-coverage.yml`) that:

1. Triggers on every push to any branch
2. Builds the Docker image
3. Runs the Goose recipe inside the container
4. Reports test coverage via webhook

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `TETRATE_API_KEY`: Your Tetrate API key for gpt-5 model
- `ANTHROPIC_API_KEY`: (Optional) Your Anthropic API key

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

## Project Structure

```
.
├── Dockerfile              # Main Dockerfile with goose installation
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Files to exclude from Docker build
├── .env.example           # Environment variables template
├── recipe.yaml            # Goose recipe for test coverage
├── QuoteGarden/           # Node.js application
│   ├── src/              # Application source code
│   ├── test/             # Test files
│   └── package.json      # Node.js dependencies
└── .github/
    └── workflows/
        └── test-coverage.yml  # GitHub Actions workflow
```

## Dockerfile Details

The Docker image:

- Based on Ubuntu 22.04
- Installs Node.js 16.x
- Installs Goose CLI from latest release
- Configures Goose with `keyring: false` for CI/CD
- Sets up tetrate provider with gpt-5 model
- Installs QuoteGarden dependencies
- Runs the test coverage recipe

## Recipe Configuration

The `recipe.yaml` file contains:

- Test framework detection (Node/Jest, Python/pytest, Go, Java)
- Coverage collection and analysis
- Webhook reporting to Google Chat
- Production readiness assessment

## Troubleshooting

### Goose CLI not found
- Ensure the Docker image is built correctly
- Check that goose is in PATH: `/usr/local/bin/goose`

### API Key errors
- Verify your API keys are correctly set in `.env` or GitHub Secrets
- Ensure environment variables are passed to the container

### Test failures
- Check QuoteGarden dependencies are installed: `npm install`
- Verify the working directory is correct in the container

## Development

To modify the recipe or configuration:

1. Edit `recipe.yaml` for test coverage settings
2. Edit `Dockerfile` for goose or system configuration
3. Edit `docker-compose.yml` for runtime settings

## License

MIT
