/**
 * Metro configuration for React Native projects using dop-wallet-v6
 * Simplified configuration for real SDK implementation
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    alias: {
      // Core Node.js modules for React Native compatibility
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer'),
      'events': require.resolve('events'),
      'util': require.resolve('util'),
      'assert': require.resolve('assert'),
      'process': require.resolve('process/browser'),
      'path': require.resolve('path-browserify'),
      'url': require.resolve('url'),
      'querystring': require.resolve('querystring-es3'),
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'zlib': require.resolve('browserify-zlib'),
      
      // Disable modules that don't work in React Native
      'fs': false,
      'os': false,
      'leveldown': require.resolve('memdown'),
    },
    
    extraNodeModules: {
      'crypto': require.resolve('crypto-browserify'),
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer'),
      'events': require.resolve('events'),
      'util': require.resolve('util'),
      'assert': require.resolve('assert'),
      'process': require.resolve('process/browser'),
      'path': require.resolve('path-browserify'),
      'url': require.resolve('url'),
      'querystring': require.resolve('querystring-es3'),
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'zlib': require.resolve('browserify-zlib'),
      'leveldown': require.resolve('memdown'),
    },

    // Platforms - ensure React Native takes precedence
    platforms: ['native', 'react-native', 'android', 'ios', 'web'],

    // Asset extensions
    assetExts: [...defaultConfig.resolver.assetExts],

    // Source extensions
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs', 'mjs'],
    
    // Enable modern package exports resolution
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['browser', 'require', 'react-native'],
    
    // Resolver options
    resolverMainFields: ['react-native', 'browser', 'main'],
    
    // Enable symlink resolution for local SDK development
    symlinks: true,
  },
  
  // Watch the SDK directory if it's linked locally
  watchFolders: [__dirname, '../new-dop-wallet-v3'],
  
  transformer: {
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
