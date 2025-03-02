# 🚀 React Native & Expo CI/CD Pipeline

[![GitHub stars](https://img.shields.io/github/stars/yourusername/react-native-expo-cicd.svg?style=social&label=Star&maxAge=2592000)](https://github.com/yourusername/react-native-expo-cicd/stargazers/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/yourusername/react-native-expo-cicd/workflows/React%20Native%20CI/CD/badge.svg)](https://github.com/yourusername/react-native-expo-cicd/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yourusername/react-native-expo-cicd/pulls)

A powerful, automated CI/CD workflow for React Native and Expo applications. Build, test, and deploy your mobile apps with ease using GitHub Actions.

## ✨ Features

- 🧪 **Automated Testing**: TypeScript checks, ESLint, and Prettier validation
- 📱 **Multiple Build Types**: Development, Production APK, and Production AAB
- 🔄 **Flexible Triggers**: Manual workflow dispatch, push to main branch, or pull requests
- ☁️ **Cloud Storage Integration**: Automatic upload to your preferred cloud storage (Zoho Drive, Google Drive, etc.)
- 📦 **Artifact Management**: GitHub-hosted build artifacts for easy access
- 🛠️ **Optimized Configuration**: Properly configured Metro bundler and EAS CLI

## 📋 Prerequisites

- React Native / Expo project
- GitHub repository
- [Expo account](https://expo.dev/) (for EAS builds)
- Cloud storage account (Zoho Drive, Google Drive, Dropbox, etc.) for build distribution

## ⚙️ Setup Instructions

### 1. Add this workflow to your project

Copy the `.github/workflows/react-native-cicd.yml` file to your project.

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

- `EXPO_TOKEN`: Your Expo access token
- `CLOUD_STORAGE_TYPE`: Your cloud storage provider (e.g., "zoho", "drive", "dropbox")
- `CLOUD_STORAGE_TOKEN`: Authentication token for your cloud storage
- `CLOUD_STORAGE_ROOT_ID`: Root folder ID for your cloud storage

### 3. Customize the workflow (Optional)

Modify the workflow to match your project's requirements:

- Adjust build profiles in your `eas.json`
- Customize build output filenames
- Change test commands based on your project's setup

## 🔧 Usage

### Automatic Builds

Pushes to the `main` branch will automatically trigger the workflow.

### Manual Builds

1. Go to your repository on GitHub
2. Navigate to "Actions" tab
3. Select "React Native CI/CD" workflow
4. Click "Run workflow"
5. Choose the build type: all, dev, prod-apk, or prod-aab
6. Click "Run workflow" button

## 📂 Example Project Structure

```plaintext
my-expo-app/
├── .github/
│   └── workflows/
│       └── react-native-cicd.yml
├── assets/
├── src/
├── app.json
├── eas.json
├── babel.config.js
├── metro.config.js
└── package.json
```

## 🧰 EAS Configuration

Example `eas.json` file:

```json
{
  "cli": {
    "version": ">= 12.5.3",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production-apk": {
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Rclone Documentation](https://rclone.org/docs/)

## 📝 License

This project is [MIT](LICENSE) licensed.

---

Made with ❤️ by [Your Name](https://github.com/yourusername)

⭐️ If you found this project helpful, please star it on GitHub! ⭐️
