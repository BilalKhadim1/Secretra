const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Find the project and workspace ROOTS
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force resolving react-native-svg to a single location to avoid duplicate view registration
config.resolver.extraNodeModules = {
  "react-native-svg": path.resolve(projectRoot, "node_modules/react-native-svg"),
};

// 4. Exclude the root version of react-native-svg to avoid duplicate view registration
// We use a regex that matches the root node_modules specifically
config.resolver.blockList = [
  new RegExp(path.resolve(workspaceRoot, 'node_modules', 'react-native-svg').replace(/[/\\]/g, '[/\\\\]') + '.*')
];

// 5. Inject headers to allow Google OAuth popups to work on Web
config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Allow popups to communicate back for OAuth
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
