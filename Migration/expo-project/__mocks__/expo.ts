// Mock for expo module to bypass winter runtime in tests
export const registerRootComponent = jest.fn();
export const NativeModulesProxy = {};
export const requireNativeViewManager = jest.fn();

// Mock winter runtime globals
if (typeof global !== 'undefined') {
  (global as any).__ExpoImportMetaRegistry = new Map();
}

export default {
  registerRootComponent,
  NativeModulesProxy,
  requireNativeViewManager,
};
