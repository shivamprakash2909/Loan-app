# Guide to Build APK from Expo App

This guide will walk you through creating an APK file from your Expo app.

## Prerequisites

1. **Expo Account**: You need a free Expo account. If you don't have one, create it at [expo.dev](https://expo.dev)

2. **EAS CLI**: Install the Expo Application Services (EAS) CLI globally

## Step-by-Step Instructions

### Step 1: Install EAS CLI

Open your terminal and run:

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

Navigate to your frontend directory and login:

```bash
cd frontend
eas login
```

Follow the prompts to login with your Expo account credentials.

### Step 3: Configure Build Profile (Optional)

The `eas.json` file has been created with three build profiles:

- **development**: For development builds with dev client
- **preview**: For internal testing (APK format)
- **production**: For production releases (APK format)

You can modify these in `eas.json` if needed.

### Step 4: Build the APK

For a preview/internal testing APK, run:

```bash
eas build --platform android --profile preview
```

For a production APK, run:

```bash
eas build --platform android --profile production
```

### Step 5: Monitor the Build

After starting the build:

1. The build will be queued on Expo's servers
2. You'll get a URL to monitor the build progress
3. The build typically takes 10-20 minutes
4. Once complete, you'll get a download link for the APK

### Step 6: Download the APK

- You can download the APK from the Expo dashboard
- Or use the command: `eas build:list` to see all your builds
- Or download directly: `eas build:download`

## Alternative: Build APK Locally

If you want to build locally (requires Android SDK setup):

```bash
eas build --platform android --profile preview --local
```

**Note**: Local builds require:

- Android SDK installed
- Java Development Kit (JDK)
- More setup time but faster builds

## Important Notes

1. **First Build**: The first build may take longer as Expo sets up the build environment
2. **Free Tier**: Expo's free tier includes a limited number of builds per month
3. **APK vs AAB**: APK is for direct installation. For Google Play Store, use AAB format by changing `buildType` to `"aab"` in `eas.json`
4. **Signing**: Expo handles code signing automatically for you

## Troubleshooting

- If you get authentication errors, make sure you're logged in: `eas whoami`
- If build fails, check the build logs in the Expo dashboard
- Ensure your `app.json` has all required Android configuration (already configured)

## Quick Commands Reference

```bash
# Login to Expo
eas login

# Check login status
eas whoami

# Build APK (preview)
eas build --platform android --profile preview

# Build APK (production)
eas build --platform android --profile production

# List all builds
eas build:list

# Download latest build
eas build:download
```

## Next Steps

After getting your APK:

1. Test it on Android devices
2. Share it with testers
3. For production, consider building an AAB file for Google Play Store

---

Happy building! 🚀
