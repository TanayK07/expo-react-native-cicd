# Why I Built a Free Alternative to Expo's EAS Build — And How It Saves Developers $1,188/Year

## The $99/month problem nobody talks about

I love Expo. It's the best framework for building React Native apps. But there's an elephant in the room: **build costs**.

When your app grows beyond hobby-project stage, you hit the free tier limit of 30 builds per month. A team of three developers doing two builds a day burns through that in a week. The next tier? $99/month. Need priority builds? $299/month.

For a startup trying to stay lean, or an indie developer building their side project, that's a hard pill to swallow — especially when you're paying for something that should be a commodity: running a build command on a server.

## The insight: EAS CLI already supports local builds

Here's what changed everything for me. Buried in Expo's documentation is a flag that most developers overlook:

```bash
eas build --platform android --local
```

That `--local` flag means the entire EAS build system can run on *any* machine. Not just Expo's servers. Any machine with Node.js, Java, and the Android SDK.

And you know what has all three of those? **GitHub Actions runners.**

GitHub gives you 2,000 minutes per month for free on private repos. Public repos? Unlimited. That's unlimited builds, forever, at zero cost.

## From insight to tool

The problem was that setting up the GitHub Actions workflow was painful. You need to:

- Configure the runner with the right Node.js and Java versions
- Set up Android SDK and build tools
- Handle dependency caching for fast builds
- Manage Expo authentication
- Upload build artifacts somewhere useful
- Add quality checks (linting, type checking, formatting)
- Handle different build types (debug APK, release APK, AAB)

That's 200+ lines of YAML, and one wrong indent breaks everything.

So I built a generator that does it all through a web interface. Point, click, copy, paste. Five minutes to set up, then forget about it.

## See it in action

Here's the full setup in under 5 minutes:

https://github.com/user-attachments/assets/bd1dd6dc-04b6-4b22-91c3-13721b2220e0

## How it works

The [Interactive Workflow Generator](https://expobuilder.vercel.app) walks you through the configuration:

1. **Choose your build types**: Development APK for testing, Production APK for distribution, AAB for Google Play
2. **Pick your storage**: GitHub Releases, Google Drive, Zoho Drive, or any of 40+ cloud providers via rclone
3. **Add quality checks**: TypeScript, ESLint, Prettier — all optional
4. **Select your package manager**: yarn, npm, or pnpm
5. **Copy the YAML**: Paste it into `.github/workflows/` and you're done

The generated workflow handles everything automatically on every push:

```
✅ TypeScript Check    — 2m 15s
✅ ESLint              — 1m 32s
✅ Prettier Check      — 0m 45s
✅ Development APK     — 8m 20s
✅ Production APK      — 9m 15s
✅ Production AAB      — 10m 05s
📤 Uploaded to storage
```

Total pipeline time: about 15-20 minutes. And it runs while you're writing code, not blocking your workflow.

## The numbers

Let's talk real savings:

| Scenario | EAS Build | This tool | You save |
|---|---|---|---|
| Solo developer | $99/month | $0 | **$1,188/year** |
| Small team (needs priority) | $299/month | $0 | **$3,588/year** |
| Agency with 5 projects | $495-1,495/month | $0 | **$5,940-17,940/year** |

For context, $1,188/year is roughly the cost of a JetBrains All Products subscription, or 6 months of a ChatGPT Plus subscription, or a year of GitHub Copilot. It's real money.

## What this doesn't replace

I want to be upfront about the trade-offs:

**This tool handles Android builds.** iOS builds require macOS runners, which GitHub charges for ($0.08/min). It's still cheaper than EAS Build, but it's not free.

**EAS Build is still better if:**
- You need OTA updates (that's EAS Update, a different service)
- You want zero DevOps responsibility
- You need Expo's build caching optimizations for very large projects

**This tool is better if:**
- You want unlimited Android builds for free
- You want full control over your CI/CD pipeline
- You're cost-conscious and willing to spend 10 minutes on setup
- You need custom storage destinations

## Open source, MIT licensed

The entire project is open source. You can inspect every line of generated YAML, fork it, modify it, and use it however you want.

It's been adopted by 636+ developers so far, and is available both as a [web app](https://expobuilder.vercel.app) and on the [GitHub Marketplace](https://github.com/marketplace/actions/react-native-expo-ci-cd-builder).

If you're tired of paying for builds, give it a try: [github.com/TanayK07/expo-react-native-cicd](https://github.com/TanayK07/expo-react-native-cicd)

---

*I'm Tanay Kedia, and I build tools for mobile developers. If this saved you money, consider [starring the repo](https://github.com/TanayK07/expo-react-native-cicd) or [buying me a coffee](https://buymeacoffee.com/Tanayk07).*
