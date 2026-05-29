const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Support .cjs files (some libs need this)
config.resolver.sourceExts.push("cjs");

module.exports = config;
