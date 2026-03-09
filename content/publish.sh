#!/usr/bin/env bash
# Publish articles to Dev.to and Medium
# Usage:
#   ./publish.sh devto          # Publish to Dev.to (draft)
#   ./publish.sh medium         # Publish to Medium (draft)
#   ./publish.sh all            # Publish to both
#
# Required environment variables:
#   DEVTO_API_KEY   - Get from https://dev.to/settings/extensions → "DEV Community API Keys"
#   MEDIUM_TOKEN    - Get from https://medium.com/me/settings/security → "Integration tokens"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ARTICLES_DIR="$SCRIPT_DIR/articles"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

publish_devto() {
    [ -z "${DEVTO_API_KEY:-}" ] && error "DEVTO_API_KEY is not set. Get one at https://dev.to/settings/extensions"

    info "Publishing to Dev.to (as draft)..."

    local article_file="$ARTICLES_DIR/devto.md"
    [ ! -f "$article_file" ] && error "Article not found: $article_file"

    # Extract front matter and body
    local title description tags body

    title=$(sed -n 's/^title: "\(.*\)"/\1/p' "$article_file")
    description=$(sed -n 's/^description: "\(.*\)"/\1/p' "$article_file")
    tags=$(sed -n 's/^tags: \(.*\)/\1/p' "$article_file")

    # Extract body (everything after second ---)
    body=$(awk '/^---$/{n++; next} n>=2' "$article_file")

    # Build JSON payload using jq
    local payload
    payload=$(jq -n \
        --arg title "$title" \
        --arg body "$body" \
        --arg description "$description" \
        --arg tags "$tags" \
        '{
            article: {
                title: $title,
                body_markdown: $body,
                published: false,
                description: $description,
                tags: ($tags | split(", ") | map(gsub(" "; ""))),
                canonical_url: "https://github.com/TanayK07/expo-react-native-cicd"
            }
        }')

    local response
    response=$(curl -s -w "\n%{http_code}" -X POST "https://dev.to/api/articles" \
        -H "Content-Type: application/json" \
        -H "api-key: $DEVTO_API_KEY" \
        -d "$payload")

    local http_code body_response
    http_code=$(echo "$response" | tail -1)
    body_response=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 201 ]; then
        local url
        url=$(echo "$body_response" | jq -r '.url')
        info "Published to Dev.to (draft): $url"
        info "Edit and publish at: https://dev.to/dashboard"
    else
        error "Dev.to publish failed (HTTP $http_code): $body_response"
    fi
}

publish_medium() {
    [ -z "${MEDIUM_TOKEN:-}" ] && error "MEDIUM_TOKEN is not set. Get one at https://medium.com/me/settings/security"

    info "Publishing to Medium (as draft)..."

    local article_file="$ARTICLES_DIR/medium.md"
    [ ! -f "$article_file" ] && error "Article not found: $article_file"

    # Get Medium user ID
    local user_response user_id
    user_response=$(curl -s -H "Authorization: Bearer $MEDIUM_TOKEN" "https://api.medium.com/v1/me")
    user_id=$(echo "$user_response" | jq -r '.data.id')

    [ "$user_id" = "null" ] || [ -z "$user_id" ] && error "Failed to get Medium user ID. Check your token."

    # Extract title (first H1)
    local title
    title=$(grep -m1 '^# ' "$article_file" | sed 's/^# //')

    # Read full body
    local body
    body=$(cat "$article_file")

    local payload
    payload=$(jq -n \
        --arg title "$title" \
        --arg content "$body" \
        '{
            title: $title,
            contentFormat: "markdown",
            content: $content,
            publishStatus: "draft",
            tags: ["react-native", "expo", "cicd", "opensource", "github-actions"]
        }')

    local response
    response=$(curl -s -w "\n%{http_code}" -X POST "https://api.medium.com/v1/users/$user_id/posts" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $MEDIUM_TOKEN" \
        -d "$payload")

    local http_code body_response
    http_code=$(echo "$response" | tail -1)
    body_response=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 201 ]; then
        local url
        url=$(echo "$body_response" | jq -r '.data.url')
        info "Published to Medium (draft): $url"
    else
        error "Medium publish failed (HTTP $http_code): $body_response"
    fi
}

# Main
case "${1:-}" in
    devto)
        publish_devto
        ;;
    medium)
        publish_medium
        ;;
    all)
        publish_devto
        echo ""
        publish_medium
        ;;
    *)
        echo "Usage: $0 {devto|medium|all}"
        echo ""
        echo "Publishes articles as drafts. Review and publish manually."
        echo ""
        echo "Required env vars:"
        echo "  DEVTO_API_KEY   - https://dev.to/settings/extensions"
        echo "  MEDIUM_TOKEN    - https://medium.com/me/settings/security"
        echo ""
        echo "Note: Hacker News has no API for submissions."
        echo "      Copy content/articles/hackernews.md and post manually at https://news.ycombinator.com/submit"
        exit 1
        ;;
esac
