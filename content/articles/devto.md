---
title: "How to Set Up Free CI/CD for React Native & Expo in 10 Minutes"
published: false
description: "Replace $99/month EAS Build with free GitHub Actions workflows. Step-by-step guide with an interactive generator."
tags: reactnative, expo, cicd, opensource
canonical_url: https://github.com/TanayK07/expo-react-native-cicd
cover_image: ""
---

## The Problem: Build Costs Add Up Fast

If you're building React Native apps with Expo, you've probably hit this wall:

- **Free tier**: 30 builds/month (runs out fast with a team)
- **Production plan**: $99/month
- **Priority plan**: $299/month

That's up to **$3,588/year** just to build your app. For indie developers and startups, that's a significant chunk of budget going to CI/CD instead of product development.

## The Solution: GitHub Actions + EAS CLI Local Builds

Here's what most people don't realize: **Expo's EAS CLI supports local builds** with the `--local` flag. This means you can run the exact same build system on any machine — including GitHub Actions runners, which are free for public repos and generous for private ones.

I built a tool that generates these GitHub Actions workflows for you, with a point-and-click interface. No YAML wrangling required.

{% embed https://github.com/user-attachments/assets/bd1dd6dc-04b6-4b22-91c3-13721b2220e0 %}

## Step-by-Step Setup (10 Minutes)

### Step 1: Generate Your Workflow

Visit the [Interactive Workflow Generator](https://expobuilder.vercel.app) and configure:

- **Build types**: Development APK, Production APK, Production AAB (Google Play)
- **Storage**: GitHub Releases, Google Drive, Zoho Drive, or custom rclone
- **Quality checks**: TypeScript, ESLint, Prettier
- **Package manager**: yarn, npm, or pnpm
- **Triggers**: Push, PR, manual dispatch

### Step 2: Add the Workflow to Your Repo

Copy the generated YAML and save it as:

```
.github/workflows/react-native-cicd.yml
```

### Step 3: Add Your Expo Token

1. Go to [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens)
2. Create a new token
3. In your GitHub repo: **Settings → Secrets → Actions → New secret**
4. Name: `EXPO_TOKEN`, Value: your token

### Step 4: Push and Build

```bash
git add .github/workflows/react-native-cicd.yml
git commit -m "Add CI/CD pipeline"
git push
```

That's it. Your next push triggers automatic builds.

## What the Generated Pipeline Does

Here's the full pipeline that runs on every push:

```
✅ TypeScript Check    — 2m 15s
✅ ESLint              — 1m 32s
✅ Prettier Check      — 0m 45s
✅ Development APK     — 8m 20s
✅ Production APK      — 9m 15s
✅ Production AAB      — 10m 05s
📤 Uploaded to your chosen storage
```

The entire pipeline completes in about **15-20 minutes**, and you get:

- A debug APK for testing
- A release APK for sideloading
- An AAB for Google Play Store submission

## Cost Comparison

| | EAS Build | GitHub Actions (This Tool) | Bitrise | CircleCI |
|---|---|---|---|---|
| **Cost** | $99-299/month | **Free** | $36-110/month | $30-200/month |
| **Build minutes** | Limited by plan | **Unlimited*** | Limited | Limited |
| **Setup time** | 10 min | **5 min** | 30 min | 45 min |
| **Customization** | Limited | **Full control** | Medium | High |

*Free for public repos. Private repos get 2,000 minutes/month free.

## Storage Options Explained

### GitHub Releases (Recommended for open source)
Your APKs and AABs are attached to GitHub releases with automatic version tagging. Users can download directly from your releases page.

### Google Drive
Builds are uploaded to a shared Google Drive folder. Great for team distribution.

### Zoho Drive
Enterprise cloud storage integration with organized folder structure.

### Custom rclone
Support for 40+ cloud storage providers through rclone (S3, Dropbox, OneDrive, etc.).

## Trade-offs to Consider

**This tool is great for:**
- Android builds (APK and AAB)
- Teams that want full control over their CI/CD
- Indie developers watching their budget
- Open source projects

**EAS Build is still better for:**
- iOS builds (requires macOS runners)
- OTA updates (that's EAS Update, separate from builds)
- Teams that want zero infrastructure management
- Very large projects that benefit from EAS's optimized caching

## Advanced: The Generated YAML Explained

Here's what a typical generated workflow looks like under the hood:

```yaml
name: React Native CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - run: yarn install --frozen-lockfile
      - run: npx expo prebuild --platform android
      - run: cd android && ./gradlew assembleRelease
      # ... upload steps based on your storage choice
```

The generator handles all the complexity — caching, artifact naming, storage authentication, error handling — so you don't have to.

## Get Started

- **Generator**: [expobuilder.vercel.app](https://expobuilder.vercel.app)
- **GitHub**: [github.com/TanayK07/expo-react-native-cicd](https://github.com/TanayK07/expo-react-native-cicd)
- **GitHub Marketplace**: [React Native Expo CI/CD Builder](https://github.com/marketplace/actions/react-native-expo-ci-cd-builder)

The project is MIT licensed and open to contributions. If it saves you money, consider [giving it a star](https://github.com/TanayK07/expo-react-native-cicd) ⭐

---

*Have questions? Open a [GitHub Discussion](https://github.com/TanayK07/expo-react-native-cicd/discussions) or drop a comment below.*
