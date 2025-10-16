# Test Coverage Automation

Automated test coverage analysis and reporting system using Goose AI recipes with Google Chat notifications.

## 🚀 Features

- **Automated Test Analysis**: Analyzes codebase and writes comprehensive unit tests
- **Coverage Reporting**: Tracks coverage improvements and quality metrics
- **Deployment Recommendations**: Provides AI-driven deployment risk assessment
- **Google Chat Integration**: Sends formatted notifications to Google Chat space
- **CI/CD Ready**: GitHub Actions workflow runs on every commit
- **Read-Only Production Code**: Only modifies test files, never production code

## 📁 Project Structure

```
.
├── QuoteGarden/              # Sample codebase (Node.js Quote API)
├── recipe.yaml               # Goose recipe for test coverage analysis
├── send_webhook.sh           # Google Chat webhook notification script
├── .github/workflows/        # GitHub Actions CI/CD configuration
│   └── test-coverage.yml
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Git
- Node.js 18+ (for QuoteGarden app)
- **Goose CLI** (must be pre-installed in your environment)
- GitHub account (for CI/CD)
- Google Chat webhook URL

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd GooseTest
   ```

2. **Verify Goose CLI is available**
   ```bash
   goose --version
   ```

   If Goose is not installed, please install it in your environment before proceeding.

3. **Install project dependencies**
   ```bash
   cd QuoteGarden
   npm install
   cd ..
   ```

4. **Configure API keys**

   Set your Tetrate API key:
   ```bash
   export TETRATE_API_KEY="your-api-key-here"
   ```

5. **Run the recipe locally**
   ```bash
   goose run \
     --recipe recipe.yaml \
     --params project_directory=QuoteGarden \
     --provider tetrate \
     --model gpt-5-mini \
     --with-builtin developer \
     --no-session
   ```

### CI/CD Setup (GitHub Actions)

1. **Add Repository Secrets**

   Go to your GitHub repository → Settings → Secrets and variables → Actions

   Add the following secrets:
   - `TETRATE_API_KEY`: Your Tetrate API key for GPT-5-mini access
   - `ANTHROPIC_API_KEY`: (Optional) If using Anthropic models

2. **Google Chat Webhook**

   The webhook URL is hardcoded in `send_webhook.sh`:
   ```bash
   https://chat.googleapis.com/v1/spaces/AAAAkrnSh8o/messages?key=...
   ```

   To change it, edit `send_webhook.sh` line 6.

3. **Trigger the Workflow**

   The workflow runs automatically on:
   - Every push to any branch
   - Pull requests
   - Manual trigger (workflow_dispatch)

   It only runs when these files change:
   - `QuoteGarden/**`
   - `recipe.yaml`
   - `.github/workflows/test-coverage.yml`

## 📊 How It Works

### Workflow Steps

1. **Checkout Code**: Clones repository
2. **Setup Environment**: Installs Node.js, dependencies, and jq
3. **Verify Goose**: Checks Goose CLI is available in environment
4. **Run Recipe**: Executes Goose test coverage recipe
   - Analyzes codebase structure
   - Reviews existing tests
   - Writes new tests to fill coverage gaps
   - Runs test suite
   - Generates `test_report.json`
4. **Upload Report**: Saves test report as artifact (30-day retention)
5. **Send Notification**: Posts results to Google Chat
6. **Display Summary**: Shows metrics in GitHub Actions UI

### Recipe Capabilities

The `recipe.yaml` configures a Goose AI agent that:

- ✅ **Analyzes** codebase structure and identifies testable units
- ✅ **Reviews** existing test coverage
- ✅ **Writes** comprehensive unit tests (error handling, edge cases)
- ✅ **Executes** test suites and measures coverage
- ✅ **Generates** deployment recommendations based on:
  - Coverage percentage (target: >85%)
  - Quality score (target: ≥7/10)
  - Test pass rate
  - High-priority coverage gaps
- ✅ **Reports** results via Google Chat webhook

### Deployment Recommendations

The AI provides one of three recommendations:

| Status | Criteria |
|--------|----------|
| ✅ **PROCEED WITH DEPLOYMENT** | Coverage >85%, quality ≥7, all tests pass, no high-priority gaps |
| ⚠️ **REVIEW REQUIRED** | Coverage 70-85%, quality 5-7, or high-priority gaps exist |
| ❌ **DO NOT DEPLOY** | Coverage <70%, quality <5, critical tests failing |

## 🔧 Configuration

### Modify the Recipe

Edit `recipe.yaml` to customize:

- **Model**: Change `goose_model` (default: `gpt-5-mini`)
- **Provider**: Change `goose_provider` (default: `tetrate`)
- **Temperature**: Adjust AI creativity (default: `0.7`)
- **Instructions**: Customize test generation behavior
- **Parameters**: Add new parameters like `test_framework`, `language`

### Modify Webhook Notifications

Edit `send_webhook.sh` to:

- Change webhook URL (line 6)
- Customize message format (lines 72-94)
- Add additional metrics
- Modify notification conditions

### Modify CI/CD Workflow

Edit `.github/workflows/test-coverage.yml` to:

- Change trigger conditions
- Add additional jobs (linting, security scans)
- Modify test commands
- Add deployment steps

## 📧 Notifications

Google Chat messages include:

- 🧪 **Test Coverage Report** header
- 📊 **Deployment Recommendation** with status badge
- 📈 **Coverage Metrics**: before/after/improvement/quality/tests added
- 📝 **Analysis**: AI reasoning for recommendation
- ⚠️ **Coverage Gaps**: Untested areas
- 📋 **Action Items**: Recommended next steps

## 🧪 Testing

### Run Tests Locally

```bash
# Run recipe on QuoteGarden
goose run --recipe recipe.yaml --params project_directory=QuoteGarden --provider tetrate --model gpt-5-mini --with-builtin developer --no-session

# Test webhook notification
./send_webhook.sh test_report.json
```

### Verify GitHub Actions

1. Make a change to `QuoteGarden/` code
2. Commit and push
3. Check Actions tab in GitHub
4. Verify workflow runs successfully
5. Check Google Chat for notification

## 📝 Test Report Schema

The generated `test_report.json` contains:

```json
{
  "project_directory": "QuoteGarden",
  "analysis_summary": "...",
  "coverage_gaps": [...],
  "test_improvements": [...],
  "new_test_suggestions": [...],
  "overall_score": {
    "coverage_percentage": 100,
    "quality_score": 8,
    "recommendations_count": 3
  },
  "tests_written": {
    "output_file": "...",
    "tests_added": [...],
    "total_tests_added": 3,
    "write_status": "success"
  },
  "final_coverage_estimate": {
    "before_percentage": 92.5,
    "after_percentage": 100,
    "improvement": 7.5
  },
  "deployment_recommendation": {
    "status": "PROCEED WITH DEPLOYMENT",
    "reasoning": "...",
    "risk_level": "low",
    "action_items": [...]
  }
}
```

## 🔒 Security Notes

- **API Keys**: Never commit API keys. Use GitHub Secrets.
- **Webhook URL**: Contains authentication tokens. Keep secure.
- **Test Files Only**: Recipe only modifies test files, not production code.
- **Code Review**: Always review AI-generated tests before merging.

## 🐛 Troubleshooting

### Workflow fails with "Goose not found"
- Ensure Goose CLI is installed in your GitHub Actions runner environment
- Verify Goose is available in the system PATH
- Check that the runner has the necessary Goose CLI version

### "TETRATE_API_KEY not set"
- Add secret to GitHub repository settings
- Verify secret name matches workflow

### Webhook notification not sent
- Check webhook URL is correct
- Verify `test_report.json` was generated
- Ensure `send_webhook.sh` has execute permissions

### Recipe doesn't generate tests
- Check Goose logs for errors
- Verify project directory path is correct
- Ensure test framework is detected (Jest for QuoteGarden)

## 📚 Resources

- [Goose Documentation](https://docs.goose.ai)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Google Chat Webhooks](https://developers.google.com/chat/how-tos/webhooks)
- [Jest Testing Framework](https://jestjs.io)

## 📄 License

MIT License - See LICENSE file for details

## 🧪 Testing Actions

This repository includes automated testing via GitHub Actions to ensure code quality and test coverage.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests locally
5. Submit a pull request

## 📞 Support

For issues or questions:
- Open a GitHub Issue
- Check existing issues for solutions
- Review Goose documentation
