const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

// Add TypeScript extensions
config.resolver.sourceExts.push('ts', 'tsx', 'cjs');

// This is the new line you should add in, after the previous lines
config.resolver.unstable_enablePackageExports = false;

module.exports = config;