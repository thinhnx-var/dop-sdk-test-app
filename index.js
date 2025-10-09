/**
 * @format
 * DOP SDK Test App Entry Point
 * Real SDK implementation - no mocks
 */

// ===================================================================
// CRITICAL: These imports MUST come FIRST, before any other imports
// ===================================================================
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

// Make Buffer and other globals available
global.Buffer = global.Buffer || Buffer;
global.process = global.process || require('process/browser');
global.process.browser = true;
global.process.nextTick = setImmediate;

// Additional polyfills for DOP SDK compatibility
global.setImmediate = global.setImmediate || setTimeout;
global.clearImmediate = global.clearImmediate || clearTimeout;

// ===================================================================
// REACT NATIVE ENVIRONMENT SETUP
// ===================================================================

console.log('🔧 Setting up React Native environment for DOP SDK...');

// Ensure React Native detection
if (typeof navigator === 'undefined') {
  global.navigator = { product: 'ReactNative' };
} else if (!navigator.product) {
  navigator.product = 'ReactNative';
}

// Set up process environment
global.process = global.process || {};
global.process.browser = true;
global.process.env = global.process.env || {};
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production';

// Basic crypto polyfills
const cryptoBrowserify = require('crypto-browserify');
global.crypto = global.crypto || {};

console.log('✅ React Native environment setup complete');

// ===================================================================
// DOP SDK REACT NATIVE INTEGRATION
// ===================================================================

try {
  // Apply DOP SDK React Native shims
  require('dop-wallet-v6/react-native-shims');
  console.log('✅ DOP SDK React Native shims loaded successfully');
} catch (error) {
  console.warn('⚠️ Could not load DOP SDK React Native shims:', error.message);
}

// ===================================================================
// APP REGISTRATION
// ===================================================================
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

console.log('📱 Registering DOP SDK Test app:', appName);
AppRegistry.registerComponent(appName, () => App);
console.log('✅ DOP SDK Test App registered successfully');
