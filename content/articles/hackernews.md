# Show HN: I built a free alternative to Expo's $99/month EAS Build service

I've been building React Native apps for a few years, and one recurring pain point has been build costs. Expo's EAS Build is excellent — but the pricing tiers ($99/month for Production, $299/month for Priority) add up quickly, especially for indie developers and small teams.

So I built an open-source tool that generates GitHub Actions workflows to replace EAS Build entirely. You get unlimited builds for free, running on GitHub's infrastructure.

**How it works:**

1. Visit the [interactive generator](https://expobuilder.vercel.app) or use the CLI
2. Configure your build preferences (APK, AAB, storage destination)
3. Copy the generated workflow YAML into your repo
4. Push code — builds run automatically

The generated workflows use Expo's own EAS CLI with the `--local` flag, so you get the same build system running on GitHub Actions runners instead of Expo's servers. No vendor lock-in, no build limits.

**What you get:**

- Development APKs, production APKs, and AABs (Google Play bundles)
- TypeScript, ESLint, and Prettier checks baked in
- Upload to GitHub Releases, Google Drive, Zoho Drive, or any rclone-compatible storage
- Support for yarn, npm, and pnpm
- Typical build times: ~8-10 minutes for APK/AAB

**Cost comparison:**

| | EAS Build | This tool |
|---|---|---|
| Free tier | 30 builds/month | Unlimited |
| Production | $99/month ($1,188/yr) | $0 |
| Priority | $299/month ($3,588/yr) | $0 |

**Trade-offs to be transparent about:**

- No iOS builds (GitHub Actions Linux runners can't build iOS — you'd need macOS runners, which aren't free)
- EAS Build has better caching and faster cold starts
- No OTA updates (that's EAS Update, a separate service)
- You're responsible for your own build infrastructure debugging

The project is fully open source (MIT), has 636 stars, and is available on the GitHub Marketplace.

**Demo video** (full setup in under 5 minutes): https://github.com/user-attachments/assets/bd1dd6dc-04b6-4b22-91c3-13721b2220e0

- GitHub: https://github.com/TanayK07/expo-react-native-cicd
- Generator: https://expobuilder.vercel.app

I'd love feedback from anyone who's dealt with similar build cost issues. What would make this more useful for your workflow?
