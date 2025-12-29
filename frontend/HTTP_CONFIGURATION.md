# HTTP Request Configuration for Production APK

This document explains the configuration changes made to allow HTTP (non-HTTPS) requests in production APK builds.

## Changes Made

### 1. Android Configuration

- **`usesCleartextTraffic: true`** - Set in both `android` section and `expo-build-properties` plugin
- **Network Permissions** - Added `INTERNET` and `ACCESS_NETWORK_STATE` permissions
- **expo-build-properties Plugin** - Installed and configured to ensure HTTP traffic is allowed in production builds

### 2. iOS Configuration

- **`NSAllowsArbitraryLoads: true`** - Already configured in `infoPlist` section
- This allows HTTP requests on iOS devices

## Configuration Files

### app.json

```json
{
  "android": {
    "usesCleartextTraffic": true,
    "permissions": [
      "INTERNET",
      "ACCESS_NETWORK_STATE"
    ]
  },
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": true
      }
    }
  },
  "plugins": [
    [
      "expo-build-properties",
      {
        "android": {
          "usesCleartextTraffic": true
        }
      }
    ]
  ]
}
```

## Important Notes

### ⚠️ Rebuild Required

**You MUST rebuild your APK for these changes to take effect!**

The configuration changes only apply to new builds. Existing APKs will not have these settings.

### Rebuild Commands

```bash
# For production build
eas build --platform android --profile production

# For preview/testing build
eas build --platform android --profile preview
```

### Security Warning

⚠️ **Allowing HTTP traffic reduces security**. This configuration allows unencrypted HTTP requests, which can be intercepted. 

**For production, consider:**
1. Using HTTPS with SSL certificates
2. Using a reverse proxy (nginx) with SSL termination
3. Implementing certificate pinning for sensitive data

### Testing

After rebuilding, test HTTP requests:
1. Install the new APK on a device
2. Ensure the device has internet connectivity
3. Test API calls to your backend (e.g., `http://13.204.143.232:3000/api/customers`)

### Troubleshooting

If HTTP requests still fail after rebuilding:

1. **Verify the build includes the changes:**
   ```bash
   # Check if expo-build-properties is in package.json
   cat package.json | grep expo-build-properties
   ```

2. **Clear build cache:**
   ```bash
   eas build --platform android --clear-cache
   ```

3. **Check AndroidManifest.xml** (after build):
   - The built APK should have `android:usesCleartextTraffic="true"` in AndroidManifest.xml
   - You can check this by extracting the APK and examining the manifest

4. **Verify network permissions:**
   - The APK should request INTERNET permission
   - Check in device settings: Apps > Your App > Permissions

5. **Test with different network types:**
   - WiFi
   - Mobile data
   - Different carriers

## Current API Configuration

Your app is configured to use:
- **API URL**: `http://13.204.143.232:3000/api`
- **Base URL**: Defined in `client.ts`

To change the API URL, update `frontend/client.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_IP:3000/api';
```

## Next Steps

1. ✅ Configuration updated
2. ⏳ **Rebuild APK** (required!)
3. ⏳ Test HTTP requests
4. ⏳ Deploy to users

## References

- [Expo Build Properties Documentation](https://docs.expo.dev/versions/latest/config-plugins/build-properties/)
- [Android Network Security Config](https://developer.android.com/training/articles/security-config)
- [iOS App Transport Security](https://developer.apple.com/documentation/security/preventing_insecure_network_connections)

