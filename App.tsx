import React, { useState } from 'react';
import { SafeAreaView, Text, View, ScrollView } from 'react-native';
import { Spacer } from './Spacer';
import { Button } from './Button';
import {
  startDopEngineReactNative,
  getEngine,
  getRandomBytes,
  createOrImportDopWallet,
  testCircomlibjs,
  getPublicViewingKey,
  loadWalletByID,
  getWalletShareableViewingKey,
  createViewOnlyDopWallet,
  getWalletMnemonic,
  pbkdf2,
  setOnUTXOMerkletreeScanCallback,
  setOnTXIDMerkletreeScanCallback,
  resetFullTXIDMerkletreesV2,
  refreshBalances,
  rescanFullUTXOMerkletreesAndWallets,
} from 'dop-wallet-v6';
import { NetworkName } from './const';

import {
  createArtifactStore,
  ReactNativeArtifactStore,
} from './utils/createArtifactStore';
import { getPublicKey, utils } from '@noble/ed25519';
import * as ed from '@noble/ed25519';

const DERIVATION_PATH_PREFIXES = {
  SPENDING: "m/44'/1984'/0'/0'/",
  VIEWING: "m/420'/1984'/0'/0'/",
};
/**
 * Helper to append DERIVATION_PATH_PREFIXES with index'
 */
const derivePathsForIndex = (index = 0) => {
  return {
    spending: `${DERIVATION_PATH_PREFIXES.SPENDING}${index}'`,
    viewing: `${DERIVATION_PATH_PREFIXES.VIEWING}${index}'`,
  };
};

async function testNodeDerivation() {
  console.log('Testing wallet node derivation...');

  try {
    const privateKey = new Uint8Array([
      116, 155, 232, 38, 24, 222, 242, 243, 143, 196, 220, 250, 151, 96, 61,
      103, 199, 69, 229, 147, 233, 136, 142, 124, 201, 79, 215, 25, 61, 64, 181,
      76,
    ]);

    const publicViewingKey = await getPublicViewingKey(privateKey);
    console.log({ publicViewingKey });
  } catch (error) {
    console.error(error);
  }
}

type Props = {};

const App = (props: Props) => {
  // State for wallet management testing
  const [currentWallet, setCurrentWallet] = useState<any>(null);
  const [walletMnemonic, setWalletMnemonic] = useState<string>('');
  const [shareableViewingKey, setShareableViewingKey] = useState<string>('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string>('');
  
  // State for encryption key management testing
  const [testPassword, setTestPassword] = useState<string>('test-password-123');
  const [hashedPassword, setHashedPassword] = useState<string>('');
  const [encryptionKeyFromPassword, setEncryptionKeyFromPassword] = useState<string>('');
  const [randomBytesResult, setRandomBytesResult] = useState<string>('');
  
  // State for balance management testing
  const [scanProgress, setScanProgress] = useState<string>('');
  const [balanceRefreshResult, setBalanceRefreshResult] = useState<string>('');
  const [merkletreeResetResult, setMerkletreeResetResult] = useState<string>('');
  // const artifactStore = createArtifactStore();

  // 2.2 Initialize DOP Engine
  const initializeDopEngine = async () => {
    try {
      console.log('Starting DOP Engine initialization...');

      const walletSource = 'myapp'; // Your app identifier (max 16 chars)
      const shouldDebug = __DEV__;
      const artifactStore = new ReactNativeArtifactStore();
      const useNativeArtifacts = true; // TRUE for mobile performance
      const skipMerkletreeScans = false;
      const verboseScanLogging = __DEV__;
      const databaseName = 'dop-wallet-db';

      // 1. Creates ReactNativeLevelDB with memdown + AsyncStorage
      // 2. Loads persisted data from AsyncStorage
      // 3. Opens the database connection
      // 4. Initializes DOP Engine with the database
      await startDopEngineReactNative(
        walletSource,
        shouldDebug,
        artifactStore,
        useNativeArtifacts,
        skipMerkletreeScans,
        verboseScanLogging,
        databaseName,
      );

      console.log('Initialized Done');
      return true;
    } catch (error) {
      console.error('Initialized error:', error);
      throw error;
    }
  };

  const handleStartEngine = async () => {
    console.log('Start engine');

    // await startDopEngineReactNative(
    //   'dop', // walletSource (max 16 chars)  // Wallet state - simplified
    //   true, // shouldDebug  const [wallet, setWallet] = useState<WalletInfo | null>(null);
    //   artifactStore, // artifactStore  const [mnemonic, setMnemonic] = useState<string>('');
    //   true, // useNativeArtifacts (TRUE for React Native)  const [encryptionKey, setEncryptionKey] = useState<string>('');
    //   false, // skipMerkletreeScans
    //   true, // verboseScanLogging  // Generate a proper 32-byte encryption key on app start
    //   'DopTestAppDB', // databaseName  useEffect(() => {
    // );
    const status = await testCircomlibjs();
    console.log('Circomlibjs status', status);
    initializeDopEngine();
  };

  const checkEngineWork = () => {
    const engine = getEngine();
    if (engine) {
      console.log('Engine works', engine);
    } else {
      console.log('Engine does not work');
    }
  };

  const handleCreateWallet = async () => {
    const encryptionKey = getRandomBytes(32);

    console.log({ encryptionKey });

    const { walletInfo, mnemonic: generatedMnemonic } =
      await createOrImportDopWallet(encryptionKey, {
        // creationBlockNumbers,
        mnemonicStrength: 128, // use 24 words (256) for maximum security
        timeout: 90000, // 90 seconds timeout for React Native
      });
    console.log('Wallet created', walletInfo);
    console.log('Mnemonic', generatedMnemonic);
    
    // Store wallet for further testing
    setCurrentWallet(walletInfo);
    setWalletMnemonic(generatedMnemonic);

    // console.log(123123, this.chainKey);
    // // TODO: THIS should be a separate node chainkey
    // const privateKey = bytes_1.ByteUtils.hexStringToBytes(this.chainKey);
    // console.log(123123, privateKey);
    // const pubkey = await(0, keys_utils_1.getPublicViewingKey)(privateKey);
    // console.log(123123, pubkey);
  };

  // Test createDOPWallet function
  const handleCreateDOPWallet = async () => {
    try {
      console.log('Testing createDOPWallet...');
      const encryptionKey = getRandomBytes(32);
      
      // This uses the standard createOrImportDopWallet function
      const { walletInfo, mnemonic } = await createOrImportDopWallet(encryptionKey, {
        mnemonicStrength: 256, // 24 words for maximum security
        timeout: 90000,
      });
      
      setCurrentWallet(walletInfo);
      setWalletMnemonic(mnemonic);
      console.log('DOP Wallet created:', walletInfo);
      console.log('Mnemonic:', mnemonic);
    } catch (error) {
      console.error('createDOPWallet failed:', error);
    }
  };

  // Test loadWalletByID function
  const handleLoadWalletByID = async () => {
    if (!currentWallet?.id) {
      console.log('No wallet to load. Create a wallet first.');
      return;
    }

    try {
      console.log('Testing loadWalletByID...');
      const encryptionKey = getRandomBytes(32);
      
      const loadedWallet = await loadWalletByID(encryptionKey, currentWallet.id, false);
      console.log('Wallet loaded:', loadedWallet);
    } catch (error) {
      console.error('loadWalletByID failed:', error);
    }
  };

  // Test getWalletShareableViewingKey function
  const handleGetShareableViewingKey = async () => {
    if (!currentWallet?.id) {
      console.log('No wallet available. Create a wallet first.');
      return;
    }

    try {
      console.log('Testing getWalletShareableViewingKey...');
      
      const viewingKey = await getWalletShareableViewingKey(currentWallet.id);
      setShareableViewingKey(viewingKey);
      console.log('Shareable viewing key:', viewingKey);
    } catch (error) {
      console.error('getWalletShareableViewingKey failed:', error);
    }
  };

  // Test createViewOnlyDOPWallet function
  const handleCreateViewOnlyWallet = async () => {
    if (!shareableViewingKey) {
      console.log('No shareable viewing key. Generate one first.');
      return;
    }

    try {
      console.log('Testing createViewOnlyDOPWallet...');
      
      // createViewOnlyDopWallet typically needs additional parameters
      const encryptionKey = getRandomBytes(32);
      const viewOnlyWallet = await createViewOnlyDopWallet(encryptionKey, shareableViewingKey, {});
      console.log('View-only wallet created:', viewOnlyWallet);
    } catch (error) {
      console.error('createViewOnlyDOPWallet failed:', error);
    }
  };

  // Test generate_mnemonic function
  const handleGenerateMnemonic = async () => {
    try {
        const encryptionKey = getRandomBytes(32);
        const { walletInfo, mnemonic } = await createOrImportDopWallet(encryptionKey, {
          mnemonicStrength: 256, // 24 words (default: 128 = 12 words)
          timeout: 90000 // Recommended for React Native
        });
        console.log('Generated mnemonic:', mnemonic);
    } catch (error) {
      console.error('Mnemonic generation failed:', error);
    }
  };

  // Test get_wallet_mnemonic function
  const handleGetWalletMnemonic = async () => {
    if (!currentWallet?.id) {
      console.log('No wallet available. Create a wallet first.');
      return;
    }

    try {
      console.log('Testing getWalletMnemonic...');
      const encryptionKey = getRandomBytes(32);
        const { walletInfo, mnemonic } = await createOrImportDopWallet(encryptionKey, {
          mnemonicStrength: 256, // 24 words (default: 128 = 12 words)
          timeout: 90000 // Recommended for React Native
        });
        console.log('Generated mnemonic in test getting:', mnemonic);
      
      const retrievedMnemonic = await getWalletMnemonic(encryptionKey, walletInfo.id);
      console.log('Retrieved wallet mnemonic:', retrievedMnemonic);
    } catch (error) {
      console.error('getWalletMnemonic failed:', error);
      console.log('Current stored mnemonic:', walletMnemonic);
    }
  };

  // Encryption Key Management Functions

  // Test pbkdf2 function
  const handleTestPbkdf2 = async () => {
    try {
      console.log('Testing pbkdf2...');
      const password = 'test-password-123';
      const salt = getRandomBytes(32);
      const iterations = 100000;
      
      const derivedKey = await pbkdf2(password, salt, iterations);
      console.log('PBKDF2 derived key length:', derivedKey.length);
      console.log('PBKDF2 derived key (first 10 bytes):', Array.from(derivedKey.slice(0, 10)));
    } catch (error) {
      console.error('pbkdf2 failed:', error);
    }
  };

  // Test getRandomBytes function
  const handleTestGetRandomBytes = async () => {
    try {
      console.log('Testing getRandomBytes...');
      const randomBytes32 = getRandomBytes(32);
      const randomBytes16 = getRandomBytes(16);
      
      setRandomBytesResult(`32 bytes: ${Array.from(randomBytes32.slice(0, 8)).join(', ')}... | 16 bytes: ${Array.from(randomBytes16).join(', ')}`);
      console.log('Random 32 bytes:', Array.from(randomBytes32));
      console.log('Random 16 bytes:', Array.from(randomBytes16));
    } catch (error) {
      console.error('getRandomBytes failed:', error);
    }
  };

  // Test hashPasswordString function (fallback implementation)
  const handleTestHashPassword = async () => {
    try {
      console.log('Testing password hashing...');
      const password = testPassword;
      
      // Since hashPasswordString might not be available, use crypto or a fallback
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setHashedPassword(hashHex);
      console.log('Password hash (SHA-256):', hashHex);
    } catch (error) {
      console.error('Password hashing failed:', error);
    }
  };

  // Test setEncryptionKeyFromPassword function (simulation)
  const handleTestSetEncryptionKeyFromPassword = async () => {
    try {
      console.log('Testing encryption key derivation from password...');
      const password = testPassword;
      const salt = getRandomBytes(32);
      
      // Use pbkdf2 to derive encryption key from password
      const encryptionKey = await pbkdf2(password, salt, 100000);
      const keyHex = Array.from(encryptionKey).map(b => b.toString(16).padStart(2, '0')).join('');
      
      setEncryptionKeyFromPassword(keyHex);
      console.log('Encryption key derived from password:', keyHex);
    } catch (error) {
      console.error('Encryption key derivation failed:', error);
    }
  };

  // Test getEncryptionKeyFromPassword function (simulation)
  const handleTestGetEncryptionKeyFromPassword = async () => {
    try {
      console.log('Testing get encryption key from password...');
      if (!encryptionKeyFromPassword) {
        console.log('No encryption key available. Generate one first.');
        return;
      }
      
      console.log('Retrieved encryption key:', encryptionKeyFromPassword.substring(0, 20) + '...');
      console.log('Key length:', encryptionKeyFromPassword.length, 'characters');
    } catch (error) {
      console.error('Get encryption key failed:', error);
    }
  };

  // Test getEncryptionPrivateKeySignatureMessage function (simulation)
  const handleTestEncryptionSignatureMessage = async () => {
    try {
      console.log('Testing encryption private key signature message...');
      const message = 'Test message for signature';
      const privateKeyBytes = getRandomBytes(32);
      
      // Simulate signature message generation
      const encoder = new TextEncoder();
      const messageBytes = encoder.encode(message);
      const combinedData = new Uint8Array(privateKeyBytes.length + messageBytes.length);
      combinedData.set(privateKeyBytes);
      combinedData.set(messageBytes, privateKeyBytes.length);
      
      const signatureHash = await crypto.subtle.digest('SHA-256', combinedData);
      const signatureArray = Array.from(new Uint8Array(signatureHash));
      const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('Message:', message);
      console.log('Signature message hash:', signatureHex);
    } catch (error) {
      console.error('Encryption signature message failed:', error);
    }
  };

  // Private Balance Management Functions

  // Test setOnUTXOMerkletreeScanCallback function
  const handleSetUTXOScanCallback = async () => {
    try {
      console.log('Testing setOnUTXOMerkletreeScanCallback...');
      
      const callback = (progress: any) => {
        console.log('UTXO Merkletree scan progress:', progress);
        setScanProgress(`UTXO Scan: ${JSON.stringify(progress)}`);
      };
      
      setOnUTXOMerkletreeScanCallback(callback);
      console.log('UTXO scan callback set successfully');
    } catch (error) {
      console.error('setOnUTXOMerkletreeScanCallback failed:', error);
    }
  };

  // Test setOnTXIDMerkletreeScanCallback function
  const handleSetTXIDScanCallback = async () => {
    try {
      console.log('Testing setOnTXIDMerkletreeScanCallback...');
      
      const callback = (progress: any) => {
        console.log('TXID Merkletree scan progress:', progress);
        setScanProgress(`TXID Scan: ${JSON.stringify(progress)}`);
      };
      
      setOnTXIDMerkletreeScanCallback(callback);
      console.log('TXID scan callback set successfully');
    } catch (error) {
      console.error('setOnTXIDMerkletreeScanCallback failed:', error);
    }
  };

  // Test resetFullTXIDMerkletreesV2 function
  const handleResetTXIDMerkletrees = async () => {
    try {
      console.log('Testing resetFullTXIDMerkletreesV2...');
      
      // Use object format for Chain type
      const chain = { type: 0, id: 1 }; // Ethereum mainnet
      await resetFullTXIDMerkletreesV2(chain);
      setMerkletreeResetResult('TXID merkletrees reset successfully');
      console.log('TXID merkletrees reset completed');
    } catch (error) {
      console.error('resetFullTXIDMerkletreesV2 failed:', error);
      setMerkletreeResetResult('TXID merkletrees reset failed');
    }
  };

  // Test refreshBalances function
  const handleRefreshBalances = async () => {
    try {
      console.log('Testing refreshBalances...');
      
      const chain = { type: 0, id: 1 }; // Ethereum mainnet
      const walletFilter = []; // Empty filter for all wallets
      await refreshBalances(chain, walletFilter);
      setBalanceRefreshResult('Balances refreshed successfully');
      console.log('Balances refreshed successfully');
    } catch (error) {
      console.error('refreshBalances failed:', error);
      setBalanceRefreshResult('Balance refresh failed');
    }
  };

  // Test rescanFullUTXOMerkletreesAndWallets function
  const handleRescanUTXOMerkletreesAndWallets = async () => {
    try {
      console.log('Testing rescanFullUTXOMerkletreesAndWallets...');
      setScanProgress('Starting full UTXO merkletrees and wallets rescan...');
      
      const chain = { type: 0, id: 1 }; // Ethereum mainnet
      const walletFilter = []; // Empty filter for all wallets
      await rescanFullUTXOMerkletreesAndWallets(chain, walletFilter);
      setScanProgress('Full UTXO merkletrees and wallets rescan completed');
      console.log('Full UTXO merkletrees and wallets rescan completed');
    } catch (error) {
      console.error('rescanFullUTXOMerkletreesAndWallets failed:', error);
      setScanProgress('Full UTXO merkletrees and wallets rescan failed');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={true}
      >
        <Text>Hello World</Text>

        <Spacer height={50} />

      <Button onPress={handleStartEngine}>
        <Text style={{ color: 'white' }}>Start engine</Text>
      </Button>
      <Spacer height={50} />

      <Button onPress={checkEngineWork}>
        <Text style={{ color: 'white' }}>Check engine work</Text>
      </Button>
      <Spacer height={50} />

      <Button onPress={handleCreateWallet}>
        <Text style={{ color: 'white' }}>Create wallet</Text>
      </Button>
      <Spacer height={20} />

      {/* Wallet Management Functions */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
        Wallet Management Functions:
      </Text>

      <Button onPress={handleCreateDOPWallet}>
        <Text style={{ color: 'white' }}>Create DOP Wallet</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleLoadWalletByID}>
        <Text style={{ color: 'white' }}>Load Wallet By ID</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleGetShareableViewingKey}>
        <Text style={{ color: 'white' }}>Get Shareable Viewing Key</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleCreateViewOnlyWallet}>
        <Text style={{ color: 'white' }}>Create View-Only Wallet</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleGenerateMnemonic}>
        <Text style={{ color: 'white' }}>Generate Mnemonic By creating new Wallet</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleGetWalletMnemonic}>
        <Text style={{ color: 'white' }}>Get Wallet Mnemonic</Text>
      </Button>

      {/* Encryption Key Management Functions */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 20 }}>
        Encryption Key Management Functions:
      </Text>

      <Button onPress={handleTestPbkdf2}>
        <Text style={{ color: 'white' }}>Test PBKDF2</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleTestGetRandomBytes}>
        <Text style={{ color: 'white' }}>Test getRandomBytes</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleTestHashPassword}>
        <Text style={{ color: 'white' }}>Test Hash Password</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleTestSetEncryptionKeyFromPassword}>
        <Text style={{ color: 'white' }}>Set Encryption Key From Password</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleTestGetEncryptionKeyFromPassword}>
        <Text style={{ color: 'white' }}>Get Encryption Key From Password</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleTestEncryptionSignatureMessage}>
        <Text style={{ color: 'white' }}>Test Encryption Signature Message</Text>
      </Button>

      {/* Display current wallet info */}
      {currentWallet && (
        <View style={{ marginTop: 30, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Current Wallet:</Text>
          <Text>ID: {currentWallet.id}</Text>
          <Text>Address: {currentWallet.dopAddress}</Text>
        </View>
      )}

      {/* Display generated mnemonic */}
      {generatedMnemonic && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#e8f5e8', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Generated Mnemonic:</Text>
          <Text style={{ fontSize: 12 }}>{generatedMnemonic}</Text>
        </View>
      )}

      {/* Display shareable viewing key */}
      {shareableViewingKey && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#e8e8f5', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Shareable Viewing Key:</Text>
          <Text style={{ fontSize: 10 }}>{shareableViewingKey.substring(0, 50)}...</Text>
        </View>
      )}

      {/* Display encryption key management results */}
      {randomBytesResult && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#f5f5e8', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Random Bytes Result:</Text>
          <Text style={{ fontSize: 12 }}>{randomBytesResult}</Text>
        </View>
      )}

      {hashedPassword && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#f8e8e8', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Password Hash:</Text>
          <Text style={{ fontSize: 10 }}>{hashedPassword.substring(0, 50)}...</Text>
        </View>
      )}

      {encryptionKeyFromPassword && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#e8f8e8', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Encryption Key from Password:</Text>
          <Text style={{ fontSize: 10 }}>{encryptionKeyFromPassword.substring(0, 50)}...</Text>
        </View>
      )}

      {/* Private Balance Management Section */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 20 }}>
        Private Balance Management
      </Text>

      <Button onPress={handleSetUTXOScanCallback}>
        <Text style={{ color: 'white' }}>Set UTXO Scan Callback</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleSetTXIDScanCallback}>
        <Text style={{ color: 'white' }}>Set TXID Scan Callback</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleResetTXIDMerkletrees}>
        <Text style={{ color: 'white' }}>Reset TXID Merkletrees V2</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleRefreshBalances}>
        <Text style={{ color: 'white' }}>Refresh Balances</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleRescanUTXOMerkletreesAndWallets}>
        <Text style={{ color: 'white' }}>Rescan UTXO Merkletrees and Wallets</Text>
      </Button>

      {/* Display scan progress */}
      {scanProgress && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#f0f8ff', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Scan Progress:</Text>
          <Text style={{ fontSize: 12 }}>{scanProgress}</Text>
        </View>
      )}

      {/* Display balance refresh result */}
      {balanceRefreshResult && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#f8fff0', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Balance Refresh Result:</Text>
          <Text style={{ fontSize: 12 }}>{balanceRefreshResult}</Text>
        </View>
      )}

      {/* Display merkletree reset result */}
      {merkletreeResetResult && (
        <View style={{ marginTop: 15, padding: 15, backgroundColor: '#fff8f0', borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Merkletree Reset Result:</Text>
          <Text style={{ fontSize: 12 }}>{merkletreeResetResult}</Text>
        </View>
      )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
