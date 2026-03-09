# Content & Articles

Marketing articles for the growth campaign. Each article is tailored to its platform.

## Articles

| File | Platform | Style | How to publish |
|------|----------|-------|----------------|
| `articles/hackernews.md` | Hacker News | Technical "Show HN" | Manual — [submit here](https://news.ycombinator.com/submit) |
| `articles/devto.md` | Dev.to | Step-by-step tutorial | `./publish.sh devto` |
| `articles/medium.md` | Medium | Narrative/story | `./publish.sh medium` |

## Automated Publishing

```bash
# Set API keys
export DEVTO_API_KEY="your-key"    # https://dev.to/settings/extensions
export MEDIUM_TOKEN="your-token"   # https://medium.com/me/settings/security

# Publish as drafts (review before making public)
./publish.sh devto     # Dev.to only
./publish.sh medium    # Medium only
./publish.sh all       # Both
```

All articles are published as **drafts** so you can review and edit before going live.

## Hacker News Tips

- Post **Monday-Wednesday, 8-10 AM EST** for best visibility
- Use the title: "Show HN: Free alternative to Expo's $99/month EAS Build"
- Post the text from `hackernews.md`, not a link drop
- Be ready to answer technical questions in comments
