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

# Simple JSON extraction function (no jq required)
get_json_value() {
    local json_file="$1"
    local key_path="$2"
    local default="$3"

    # Use grep and sed for simple extraction
    local value=$(grep -o "\"$key_path\"[[:space:]]*:[[:space:]]*[^,}]*" "$json_file" | sed 's/.*:[[:space:]]*//' | sed 's/"//g' | head -1)

    if [ -z "$value" ]; then
        echo "$default"
    else
        echo "$value"
    fi
}

# Parse JSON report using simple grep/sed
DEPLOYMENT_STATUS=$(grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "$REPORT_FILE" | head -1 | sed 's/.*"status"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
COVERAGE_BEFORE=$(grep -o '"before_percentage"[[:space:]]*:[[:space:]]*[0-9.]*' "$REPORT_FILE" | sed 's/.*:[[:space:]]*//')
COVERAGE_AFTER=$(grep -o '"after_percentage"[[:space:]]*:[[:space:]]*[0-9.]*' "$REPORT_FILE" | sed 's/.*:[[:space:]]*//')
IMPROVEMENT=$(grep -o '"improvement"[[:space:]]*:[[:space:]]*[0-9.]*' "$REPORT_FILE" | sed 's/.*:[[:space:]]*//')
QUALITY_SCORE=$(grep -o '"quality_score"[[:space:]]*:[[:space:]]*[0-9.]*' "$REPORT_FILE" | sed 's/.*:[[:space:]]*//')
TESTS_ADDED=$(grep -o '"total_tests_added"[[:space:]]*:[[:space:]]*[0-9]*' "$REPORT_FILE" | sed 's/.*:[[:space:]]*//')
RISK_LEVEL=$(grep -o '"risk_level"[[:space:]]*:[[:space:]]*"[^"]*"' "$REPORT_FILE" | sed 's/.*"risk_level"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
REASONING=$(grep -o '"reasoning"[[:space:]]*:[[:space:]]*"[^"]*"' "$REPORT_FILE" | sed 's/.*"reasoning"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Set defaults if empty
DEPLOYMENT_STATUS=${DEPLOYMENT_STATUS:-UNKNOWN}
COVERAGE_BEFORE=${COVERAGE_BEFORE:-0}
COVERAGE_AFTER=${COVERAGE_AFTER:-0}
IMPROVEMENT=${IMPROVEMENT:-0}
QUALITY_SCORE=${QUALITY_SCORE:-0}
TESTS_ADDED=${TESTS_ADDED:-0}
RISK_LEVEL=${RISK_LEVEL:-unknown}
REASONING=${REASONING:-No reasoning provided}

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

# Escape quotes in message for JSON
MESSAGE_ESCAPED=$(echo "$MESSAGE_TEXT" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# Create simple JSON payload without jq
PAYLOAD="{\"text\":\"$MESSAGE_ESCAPED\"}"

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
