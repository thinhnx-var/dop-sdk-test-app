import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { Spacer } from './Spacer';
import { Button } from './Button';
import {
  startDopEngineReactNative,
  getEngine,
  getRandomBytes,
  createOrImportDopWallet,
  testCircomlibjs,
  getPublicViewingKey,
} from 'dop-wallet-v6';
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
  console.log('🧪 Testing wallet node derivation...');

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

    // console.log(123123, this.chainKey);
    // // TODO: THIS should be a separate node chainkey
    // const privateKey = bytes_1.ByteUtils.hexStringToBytes(this.chainKey);
    // console.log(123123, privateKey);
    // const pubkey = await(0, keys_utils_1.getPublicViewingKey)(privateKey);
    // console.log(123123, pubkey);
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
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
    </SafeAreaView>
  );
};

export default App;
