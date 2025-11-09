// Jest setup file - runs before any tests
// This sets up the Expo winter runtime globals before any modules are loaded

// Mock the __ExpoImportMetaRegistry global
global.__ExpoImportMetaRegistry = new Map();

// Mock structuredClone if not available (needed by Expo winter runtime)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock other Expo winter globals if needed
global.__expo_module_bundler_require_context__ = () => ({
  keys: () => [],
  resolve: () => '',
});
