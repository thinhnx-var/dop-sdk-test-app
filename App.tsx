import React, { useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
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

async function testNodeDerivation(addLog?: (message: string, type?: 'info' | 'error' | 'success' | 'warning', data?: any) => void) {
  const logFunction = addLog || console.log;
  
  if (addLog) {
    addLog('Testing wallet node derivation...', 'info');
  } else {
    console.log('Testing wallet node derivation...');
  }

  try {
    const privateKey = new Uint8Array([
      116, 155, 232, 38, 24, 222, 242, 243, 143, 196, 220, 250, 151, 96, 61,
      103, 199, 69, 229, 147, 233, 136, 142, 124, 201, 79, 215, 25, 61, 64, 181,
      76,
    ]);

    const publicViewingKey = await getPublicViewingKey(privateKey);
    
    if (addLog) {
      addLog('Node derivation completed successfully', 'success', { 
        privateKeyLength: privateKey.length,
        publicViewingKeyLength: publicViewingKey.length
      });
    } else {
      console.log({ publicViewingKey });
    }
  } catch (error) {
    if (addLog) {
      addLog('Node derivation failed', 'error', error);
    } else {
      console.error(error);
    }
  }
}

type Props = {};

// Log entry interface
interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'success' | 'warning';
  message: string;
  data?: any;
}

const App = (props: Props) => {
  // Console log state for visual display
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(true);
  
  // Helper function to add logs
  const addLog = (message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info', data?: any) => {
    const logEntry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data
    };
    
    setLogs(prevLogs => [logEntry, ...prevLogs.slice(0, 49)]); // Keep last 50 logs
    
    // Still log to console for debugging
    if (type === 'error') {
      console.error(message, data);
    } else {
      console.log(message, data);
    }
    
    // Show alert for errors
    if (type === 'error') {
      Alert.alert('Error', message, [{ text: 'OK' }]);
    }
  };

  // Helper function to clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };

  // Wrapper function for testNodeDerivation
  const handleTestNodeDerivation = async () => {
    await testNodeDerivation(addLog);
  };

  // Add initial welcome log
  React.useEffect(() => {
    addLog('DOP SDK Test App initialized', 'success');
    addLog('Press buttons below to test different DOP SDK functions', 'info');
  }, []);
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
      addLog('Starting DOP Engine initialization...', 'info');

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

      addLog('DOP Engine initialized successfully', 'success');
      return true;
    } catch (error) {
      addLog('DOP Engine initialization failed', 'error', error);
      throw error;
    }
  };

  const handleStartEngine = async () => {
    addLog('Starting engine...', 'info');

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
    addLog('Circomlibjs status checked', 'success', status);
    initializeDopEngine();
  };

  const checkEngineWork = () => {
    const engine = getEngine();
    if (engine) {
      addLog('Engine is working properly', 'success', { engineExists: true });
    } else {
      addLog('Engine is not working', 'error', { engineExists: false });
    }
  };

  const handleCreateWallet = async () => {
    const encryptionKey = getRandomBytes(32);

    addLog('Creating wallet...', 'info', { encryptionKeyLength: encryptionKey.length });

    const { walletInfo, mnemonic: generatedMnemonic } =
      await createOrImportDopWallet(encryptionKey, {
        // creationBlockNumbers,
        mnemonicStrength: 128, // use 24 words (256) for maximum security
        timeout: 90000, // 90 seconds timeout for React Native
      });
    
    addLog('Wallet created successfully', 'success', { 
      walletId: walletInfo.id,
      dopAddress: walletInfo.dopAddress 
    });
    addLog('Mnemonic generated', 'info', { mnemonicWords: generatedMnemonic.split(' ').length });
    
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
      addLog('Testing createDOPWallet...', 'info');
      const encryptionKey = getRandomBytes(32);
      
      // This uses the standard createOrImportDopWallet function
      const { walletInfo, mnemonic } = await createOrImportDopWallet(encryptionKey, {
        mnemonicStrength: 256, // 24 words for maximum security
        timeout: 90000,
      });
      
      setCurrentWallet(walletInfo);
      setWalletMnemonic(mnemonic);
      addLog('DOP Wallet created successfully', 'success', { 
        walletId: walletInfo.id,
        dopAddress: walletInfo.dopAddress,
        mnemonicWords: mnemonic.split(' ').length 
      });
    } catch (error) {
      addLog('createDOPWallet failed', 'error', error);
    }
  };

  // Test loadWalletByID function
  const handleLoadWalletByID = async () => {
    if (!currentWallet?.id) {
      addLog('No wallet to load. Create a wallet first.', 'warning');
      return;
    }

    try {
      addLog('Testing loadWalletByID...', 'info');
      const encryptionKey = getRandomBytes(32);
      
      const loadedWallet = await loadWalletByID(encryptionKey, currentWallet.id, false);
      addLog('Wallet loaded successfully', 'success', { walletId: loadedWallet.id });
    } catch (error) {
      addLog('loadWalletByID failed', 'error', error);
    }
  };

  // Test getWalletShareableViewingKey function
  const handleGetShareableViewingKey = async () => {
    if (!currentWallet?.id) {
      addLog('No wallet available. Create a wallet first.', 'warning');
      return;
    }

    try {
      addLog('Testing getWalletShareableViewingKey...', 'info');
      
      const viewingKey = await getWalletShareableViewingKey(currentWallet.id);
      setShareableViewingKey(viewingKey);
      addLog('Shareable viewing key generated', 'success', { 
        keyLength: viewingKey.length,
        keyPreview: viewingKey.substring(0, 20) + '...'
      });
    } catch (error) {
      addLog('getWalletShareableViewingKey failed', 'error', error);
    }
  };

  // Test createViewOnlyDOPWallet function
  const handleCreateViewOnlyWallet = async () => {
    if (!shareableViewingKey) {
      addLog('No shareable viewing key. Generate one first.', 'warning');
      return;
    }

    try {
      addLog('Testing createViewOnlyDOPWallet...', 'info');
      
      // createViewOnlyDopWallet typically needs additional parameters
      const encryptionKey = getRandomBytes(32);
      const viewOnlyWallet = await createViewOnlyDopWallet(encryptionKey, shareableViewingKey, {});
      addLog('View-only wallet created successfully', 'success', { 
        walletId: viewOnlyWallet.id,
        walletType: 'view-only' 
      });
    } catch (error) {
      addLog('createViewOnlyDOPWallet failed', 'error', error);
    }
  };

  // Test generate_mnemonic function
  const handleGenerateMnemonic = async () => {
    try {
        addLog('Testing mnemonic generation...', 'info');
        const encryptionKey = getRandomBytes(32);
        const { walletInfo, mnemonic } = await createOrImportDopWallet(encryptionKey, {
          mnemonicStrength: 256, // 24 words (default: 128 = 12 words)
          timeout: 90000 // Recommended for React Native
        });
        addLog('Mnemonic generated successfully', 'success', { 
          mnemonicWords: mnemonic.split(' ').length,
          walletId: walletInfo.id,
          firstThreeWords: mnemonic.split(' ').slice(0, 3).join(' ') + '...'
        });
    } catch (error) {
      addLog('Mnemonic generation failed', 'error', error);
    }
  };

  // Test get_wallet_mnemonic function
  const handleGetWalletMnemonic = async () => {
    if (!currentWallet?.id) {
      addLog('No wallet available. Create a wallet first.', 'warning');
      return;
    }

    try {
      addLog('Testing getWalletMnemonic...', 'info');
      const encryptionKey = getRandomBytes(32);
        const { walletInfo, mnemonic } = await createOrImportDopWallet(encryptionKey, {
          mnemonicStrength: 256, // 24 words (default: 128 = 12 words)
          timeout: 90000 // Recommended for React Native
        });
        addLog('Generated test wallet for mnemonic retrieval', 'info', { 
          walletId: walletInfo.id,
          mnemonicWords: mnemonic.split(' ').length 
        });
      
      const retrievedMnemonic = await getWalletMnemonic(encryptionKey, walletInfo.id);
      addLog('Wallet mnemonic retrieved successfully', 'success', { 
        retrievedWords: retrievedMnemonic.split(' ').length,
        firstThreeWords: retrievedMnemonic.split(' ').slice(0, 3).join(' ') + '...'
      });
    } catch (error) {
      addLog('getWalletMnemonic failed', 'error', error);
      if (walletMnemonic) {
        addLog('Fallback: Current stored mnemonic available', 'info', { 
          storedWords: walletMnemonic.split(' ').length 
        });
      }
    }
  };

  // Encryption Key Management Functions

  // Test pbkdf2 function
  const handleTestPbkdf2 = async () => {
    try {
      addLog('Testing pbkdf2...', 'info');
      const password = 'test-password-123';
      const salt = getRandomBytes(32);
      const iterations = 100000;
      
      const derivedKey = await pbkdf2(password, salt, iterations);
      addLog('PBKDF2 key derivation successful', 'success', {
        derivedKeyLength: derivedKey.length,
        iterations: iterations,
        firstTenBytes: Array.from(derivedKey.slice(0, 10))
      });
    } catch (error) {
      addLog('pbkdf2 failed', 'error', error);
    }
  };

  // Test getRandomBytes function
  const handleTestGetRandomBytes = async () => {
    try {
      addLog('Testing getRandomBytes...', 'info');
      const randomBytes32 = getRandomBytes(32);
      const randomBytes16 = getRandomBytes(16);
      
      const resultText = `32 bytes: ${Array.from(randomBytes32.slice(0, 8)).join(', ')}... | 16 bytes: ${Array.from(randomBytes16).join(', ')}`;
      setRandomBytesResult(resultText);
      addLog('Random bytes generated successfully', 'success', {
        bytes32Length: randomBytes32.length,
        bytes16Length: randomBytes16.length,
        sample32: Array.from(randomBytes32.slice(0, 8)),
        full16: Array.from(randomBytes16)
      });
    } catch (error) {
      addLog('getRandomBytes failed', 'error', error);
    }
  };

  // Test hashPasswordString function (fallback implementation)
  const handleTestHashPassword = async () => {
    try {
      addLog('Testing password hashing...', 'info');
      const password = testPassword;
      
      // Since hashPasswordString might not be available, use crypto or a fallback
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      setHashedPassword(hashHex);
      addLog('Password hashed successfully (SHA-256)', 'success', {
        passwordLength: password.length,
        hashLength: hashHex.length,
        hashPreview: hashHex.substring(0, 20) + '...'
      });
    } catch (error) {
      addLog('Password hashing failed', 'error', error);
    }
  };

  // Test setEncryptionKeyFromPassword function (simulation)
  const handleTestSetEncryptionKeyFromPassword = async () => {
    try {
      addLog('Testing encryption key derivation from password...', 'info');
      const password = testPassword;
      const salt = getRandomBytes(32);
      
      // Use pbkdf2 to derive encryption key from password
      const encryptionKey = await pbkdf2(password, salt, 100000);
      const keyHex = Buffer.from(encryptionKey).toString('hex');
      
      setEncryptionKeyFromPassword(keyHex);
      addLog('Encryption key derived from password successfully', 'success', {
        keyLength: keyHex.length,
        keyPreview: keyHex.substring(0, 20) + '...'
      });
    } catch (error) {
      addLog('Encryption key derivation failed', 'error', error);
    }
  };

  // Test getEncryptionKeyFromPassword function (simulation)
  const handleTestGetEncryptionKeyFromPassword = async () => {
    try {
      addLog('Testing get encryption key from password...', 'info');
      if (!encryptionKeyFromPassword) {
        addLog('No encryption key available. Generate one first.', 'warning');
        return;
      }
      
      addLog('Encryption key retrieved successfully', 'success', {
        keyPreview: encryptionKeyFromPassword.substring(0, 20) + '...',
        keyLength: encryptionKeyFromPassword.length,
        keyType: 'derived-from-password'
      });
    } catch (error) {
      addLog('Get encryption key failed', 'error', error);
    }
  };

  // Test getEncryptionPrivateKeySignatureMessage function (simulation)
  const handleTestEncryptionSignatureMessage = async () => {
    try {
      addLog('Testing encryption private key signature message...', 'info');
      const message = 'Test message for signature';
      const privateKeyBytes = getRandomBytes(32);
      
      // Simulate signature message generation - simple approach
      const messageHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
      const hashArray = Array.from(new Uint8Array(messageHash));
      const signatureHex = Buffer.from(hashArray).toString('hex');
      
      addLog('Encryption signature message generated', 'success', {
        message: message,
        signatureHashPreview: signatureHex.substring(0, 20) + '...',
        signatureLength: signatureHex.length,
        privateKeyType: typeof privateKeyBytes
      });
    } catch (error) {
      addLog('Encryption signature message failed', 'error', error);
    }
  };

  // Private Balance Management Functions

  // Test setOnUTXOMerkletreeScanCallback function
  const handleSetUTXOScanCallback = async () => {
    try {
      addLog('Testing setOnUTXOMerkletreeScanCallback...', 'info');
      
      const callback = (progress: any) => {
        const progressMessage = `UTXO Scan: ${JSON.stringify(progress)}`;
        addLog('UTXO Merkletree scan progress update', 'info', progress);
        setScanProgress(progressMessage);
      };
      
      setOnUTXOMerkletreeScanCallback(callback);
      addLog('UTXO scan callback set successfully', 'success');
    } catch (error) {
      addLog('setOnUTXOMerkletreeScanCallback failed', 'error', error);
    }
  };

  // Test setOnTXIDMerkletreeScanCallback function
  const handleSetTXIDScanCallback = async () => {
    try {
      addLog('Testing setOnTXIDMerkletreeScanCallback...', 'info');
      
      const callback = (progress: any) => {
        const progressMessage = `TXID Scan: ${JSON.stringify(progress)}`;
        addLog('TXID Merkletree scan progress update', 'info', progress);
        setScanProgress(progressMessage);
      };
      
      setOnTXIDMerkletreeScanCallback(callback);
      addLog('TXID scan callback set successfully', 'success');
    } catch (error) {
      addLog('setOnTXIDMerkletreeScanCallback failed', 'error', error);
    }
  };

  // Test resetFullTXIDMerkletreesV2 function
  const handleResetTXIDMerkletrees = async () => {
    try {
      addLog('Testing resetFullTXIDMerkletreesV2...', 'info');
      
      // Use object format for Chain type
      const chain = { type: 0, id: 1 }; // Ethereum mainnet
      await resetFullTXIDMerkletreesV2(chain);
      setMerkletreeResetResult('TXID merkletrees reset successfully');
      addLog('TXID merkletrees reset completed', 'success');
    } catch (error) {
      addLog('resetFullTXIDMerkletreesV2 failed', 'error', error);
      setMerkletreeResetResult('TXID merkletrees reset failed');
    }
  };

  // Test refreshBalances function
  const handleRefreshBalances = async () => {
    try {
      addLog('Testing refreshBalances...', 'info');
      
      const chain = { type: 0, id: 1 }; // Ethereum mainnet
      const walletFilter: string[] = []; // Empty filter for all wallets
      await refreshBalances(chain, walletFilter);
      setBalanceRefreshResult('Balances refreshed successfully');
      addLog('Balances refreshed successfully', 'success');
    } catch (error) {
      addLog('refreshBalances failed', 'error', error);
      setBalanceRefreshResult('Balance refresh failed');
    }
  };

  // Test rescanFullUTXOMerkletreesAndWallets function
  const handleRescanUTXOMerkletreesAndWallets = async () => {
    try {
      addLog('Testing rescanFullUTXOMerkletreesAndWallets...', 'info');
      setScanProgress('Starting full UTXO merkletrees and wallets rescan...');
      
      const chain = { type: 0, id: 1 }; // Ethereum mainnet
      const walletFilter: string[] = []; // Empty filter for all wallets
      await rescanFullUTXOMerkletreesAndWallets(chain, walletFilter);
      setScanProgress('Full UTXO merkletrees and wallets rescan completed');
      addLog('Full UTXO merkletrees and wallets rescan completed', 'success');
    } catch (error) {
      addLog('rescanFullUTXOMerkletreesAndWallets failed', 'error', error);
      setScanProgress('Full UTXO merkletrees and wallets rescan failed');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Fixed Console Log Display at the top */}
      <View style={{ 
        backgroundColor: '#1a1a1a', 
        borderBottomWidth: 2,
        borderBottomColor: '#333',
        maxHeight: 350,
        minHeight: 200
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#333',
          padding: 15
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Console Output</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={() => setShowLogs(!showLogs)}
              style={{ 
                backgroundColor: '#555', 
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                borderRadius: 4, 
                marginRight: 8 
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>
                {showLogs ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={clearLogs}
              style={{ 
                backgroundColor: '#d32f2f', 
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                borderRadius: 4 
              }}
            >
              <Text style={{ color: 'white', fontSize: 12 }}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {showLogs && (
          <ScrollView 
            style={{ flex: 1, padding: 15 }}
            nestedScrollEnabled={true}
          >
            {logs.length === 0 ? (
              <Text style={{ color: '#888', fontStyle: 'italic' }}>
                No logs yet. Press a button to start testing!
              </Text>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ 
                      color: log.type === 'error' ? '#f44336' : 
                             log.type === 'success' ? '#4caf50' : 
                             log.type === 'warning' ? '#ff9800' : '#2196f3',
                      fontSize: 10,
                      marginRight: 8
                    }}>
                      [{log.type.toUpperCase()}]
                    </Text>
                    <Text style={{ color: '#888', fontSize: 10 }}>
                      {log.timestamp}
                    </Text>
                  </View>
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 12,
                    marginBottom: 4
                  }}>
                    {log.message}
                  </Text>
                  {log.data && (
                    <Text style={{ 
                      color: '#aaa', 
                      fontSize: 10,
                      fontFamily: 'monospace',
                      backgroundColor: '#222',
                      padding: 8,
                      borderRadius: 4
                    }}>
                      {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>

      {/* Scrollable content area below console */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={true}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
          DOP SDK Test App
        </Text>

        {/* Status Summary */}
        <View style={{ 
          backgroundColor: '#f5f5f5', 
          borderRadius: 8, 
          padding: 15,
          marginBottom: 20 
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Quick Status Summary
          </Text>
          <Text style={{ marginBottom: 5 }}>
            💼 Wallet: {currentWallet ? `✅ Created (${currentWallet.id.substring(0, 8)}...)` : '❌ Not Created'}
          </Text>
          <Text style={{ marginBottom: 5 }}>
            🔑 Viewing Key: {shareableViewingKey ? '✅ Generated' : '❌ Not Generated'}
          </Text>
          <Text style={{ marginBottom: 5 }}>
            📝 Mnemonic: {walletMnemonic ? `✅ Available (${walletMnemonic.split(' ').length} words)` : '❌ Not Available'}
          </Text>
          <Text>
            📊 Total Test Logs: {logs.length}
          </Text>
        </View>

        <Text>Hello World</Text>

        <Spacer height={50} />

      <Button onPress={handleStartEngine}>
        <Text style={{ color: 'white' }}>Start engine</Text>
      </Button>
      <Spacer height={50} />

      <Button onPress={checkEngineWork}>
        <Text style={{ color: 'white' }}>Check engine work</Text>
      </Button>
      <Spacer height={20} />

      <Button onPress={handleTestNodeDerivation}>
        <Text style={{ color: 'white' }}>Test Node Derivation</Text>
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
