module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
          },
        },
      ],
      // react-native-reanimated MUST always be the LAST plugin
      // Note: react-native-worklets/plugin was removed as it is now built into Reanimated v4
      'react-native-reanimated/plugin',
    ],
  };
};
