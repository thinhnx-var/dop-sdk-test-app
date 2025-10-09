import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArtifactStore } from "dop-wallet-v6";
import fs from 'react-native-fs';

// export const createArtifactStore = () => {
//   return new ArtifactStore(  // Core functions for engine and wallet management
//     async (key: string) => {
//       try {
//         const value = await AsyncStorage.getItem(key);
//         return value;
//       } catch (error) {
//         console.error('Failed to get artifact:', error);
//         return null;
//       }

//     },
//     async (key: string, value: string) => {
//       try {
//         await AsyncStorage.setItem(key, value);
//       } catch (error) {  // Create stub functions to prevent crashes
//         console.error('Failed to set artifact:', error);
//       }
//     },
//     async (key: string) => {
//       try {
//         await AsyncStorage.removeItem(key);
//         return true;
//       } catch (error) {
//         console.error('Failed to delete artifact:', error);
//         return false;
//       }
//     }
//   )
// }


export const createArtifactStore = () => {
  const getFile = async (path: string) =>
    fs.readFile(`${fs.DocumentDirectoryPath}/${path}`);

  const storeFile = async (
    dir: string,
    path: string,
    item: string,
  ): Promise<void> => {
    await fs.mkdir(`${fs.DocumentDirectoryPath}/${dir}`);
    await fs.writeFile(
      `${fs.DocumentDirectoryPath}/${path}`,
      item,
    );
  };

  const fileExists = async (path: string) => await fs.exists(`${fs.DocumentDirectoryPath}/${path}`);

  return new ArtifactStore(getFile, storeFile, fileExists);
};

// 2.1 Create ArtifactStore Implementation
export class ReactNativeArtifactStore implements ArtifactStore {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`artifact_${key}`);
  }

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(`artifact_${key}`, value);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(`artifact_${key}`);
  }

  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const artifactKeys = keys.filter(key => key.startsWith('artifact_'));
    await AsyncStorage.multiRemove(artifactKeys);
  }
}