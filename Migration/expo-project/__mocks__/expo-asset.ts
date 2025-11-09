// Mock for expo-asset module
export class Asset {
  static loadAsync = jest.fn().mockResolvedValue([]);
  static fromModule = jest.fn().mockReturnValue({
    downloadAsync: jest.fn().mockResolvedValue(undefined),
  });

  downloadAsync = jest.fn().mockResolvedValue(undefined);
}

export default {
  Asset,
};
