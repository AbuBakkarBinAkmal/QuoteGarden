#!/bin/bash

# Google Chat Webhook Notification Script
# Sends test coverage reports to Google Chat space

WEBHOOK_URL="https://chat.googleapis.com/v1/spaces/AAAAkrnSh8o/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=CMNM37mIP7DlpO3DAC4kPWbzDljk22sjlKvKVw4q7NI"

# Read report file (default: test_report.json)
REPORT_FILE="${1:-test_report.json}"

if [ ! -f "$REPORT_FILE" ]; then
    echo "❌ Error: Report file '$REPORT_FILE' not found"
    exit 1
fi

# Parse JSON report
DEPLOYMENT_STATUS=$(jq -r '.deployment_recommendation.status // "UNKNOWN"' "$REPORT_FILE")
COVERAGE_BEFORE=$(jq -r '.final_coverage_estimate.before_percentage // 0' "$REPORT_FILE")
COVERAGE_AFTER=$(jq -r '.final_coverage_estimate.after_percentage // 0' "$REPORT_FILE")
IMPROVEMENT=$(jq -r '.final_coverage_estimate.improvement // 0' "$REPORT_FILE")
QUALITY_SCORE=$(jq -r '.overall_score.quality_score // 0' "$REPORT_FILE")
TESTS_ADDED=$(jq -r '.tests_written.total_tests_added // 0' "$REPORT_FILE")
RISK_LEVEL=$(jq -r '.deployment_recommendation.risk_level // "unknown"' "$REPORT_FILE")
REASONING=$(jq -r '.deployment_recommendation.reasoning // "No reasoning provided"' "$REPORT_FILE")
PROJECT_DIR=$(jq -r '.project_directory // "Unknown Project"' "$REPORT_FILE" 2>/dev/null || echo "Test Project")

# Determine status emoji and color
case "$DEPLOYMENT_STATUS" in
    "PROCEED WITH DEPLOYMENT")
        STATUS_EMOJI="✅"
        STATUS_COLOR="#28a745"
        ;;
    "REVIEW REQUIRED BEFORE DEPLOYMENT")
        STATUS_EMOJI="⚠️"
        STATUS_COLOR="#ffc107"
        ;;
    "DO NOT DEPLOY")
        STATUS_EMOJI="❌"
        STATUS_COLOR="#dc3545"
        ;;
    *)
        STATUS_EMOJI="❓"
        STATUS_COLOR="#6c757d"
        ;;
esac

# Risk level emoji
case "$RISK_LEVEL" in
    "low")
        RISK_EMOJI="🟢"
        ;;
    "medium")
        RISK_EMOJI="🟡"
        ;;
    "high")
        RISK_EMOJI="🔴"
        ;;
    *)
        RISK_EMOJI="⚪"
        ;;
esac

# Build coverage gaps text
COVERAGE_GAPS=$(jq -r '.coverage_gaps[]' "$REPORT_FILE" 2>/dev/null | head -5 | sed 's/^/• /' | tr '\n' '\n' || echo "None identified")

# Build action items text
ACTION_ITEMS=$(jq -r '.deployment_recommendation.action_items[]?' "$REPORT_FILE" 2>/dev/null | head -5 | sed 's/^/• /' | tr '\n' '\n')
if [ -z "$ACTION_ITEMS" ]; then
    ACTION_ITEMS="None"
fi

# Build formatted text message
MESSAGE_TEXT="*🧪 Test Coverage Report - QuoteGarden*

*Deployment Recommendation*
$STATUS_EMOJI *$DEPLOYMENT_STATUS*
Risk Level: $RISK_EMOJI $RISK_LEVEL

*📊 Coverage Metrics*
• Coverage Before: $COVERAGE_BEFORE%
• Coverage After: $COVERAGE_AFTER%
• Improvement: +$IMPROVEMENT%
• Quality Score: $QUALITY_SCORE/10
• Tests Added: $TESTS_ADDED

*📝 Analysis*
$REASONING

*⚠️ Coverage Gaps*
$COVERAGE_GAPS

*📋 Action Items*
$ACTION_ITEMS
"

# Create simple text message (Google Chat webhooks use simple format)
PAYLOAD=$(jq -n \
  --arg text "$MESSAGE_TEXT" \
  '{text: $text}')

# Send to webhook
echo "📤 Sending notification to Google Chat..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Notification sent successfully!"
    echo "📊 Status: $DEPLOYMENT_STATUS"
    echo "📈 Coverage: $COVERAGE_BEFORE% → $COVERAGE_AFTER% (+$IMPROVEMENT%)"
    echo "⭐ Quality Score: $QUALITY_SCORE/10"
else
    echo "❌ Failed to send notification"
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi
