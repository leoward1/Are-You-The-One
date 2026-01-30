const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable node externals to avoid Windows path issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
