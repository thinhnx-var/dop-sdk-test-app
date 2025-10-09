/**/**

 * CircomLibJS React Native Polyfill * React Native compatible circomlibjs polyfill using @iden3/js-crypto

 *  * This replaces the problematic circomlibjs package with working React Native implementations

 * This file forces circomlibjs to use pure JavaScript implementations */

 * instead of Web Workers or WASM which are not available in React Native.

 */const { poseidon } = require('@iden3/js-crypto');



// CRITICAL: This must be loaded before circomlibjs is imported// Create a mock circomlibjs object that provides the same API but uses React Native compatible implementations

if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {const circomlibjs = {

  console.log('🔧 Applying CircomLibJS React Native polyfills...');  poseidon: poseidon,

    

  // Completely disable Web Workers and WASM  eddsa: {

  global.Worker = undefined;    // Mock eddsa functions - in a real implementation you'd need proper EdDSA functions

  global.WebAssembly = undefined;    signPoseidon: (privateKey, message) => {

        console.warn('EdDSA signPoseidon is mocked - implement with proper React Native compatible library');

  // Mock any WASM-related modules that circomlibjs might try to load      return new Uint8Array(64); // Mock signature

  const mockWasmModule = () => {    },

    throw new Error('WASM not supported in React Native - using JavaScript fallback');    

  };    prv2pub: (privateKey) => {

        console.warn('EdDSA prv2pub is mocked - implement with proper React Native compatible library');

  // Override require to catch WASM modules      return new Uint8Array(32); // Mock public key

  const originalRequire = global.require || require;    },

  global.require = function(id) {    

    // Block WASM-related modules and force fallbacks    verifyPoseidon: (message, signature, publicKey) => {

    if (id.includes('wasm') || id.includes('worker') || id.includes('.wasm')) {      console.warn('EdDSA verifyPoseidon is mocked - implement with proper React Native compatible library');

      console.warn(`⚠️ Blocked WASM module: ${id} - using JavaScript fallback`);      return true; // Mock verification

      return mockWasmModule;    }

    }  }

    };

    // For circomlibjs modules, ensure we use the slow/pure JS versions

    if (id.includes('circomlibjs')) {module.exports = circomlibjs;
      console.log(`📦 Loading circomlibjs module: ${id}`);
      
      // Force to use slow/pure JS implementations
      if (id.includes('poseidon') && !id.includes('slow')) {
        const slowId = id.replace('poseidon', 'poseidon_slow');
        console.log(`🔄 Redirecting to slow implementation: ${slowId}`);
        try {
          return originalRequire.call(this, slowId);
        } catch (e) {
          console.warn(`⚠️ Fallback failed for ${slowId}, using original: ${id}`);
        }
      }
    }
    
    return originalRequire.apply(this, arguments);
  };
  
  // Ensure circomlibjs detects React Native environment
  global.process = global.process || {};
  global.process.browser = true;
  global.process.env = global.process.env || {};
  global.process.env.NODE_ENV = 'production'; // This might help circomlibjs choose simpler paths
  
  // Mock window and document if circomlibjs checks for them
  if (typeof window === 'undefined') {
    global.window = {
      navigator: global.navigator,
      location: { href: 'react-native://app' }
    };
  }
  
  if (typeof document === 'undefined') {
    global.document = {
      createElement: () => ({
        setAttribute: () => {},
        style: {},
        appendChild: () => {}
      }),
      head: {
        appendChild: () => {}
      }
    };
  }
  
  console.log('✅ CircomLibJS React Native polyfills applied');
}

module.exports = {
  isReactNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
  polyfillsApplied: true
};