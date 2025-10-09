# DOP Wallet SDK Test App

A focused React Native test application for testing **dop-wallet-v6** SDK functionality, spec## Notes

- This is a focused testing app for wallet creation and mnemonic generation
- The app includes comprehensive error handling and logging
- All polyfills and React Native configurations are optimized for DOP SDK
- Activity logs show detailed operation results for debugging

## Troubleshooting

If you encounter issues:
1. Ensure all dependencies are installed: `pnpm install`
2. For iOS, run: `cd ios && pod install && cd ..`
3. Clear Metro cache: `pnpm start --reset-cache`
4. Check that `../new-dop-wallet-v3` exists and is properly built

---

**Focus**: This app is specifically designed to test wallet creation and mnemonic generation from the dop-wallet-v6 SDK package located at `../new-dop-wallet-v3`.lly wallet creation and mnemonic generation capabilities from the `../new-dop-wallet-v3` package.

## Purpose

This app serves as a testing environment to verify that the dop-wallet-v6 SDK works correctly for:
- ✅ **Wallet Creation**: Generate new DOP wallets
- ✅ **Mnemonic Generation**: Create and handle mnemonic phrases
- ✅ **SDK Integration**: Validate React Native compatibility

## Core Features

### � Wallet Functions
- **Create New Wallet**: Generate new wallets with SDK
- **Mnemonic Generation**: Create secure mnemonic phrases
- **Wallet Import**: Import wallets from existing mnemonics
- **Address Generation**: Generate DOP addresses

### 🚀 SDK Integration
- **Engine Initialization**: Proper DOP engine setup for React Native
- **Error Handling**: Comprehensive error catching and feedback
- **Real-time Logging**: Activity logs for all SDK operations

## DOP SDK Functions Demonstrated

The app showcases these key dop-wallet-v6 functions:

```javascript
import { 
  startDopEngineReactNative, 
  ArtifactStore, 
  createOrImportDopWallet,
  validateDopAddress,
  getWalletTransactionHistory,
  getEngine,
  ProvedTransaction
} from 'dop-wallet-v6';
```

### Key Integration Points
1. **Engine Setup**: Proper configuration with ArtifactStore for React Native
2. **Wallet Creation**: Both new wallet generation and mnemonic import
3. **Address Validation**: Real-time DOP address validation
4. **Error Handling**: Comprehensive error catching and user feedback
5. **State Management**: React state integration with SDK operations


# Getting Started

## Project Structure

```
DopSdkTestApp/
├── App.tsx                 # Main React Native app with DOP SDK integration
├── index.js               # Entry point with polyfills and SDK setup
├── package.json           # Dependencies including dop-wallet-v6
├── android/               # Android build configuration
├── ios/                   # iOS build configuration
└── __tests__/             # Test files
```

## Quick Start

### Prerequisites
- Node.js 20+
- React Native development environment setup
- pnpm package manager

### Installation & Setup

1. **Install dependencies**:
   ```sh
   pnpm install
   ```

2. **iOS Setup** (if testing on iOS):
   ```sh
   cd ios && pod install && cd ..
   ```

3. **Start Metro bundler**:
   ```sh
   pnpm start
   ```

4. **Run the app**:
   ```sh
   # Android
   pnpm run android
   
   # iOS  
   pnpm run ios
   ```

## Testing DOP Wallet Functions

The app provides a user interface to test:

1. **Initialize DOP Engine** - Sets up the SDK environment
2. **Create New Wallet** - Generates a new wallet with mnemonic
3. **Import Wallet** - Import existing wallet from mnemonic phrase
4. **View Wallet Details** - Display wallet address and information

## SDK Integration Details

```javascript
// Key imports from dop-wallet-v6
import { 
  startDopEngineReactNative,
  createOrImportDopWallet,
  // ... other SDK functions
} from 'dop-wallet-v6';
```

The SDK is imported from `../new-dop-wallet-v3` as specified in package.json:
```json
"dop-wallet-v6": "file:../new-dop-wallet-v3"
```

1. **Initialize Engine**: Tap "Initialize DOP Engine" to start the SDK
2. **Create/Import Wallet**: Either create a new wallet or import using a mnemonic
3. **Test Features**: Try various wallet operations like balance checking and transactions
4. **Monitor Logs**: Check the activity logs for detailed operation results
5. **Validate Addresses**: Test the address validation functionality

### Key Files

- `App.tsx`: Main app component with all DOP SDK integrations
- `metro.config.js`: Metro configuration for proper bundling
- `dop-shims.js`: Polyfills for DOP SDK compatibility
- `package.json`: Dependencies including dop-wallet-v6

### Notes

- Some functions like balance checking and transaction history use demo data
- The app demonstrates proper error handling and user feedback patterns
- All SDK operations are logged for debugging purposes
- The interface adapts to dark/light mode automatically

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
